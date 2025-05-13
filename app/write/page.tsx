"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from "@/components/markdown-editor";
import { MoodSelector } from "@/components/mood-selector";
import { TagInput } from "@/components/tag-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Save, ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Array<{ name: string; color: string }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default title to today's date if empty
  useEffect(() => {
    if (!title) {
      setTitle(`Journal Entry - ${formatDate(new Date())}`);
    }
  }, [title]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Please enter a title for your journal entry");
      return;
    }

    if (!content.trim()) {
      setError("Please write some content for your journal entry");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          moodId: selectedMoodId,
          tags: selectedTags,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save journal entry");
      }

      const data = await response.json();
      router.push(`/journal/${data.id}`);
    } catch (err) {
      console.error("Error saving journal entry:", err);
      setError("Failed to save journal entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">New Journal Entry</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-destructive/10 text-destructive p-3 rounded-md"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your journal entry"
              className="w-full"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium mb-1">Mood</label>
              <MoodSelector
                selectedMoodId={selectedMoodId}
                onSelect={setSelectedMoodId}
              />
            </div>
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium mb-1">Tags</label>
              <TagInput
                selectedTags={selectedTags}
                onChange={setSelectedTags}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <MarkdownEditor value={content} onChange={setContent} />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Entry
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}