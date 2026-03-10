import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { randomBytes, scryptSync } from "crypto";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment");
  }

  console.log("🧹 Clearing database...");

  await prisma.$transaction(async (tx) => {
    await tx.fileTag.deleteMany();
    await tx.folderTag.deleteMany();
    await tx.share.deleteMany();
    await tx.recentAccess.deleteMany();

    await tx.uploadChunk.deleteMany();
    await tx.uploadSession.deleteMany();

    await tx.file.deleteMany();
    await tx.folder.deleteMany();
    await tx.tag.deleteMany();
    await tx.fileBlob.deleteMany();

    await tx.refreshToken.deleteMany();
    await tx.passwordResetToken.deleteMany();
    await tx.emailVerificationToken.deleteMany();

    await tx.supportReply.deleteMany();
    await tx.supportTicket.deleteMany();
    await tx.adminLog.deleteMany();
    await tx.storageRequest.deleteMany();

    await tx.storageConfig.deleteMany();
    await tx.storageStats.deleteMany();

    await tx.user.deleteMany();
  });

  console.log("🌱 Seeding admin user...");

  await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      role: "ADMIN",
      provider: "CREDENTIALS",
      password: hashPassword(password),
      emailVerified: new Date(),
    },
  });

  console.log(`✅ Admin seeded: ${email.toLowerCase()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
