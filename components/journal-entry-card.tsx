"use client";

import { formatDate, truncateText } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface JournalEntryCardProps {
  entry: {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    mood?: {
      name: string;
      emoji: string;
      color: string;
    } | null;
    tags: {
      id: string;
      name: string;
      color: string;
    }[];
  };
}

export function JournalEntryCard({ entry }: JournalEntryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm("Are you sure you want to delete this entry?")) {
      setIsDeleting(true);
      
      try {
        const response = await fetch(`/api/journal/${entry.id}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          router.refresh();
        } else {
          console.error("Failed to delete entry");
        }
      } catch (error) {
        console.error("Error deleting entry:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
      className="bg-card rounded-lg shadow-sm hover:shadow-md transition-all p-6"
    >
      <Link href={`/journal/${entry.id}`} className="block h-full">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold line-clamp-1">{entry.title}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <Calendar className="h-4 w-4 mr-1" />
          <time dateTime={entry.createdAt.toISOString()}>
            {formatDate(new Date(entry.createdAt))}
          </time>
          
          {entry.mood && (
            <span className="ml-3 flex items-center">
              <span className="mr-1">{entry.mood.emoji}</span>
              <span>{entry.mood.name}</span>
            </span>
          )}
        </div>
        
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {truncateText(entry.content, 150)}
        </p>
        
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto">
            {entry.tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center text-xs px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: `${tag.color}20`,
                  color: tag.color 
                }}
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag.name}
              </div>
            ))}
          </div>
        )}
      </Link>
    </motion.div>
  );
}