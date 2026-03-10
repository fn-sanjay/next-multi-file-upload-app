import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma, type TransactionClient } from "@/lib/server/prisma";
import { getAuthPayload } from "@/lib/server/auth/auth";

const replyTicketSchema = z.object({
  message: z.string().min(1).max(5000),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const payload = await getAuthPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const ticket = await prisma.supportTicket.findFirst({
      where: { id, userId: payload.sub },
      include: {
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, name: true, role: true } },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error: any) {
    console.error("Error fetching support ticket:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const payload = await getAuthPayload(request);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const ticket = await prisma.supportTicket.findFirst({
      where: { id, userId: payload.sub },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.status === "CLOSED") {
      return NextResponse.json({ error: "Ticket is closed" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = replyTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const reply = await prisma.$transaction(async (tx: TransactionClient) => {
      const newReply = await tx.supportReply.create({
        data: {
          ticketId: id,
          userId: payload.sub,
          message: parsed.data.message,
        },
      });

      // Update ticket updated at
      await tx.supportTicket.update({
        where: { id },
        data: { updatedAt: new Date() },
      });

      return newReply;
    });

    return NextResponse.json({ reply }, { status: 201 });
  } catch (error: any) {
    console.error("Error replying to support ticket:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
