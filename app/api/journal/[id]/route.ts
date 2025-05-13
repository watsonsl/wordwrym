import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const entry = await prisma.journalEntry.findUnique({
      where: { id },
      include: {
        mood: true,
        tags: true,
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Journal entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch journal entry" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { title, content, moodId, tags } = body;

    // Update the journal entry
    const entry = await prisma.journalEntry.update({
      where: { id },
      data: {
        title,
        content,
        moodId,
        tags: {
          set: [], // First disconnect all tags
          connectOrCreate: tags.map((tag: { name: string; color: string }) => ({
            where: { name: tag.name },
            create: { name: tag.name, color: tag.color },
          })),
        },
      },
      include: {
        mood: true,
        tags: true,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error updating journal entry:", error);
    return NextResponse.json(
      { error: "Failed to update journal entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await prisma.journalEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    return NextResponse.json(
      { error: "Failed to delete journal entry" },
      { status: 500 }
    );
  }
}