import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get total entries count
    const totalEntries = await prisma.journalEntry.count();

    // Get entries by month
    const entriesByMonth = await prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m', "createdAt") as month,
        COUNT(*) as count
      FROM "JournalEntry"
      GROUP BY month
      ORDER BY month ASC
    `;

    // Get mood distribution
    const moodDistribution = await prisma.$queryRaw`
      SELECT 
        m.name as mood,
        m.emoji as emoji,
        m.color as color,
        COUNT(j.id) as count
      FROM "Mood" m
      LEFT JOIN "JournalEntry" j ON m.id = j."moodId"
      GROUP BY m.id
      ORDER BY count DESC
    `;

    // Get most used tags
    const mostUsedTags = await prisma.$queryRaw`
      SELECT 
        t.name as tag,
        t.color as color,
        COUNT(j.id) as count
      FROM "Tag" t
      JOIN "_JournalEntryToTag" jt ON t.id = jt."B"
      JOIN "JournalEntry" j ON j.id = jt."A"
      GROUP BY t.id
      ORDER BY count DESC
      LIMIT 10
    `;

    // Get streak data
    const entries = await prisma.journalEntry.findMany({
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    
    if (entries.length > 0) {
      const dates = entries.map(entry => {
        const date = new Date(entry.createdAt);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      });
      
      // Fix: Convert Set to Array explicitly before using spread operator
      const uniqueDatesSet = new Set(dates);
      const uniqueDates = Array.from(uniqueDatesSet).sort();
      
      // Calculate longest streak
      let streak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        
        const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak++;
        } else {
          longestStreak = Math.max(longestStreak, streak);
          streak = 1;
        }
      }
      
      longestStreak = Math.max(longestStreak, streak);
      
      // Calculate current streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastEntryDate = new Date(uniqueDates[uniqueDates.length - 1]);
      lastEntryDate.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(today.getTime() - lastEntryDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        // Last entry was today or yesterday, calculate current streak
        currentStreak = 1;
        for (let i = uniqueDates.length - 2; i >= 0; i--) {
          const prevDate = new Date(uniqueDates[i]);
          const currDate = new Date(uniqueDates[i + 1]);
          
          const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    return NextResponse.json({
      totalEntries,
      entriesByMonth,
      moodDistribution,
      mostUsedTags,
      currentStreak,
      longestStreak,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}