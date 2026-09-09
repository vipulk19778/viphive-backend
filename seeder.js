const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const connectDB = require("./config/db.config");
const User = require("./model/user.model");
const Product = require("./model/product.model");
const Order = require("./model/order.model");
const Otp = require("./model/otp.model");
const { ORDER_STATUSES } = require("./config/order.config");
const { PAYMENT_STATUSES } = require("./config/payment.config");

dotenv.config();

const seedUserPassword = process.env.SEED_USER_PASSWORD;

const ensureSafeEnvironment = () => {
  if (process.env.NODE_ENV === "production") {
    console.error("Seeder blocked: seeding is not allowed in production.");
    process.exit(1);
  }

  let databaseName;

  try {
    databaseName = new URL(process.env.MONGO_URI).pathname.slice(1);
  } catch {
    console.error("Seeder blocked: MONGO_URI is invalid.");
    process.exit(1);
  }

  if (databaseName === "production") {
    console.error(
      "Seeder blocked: the MongoDB database must not be named production.",
    );
    process.exit(1);
  }
};

const ensureSeedCredentials = () => {
  const missingCredentials = [["SEED_USER_PASSWORD", seedUserPassword]]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingCredentials.length > 0) {
    throw new Error(
      `Missing required seeder environment variables: ${missingCredentials.join(
        ", ",
      )}`,
    );
  }
};

const confirmImport = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const warningMessage = [
    "WARNING: This operation will delete existing data from the following collections:",
    "- orders",
    "- products",
    "- users",
    "- otps",
    "Type YES to continue: ",
  ].join("\n");

  const answer = await new Promise((resolve) => {
    rl.question(warningMessage, resolve);
  });

  rl.close();

  return answer.trim() === "YES";
};

const userSeeds = [
  {
    name: "VIPHive Admin",
    email: "admin@viphive.com",
    password: seedUserPassword,
    role: "user",
    verified: true,
  },
  {
    name: "John User",
    email: "user@viphive.com",
    password: seedUserPassword,
    role: "user",
    verified: true,
  },
  {
    name: "Ava Buyer",
    email: "ava@viphive.com",
    password: seedUserPassword,
    role: "user",
    verified: true,
  },
];

const productSeeds = [
  {
    name: "Classic Cotton T-Shirt",
    description: "Soft cotton t-shirt for everyday wear.",
    price: 799,
    category: "fashion",
    stock: 100,
    imageUrl:
      "https://images.pexels.com/photos/1007018/pexels-photo-1007018.jpeg",
    rating: 4.3,
    numReviews: 28,
  },
  {
    name: "Wireless Earbuds Pro",
    description: "Noise-isolation earbuds with fast charging case.",
    price: 2999,
    category: "electronics",
    stock: 60,
    imageUrl:
      "https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg",
    rating: 4.6,
    numReviews: 74,
  },
  {
    name: "Ergonomic Office Chair",
    description: "Breathable mesh chair with lumbar support.",
    price: 8999,
    category: "furniture",
    stock: 24,
    imageUrl:
      "https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg",
    rating: 4.5,
    numReviews: 19,
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Vacuum-insulated bottle, keeps drinks cold for hours.",
    price: 599,
    category: "lifestyle",
    stock: 140,
    imageUrl:
      "https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg",
    rating: 4.2,
    numReviews: 35,
  },
];

const buildAddress = (name) => ({
  fullName: name,
  street: "221B Baker Street",
  city: "Mumbai",
  state: "Maharashtra",
  postalCode: "400001",
  country: "India",
});

const buildOrderSeed = ({
  userId,
  items,
  totalAmount,
  status,
  paymentStatus,
  offsetDays,
}) => {
  const verifiedAt =
    paymentStatus === PAYMENT_STATUSES.VERIFIED ? new Date() : null;
  const failedAt =
    paymentStatus === PAYMENT_STATUSES.FAILED ? new Date() : null;

  if (verifiedAt && offsetDays) {
    verifiedAt.setDate(verifiedAt.getDate() - offsetDays);
  }

  const razorpayOrderId = `order_seed_${Math.random().toString(36).slice(2, 10)}`;
  const paymentId =
    paymentStatus === PAYMENT_STATUSES.VERIFIED
      ? `pay_seed_${Math.random().toString(36).slice(2, 10)}`
      : null;

  return {
    user: userId,
    items,
    totalAmount,
    address: buildAddress("VIPHive Customer"),
    status,
    paymentStatus,
    razorpayOrderId,
    paymentId,
    paymentVerifiedAt: verifiedAt,
    paymentFailedAt: failedAt,
  };
};

const importData = async () => {
  try {
    await connectDB();

    await Promise.all([
      Order.deleteMany(),
      Product.deleteMany(),
      User.deleteMany(),
      Otp.deleteMany(),
    ]);

    const hashedUsers = await Promise.all(
      userSeeds.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      })),
    );

    const insertedUsers = await User.insertMany(hashedUsers);
    const insertedProducts = await Product.insertMany(productSeeds);

    const customerOne = insertedUsers.find((user) => user.role === "user");
    const customerTwo = insertedUsers.filter((user) => user.role === "user")[1];

    const productOne = insertedProducts[0];
    const productTwo = insertedProducts[1];
    const productThree = insertedProducts[2];

    const orderSeeds = [
      buildOrderSeed({
        userId: customerOne._id,
        items: [
          { product: productOne._id, qty: 2, price: productOne.price },
          { product: productTwo._id, qty: 1, price: productTwo.price },
        ],
        totalAmount: productOne.price * 2 + productTwo.price,
        status: ORDER_STATUSES.SHIPPED,
        paymentStatus: PAYMENT_STATUSES.VERIFIED,
        offsetDays: 2,
      }),
      buildOrderSeed({
        userId: customerTwo._id,
        items: [
          { product: productThree._id, qty: 1, price: productThree.price },
        ],
        totalAmount: productThree.price,
        status: ORDER_STATUSES.PENDING,
        paymentStatus: PAYMENT_STATUSES.CREATED,
        offsetDays: 0,
      }),
      buildOrderSeed({
        userId: customerOne._id,
        items: [{ product: productTwo._id, qty: 1, price: productTwo.price }],
        totalAmount: productTwo.price,
        status: ORDER_STATUSES.CANCELLED,
        paymentStatus: PAYMENT_STATUSES.FAILED,
        offsetDays: 0,
      }),
      buildOrderSeed({
        userId: customerTwo._id,
        items: [{ product: productOne._id, qty: 3, price: productOne.price }],
        totalAmount: productOne.price * 3,
        status: ORDER_STATUSES.DELIVERED,
        paymentStatus: PAYMENT_STATUSES.VERIFIED,
        offsetDays: 8,
      }),
    ];

    await Order.insertMany(orderSeeds);

    console.log("Seed data imported successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeder import failed:", error.message);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    await Promise.all([
      Order.deleteMany(),
      Product.deleteMany(),
      User.deleteMany(),
      Otp.deleteMany(),
    ]);

    console.log("Seed data destroyed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seeder destroy failed:", error.message);
    process.exit(1);
  }
};

const run = async () => {
  ensureSafeEnvironment();

  if (process.argv[2] === "-d") {
    await destroyData();
    return;
  }

  ensureSeedCredentials();

  const confirmed = await confirmImport();

  if (!confirmed) {
    console.log("Seeder aborted. Type YES to run import.");
    process.exit(0);
  }

  await importData();
};

run().catch((error) => {
  console.error("Seeder failed:", error.message);
  process.exit(1);
});
