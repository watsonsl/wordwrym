"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, PenLine } from "lucide-react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";

interface JournalEntry {
  id: string;
  title: string;
  createdAt: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch("/api/journal");
        if (!response.ok) {
          throw new Error("Failed to fetch journal entries");
        }
        const data = await response.json();
        setEntries(data);
      } catch (err) {
        console.error("Error fetching journal entries:", err);
        setError("Failed to load journal entries");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []);

  useEffect(() => {
    if (selectedDate && entries.length > 0) {
      const entriesForSelectedDate = entries.filter((entry) => {
        const entryDate = new Date(entry.createdAt);
        return isSameDay(entryDate, selectedDate);
      });
      setSelectedEntries(entriesForSelectedDate);
    } else {
      setSelectedEntries([]);
    }
  }, [selectedDate, entries]);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day names for header
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculate the days to display in the calendar grid
  const calendarDays = [];
  
  // Add days from previous month to start the calendar on Sunday
  const firstDayOfMonth = monthStart.getDay();
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Add days of current month
  calendarDays.push(...monthDays);

  // Check if a day has entries
  const dayHasEntries = (day: Date | null) => {
    if (!day) return false;
    return entries.some((entry) => {
      const entryDate = new Date(entry.createdAt);
      return isSameDay(entryDate, day);
    });
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Calendar View</h1>
            <p className="text-muted-foreground mt-1">
              Navigate your journal entries by date
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/journal">
                <CalendarIcon className="h-4 w-4 mr-2" />
                List View
              </Link>
            </Button>
            <Button asChild>
              <Link href="/write">
                <PenLine className="h-4 w-4 mr-2" />
                New Entry
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-card rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-semibold">
                    {format(currentMonth, "MMMM yyyy")}
                  </h2>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="text-center font-medium text-sm py-2"
                    >
                      {day}
                    </div>
                  ))}

                  {calendarDays.map((day, index) => (
                    <div key={index} className="aspect-square p-1">
                      {day && (
                        <button
                          className={`calendar-day w-full h-full ${
                            dayHasEntries(day) ? "has-entry" : ""
                          } ${
                            selectedDate && isSameDay(day, selectedDate)
                              ? "selected"
                              : ""
                          } ${
                            !isSameMonth(day, currentMonth)
                              ? "text-muted-foreground/50"
                              : ""
                          }`}
                          onClick={() => setSelectedDate(day)}
                        >
                          {format(day, "d")}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-card rounded-lg shadow-sm p-6 h-full">
                <h3 className="text-lg font-semibold mb-4">
                  {selectedDate
                    ? `Entries for ${format(selectedDate, "MMMM d, yyyy")}`
                    : "Select a date to view entries"}
                </h3>

                {selectedDate && selectedEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No entries for this date
                    </p>
                    <Button asChild>
                      <Link href="/write">
                        <PenLine className="h-4 w-4 mr-2" />
                        Create Entry
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedEntries.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors"
                      >
                        <Link
                          href={`/journal/${entry.id}`}
                          className="block w-full h-full"
                        >
                          <h4 className="font-medium line-clamp-1">
                            {entry.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(
                              new Date(entry.createdAt),
                              "h:mm a"
                            )}
                          </p>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}