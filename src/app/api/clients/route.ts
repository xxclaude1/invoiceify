import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/clients — List clients for the logged-in user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: clients });
}

// POST /api/clients — Create a new client
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { name, email, phone, address, taxId } = body;

  if (!name) {
    return NextResponse.json(
      { success: false, error: "Client name is required" },
      { status: 400 }
    );
  }

  const client = await prisma.client.create({
    data: {
      id: crypto.randomUUID(),
      userId: session.user.id,
      name,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      taxId: taxId || undefined,
    },
  });

  return NextResponse.json({ success: true, data: client }, { status: 201 });
}

// PUT /api/clients — Update a client
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { id, name, email, phone, address, taxId } = body;

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Client ID is required" },
      { status: 400 }
    );
  }

  // Verify ownership
  const existing = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json(
      { success: false, error: "Client not found" },
      { status: 404 }
    );
  }

  const client = await prisma.client.update({
    where: { id },
    data: {
      name: name || existing.name,
      email: email ?? existing.email,
      phone: phone ?? existing.phone,
      address: address ?? existing.address,
      taxId: taxId ?? existing.taxId,
    },
  });

  return NextResponse.json({ success: true, data: client });
}

// DELETE /api/clients — Delete a client
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Client ID is required" },
      { status: 400 }
    );
  }

  const existing = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json(
      { success: false, error: "Client not found" },
      { status: 404 }
    );
  }

  await prisma.client.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
