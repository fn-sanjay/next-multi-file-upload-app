import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { requireAdmin } from "@/lib/server/admin/auth";
import { transporter } from "@/lib/server/auth/email";

const replyClientQuerySchema = z.object({
  reply: z.string().trim().min(2).max(1000),
  close: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);

  const parsed = replyClientQuerySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid body" },
      { status: 400 }
    );
  }

  const { id } = await context.params;

  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    if (ticket.status === "CLOSED") {
      return NextResponse.json(
        { error: "Ticket already closed" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const reply = await tx.supportReply.create({
        data: {
          ticketId: id,
          userId: auth.adminId, // admin replying
          message: parsed.data.reply,
        },
      });

      const updatedTicket = await tx.supportTicket.update({
        where: { id },
        data: {
          status: parsed.data.close ? "CLOSED" : ticket.status,
          updatedAt: new Date(),
        },
      });

      return { reply, updatedTicket };
    });

    // fire-and-forget email to user
    try {
      if (ticket.user?.email) {
        await transporter.sendMail({
          from: `"Cloudvault Admin" <${process.env.EMAIL_FROM}>`,
          to: ticket.user.email,
          subject: `Reply: ${ticket.subject}`,
          html: `
            <p>Hi ${ticket.user.name ?? "there"},</p>
            <p>We’ve replied to your request:</p>
            <blockquote style="border-left:4px solid #888;padding:8px 12px;margin:12px 0;color:#444;">
              ${parsed.data.reply}
            </blockquote>
            <p>Status: ${parsed.data.close ? "Closed" : "Open"}</p>
            <p>If you have more questions, just reply to this email.</p>
          `,
        });
      }
    } catch (err) {
      console.error("Failed to send support reply email:", err);
    }

    return NextResponse.json({
      ticket: result.updatedTicket,
      reply: result.reply,
    });
  } catch (error) {
    console.error("Admin reply error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
