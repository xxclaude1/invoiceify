/**
 * Promote a user to admin by email.
 *
 * Usage:
 *   npx tsx scripts/promote-admin.ts user@example.com
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: npx tsx scripts/promote-admin.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  if (user.role === "admin") {
    console.log(`${email} is already an admin.`);
    process.exit(0);
  }

  await prisma.user.update({
    where: { email },
    data: { role: "admin" },
  });

  console.log(`Successfully promoted ${email} to admin!`);
  console.log(`They can now access the admin panel at /admin`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
