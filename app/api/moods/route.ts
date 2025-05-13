import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const moods = await prisma.mood.findMany();
    return NextResponse.json(moods);
  } catch (error) {
    console.error("Error fetching moods:", error);
    return NextResponse.json(
      { error: "Failed to fetch moods" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, emoji, color } = body;

    const mood = await prisma.mood.create({
      data: {
        name,
        emoji,
        color,
      },
    });

    return NextResponse.json(mood);
  } catch (error) {
    console.error("Error creating mood:", error);
    return NextResponse.json(
      { error: "Failed to create mood" },
      { status: 500 }
    );
  }
}