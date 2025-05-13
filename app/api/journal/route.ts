import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const entries = await prisma.journalEntry.findMany({
      include: {
        mood: true,
        tags: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch journal entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, moodId, tags } = body;

    // Create the journal entry
    const entry = await prisma.journalEntry.create({
      data: {
        title,
        content,
        moodId,
        tags: {
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
    console.error("Error creating journal entry:", error);
    return NextResponse.json(
      { error: "Failed to create journal entry" },
      { status: 500 }
    );
  }
}