"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from "@/components/markdown-editor";
import { MoodSelector } from "@/components/mood-selector";
import { TagInput } from "@/components/tag-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Trash2, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
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

export default function JournalEntryPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Array<{ id?: string; name: string; color: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await fetch(`/api/journal/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch journal entry");
        }
        const data = await response.json();
        setEntry(data);
        setTitle(data.title);
        setContent(data.content);
        setSelectedMoodId(data.mood?.id || null);
        setSelectedTags(data.tags || []);
      } catch (err) {
        console.error("Error fetching journal entry:", err);
        setError("Failed to load journal entry");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntry();
  }, [params.id]);

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
      const response = await fetch(`/api/journal/${params.id}`, {
        method: "PUT",
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
        throw new Error("Failed to update journal entry");
      }

      const updatedEntry = await response.json();
      setEntry(updatedEntry);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating journal entry:", err);
      setError("Failed to update journal entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this journal entry? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/journal/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete journal entry");
      }

      router.push("/journal");
    } catch (err) {
      console.error("Error deleting journal entry:", err);
      setError("Failed to delete journal entry. Please try again.");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error && !entry) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
        <Button variant="outline" onClick={() => router.push("/journal")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Journal
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/journal")} className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Journal
          </Button>
          
          <div className="flex gap-2">
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Entry
              </Button>
            ) : (
              <Button variant="outline" onClick={() => {
                setIsEditing(false);
                setTitle(entry?.title || "");
                setContent(entry?.content || "");
                setSelectedMoodId(entry?.mood?.id || null);
                setSelectedTags(entry?.tags || []);
              }}>
                Cancel
              </Button>
            )}
            
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-1"
            >
              {isDeleting ? (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </Button>
          </div>
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

        {isEditing ? (
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
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          entry && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-card rounded-lg shadow-sm p-6">
                <h1 className="text-3xl font-bold mb-4">{entry.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <time dateTime={entry.createdAt}>
                      {formatDate(new Date(entry.createdAt))}
                    </time>
                  </div>
                  
                  {entry.mood && (
                    <div className="flex items-center">
                      <span className="mr-1 text-lg">{entry.mood.emoji}</span>
                      <span>{entry.mood.name}</span>
                    </div>
                  )}
                  
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag) => (
                        <div
                          key={tag.id}
                          className="flex items-center text-xs px-2 py-1 rounded-full"
                          style={{ 
                            backgroundColor: `${tag.color}20`,
                            color: tag.color 
                          }}
                        >
                          <span>{tag.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div 
                  className="markdown-preview prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: convertMarkdownToHtml(entry.content),
                  }}
                />
              </div>
            </motion.div>
          )
        )}
      </motion.div>
    </div>
  );
}

// Simple markdown to HTML converter
function convertMarkdownToHtml(markdown: string): string {
  let html = markdown
    // Headers
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Lists
    .replace(/^\- (.*$)/gm, "<ul><li>$1</li></ul>")
    .replace(/^[0-9]+\. (.*$)/gm, "<ol><li>$1</li></ol>")
    // Blockquotes
    .replace(/^\> (.*$)/gm, "<blockquote>$1</blockquote>")
    // Code blocks
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    // Inline code
    .replace(/`(.*?)`/g, "<code>$1</code>")
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    // Paragraphs
    .replace(/^\s*$/gm, "</p><p>")
    // Line breaks
    .replace(/\n/g, "<br>");

  // Wrap in paragraph tags if not already
  if (!html.startsWith("<h") && !html.startsWith("<p>")) {
    html = "<p>" + html;
  }
  if (!html.endsWith("</p>")) {
    html = html + "</p>";
  }

  // Fix nested lists
  html = html
    .replace(/<\/ul><ul>/g, "")
    .replace(/<\/ol><ol>/g, "");

  return html;
}