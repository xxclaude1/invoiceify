import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// ONE-TIME setup endpoint — creates admin account then should be removed
export async function GET() {
  try {
    const email = "Invoiceify@gmail.com";
    const password = "Invoiceify123!";
    const name = "Invoiceify Admin";

    // Check if already exists
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      // Just make sure it's admin
      await prisma.user.update({
        where: { email },
        data: { role: "admin" },
      });
      return NextResponse.json({ success: true, message: "Admin account already exists — role confirmed as admin." });
    }

    // Create the account
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        provider: "email",
        role: "admin",
      },
    });

    return NextResponse.json({ success: true, message: "Admin account created successfully." });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Setup failed",
    }, { status: 500 });
  }
}
