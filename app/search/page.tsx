"use client";

import { useState, useEffect } from "react";
import { JournalEntryCard } from "@/components/journal-entry-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Search as SearchIcon, Tag, Calendar, Smile } from "lucide-react";

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

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Mood {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export default function SearchPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch entries
        const entriesResponse = await fetch("/api/journal");
        if (!entriesResponse.ok) {
          throw new Error("Failed to fetch journal entries");
        }
        const entriesData = await entriesResponse.json();
        setEntries(entriesData);
        setFilteredEntries(entriesData);

        // Fetch tags
        const tagsResponse = await fetch("/api/tags");
        if (!tagsResponse.ok) {
          throw new Error("Failed to fetch tags");
        }
        const tagsData = await tagsResponse.json();
        setTags(tagsData);

        // Fetch moods
        const moodsResponse = await fetch("/api/moods");
        if (!moodsResponse.ok) {
          throw new Error("Failed to fetch moods");
        }
        const moodsData = await moodsResponse.json();
        setMoods(moodsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [searchQuery, selectedTags, selectedMoods, dateRange, entries]);

  const filterEntries = () => {
    let filtered = [...entries];

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.title.toLowerCase().includes(query) ||
          entry.content.toLowerCase().includes(query)
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((entry) =>
        entry.tags.some((tag) => selectedTags.includes(tag.id))
      );
    }

    // Filter by moods
    if (selectedMoods.length > 0) {
      filtered = filtered.filter(
        (entry) => entry.mood && selectedMoods.includes(entry.mood.id)
      );
    }

    // Filter by date range
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(
        (entry) => new Date(entry.createdAt) >= startDate
      );
    }

    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(
        (entry) => new Date(entry.createdAt) <= endDate
      );
    }

    setFilteredEntries(filtered);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const toggleMood = (moodId: string) => {
    setSelectedMoods((prev) =>
      prev.includes(moodId)
        ? prev.filter((id) => id !== moodId)
        : [...prev, moodId]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
    setSelectedMoods([]);
    setDateRange({ start: "", end: "" });
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold">Search Journal</h1>
          <p className="text-muted-foreground mt-1">
            Find entries by keyword, tag, mood, or date
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card rounded-lg shadow-sm p-4">
              <h3 className="font-medium mb-3 flex items-center">
                <SearchIcon className="h-4 w-4 mr-2" />
                Search
              </h3>
              <Input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="bg-card rounded-lg shadow-sm p-4">
              <h3 className="font-medium mb-3 flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    className={`flex items-center text-xs px-2 py-1 rounded-full transition-colors ${
                      selectedTags.includes(tag.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </button>
                ))}
                {tags.length === 0 && (
                  <p className="text-sm text-muted-foreground">No tags found</p>
                )}
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-sm p-4">
              <h3 className="font-medium mb-3 flex items-center">
                <Smile className="h-4 w-4 mr-2" />
                Moods
              </h3>
              <div className="flex flex-wrap gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                      selectedMoods.includes(mood.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                    onClick={() => toggleMood(mood.id)}
                  >
                    <span>{mood.emoji}</span>
                    <span>{mood.name}</span>
                  </button>
                ))}
                {moods.length === 0 && (
                  <p className="text-sm text-muted-foreground">No moods found</p>
                )}
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-sm p-4">
              <h3 className="font-medium mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    From
                  </label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    To
                  </label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={clearFilters}
            >
              Clear All Filters
            </Button>
          </div>

          <div className="md:col-span-3">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                {error}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg shadow-sm">
                <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No matching entries found</h3>
                <p className="text-muted-foreground max-w-md mx-auto mt-2">
                  Try adjusting your search criteria or filters to find what you're looking for.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Found {filteredEntries.length} matching entries
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredEntries.map((entry) => (
                    <JournalEntryCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}