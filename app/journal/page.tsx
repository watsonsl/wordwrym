"use client";

import { useState, useEffect } from "react";
import { JournalEntryCard } from "@/components/journal-entry-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { PenLine, Search, Filter, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  mood: {
    id: string;
    name: string;
    emoji: string;
    color: string;
  } | null;
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
}

export default function JournalPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch("/api/journal");
        if (!response.ok) {
          throw new Error("Failed to fetch journal entries");
        }
        const data = await response.json();
        setEntries(data);
        setFilteredEntries(data);
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
    if (searchQuery.trim() === "") {
      setFilteredEntries(entries);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.tags.some((tag) => tag.name.toLowerCase().includes(query)) ||
        (entry.mood && entry.mood.name.toLowerCase().includes(query))
    );

    setFilteredEntries(filtered);
  }, [searchQuery, entries]);

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
            <h1 className="text-3xl font-bold">Your Journal</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your journal entries
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/calendar">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
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

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search entries by title, content, tags, or mood..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            {error}
          </div>
        ) : filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-card rounded-lg shadow-sm"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <PenLine className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">No journal entries found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery
                  ? "No entries match your search criteria. Try a different search term."
                  : "Start your journaling journey by creating your first entry."}
              </p>
              {!searchQuery && (
                <Button asChild className="mt-2">
                  <Link href="/write">
                    <PenLine className="h-4 w-4 mr-2" />
                    Create Your First Entry
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <JournalEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}