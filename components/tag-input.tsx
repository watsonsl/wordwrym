"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Tag as TagIcon, Plus } from "lucide-react";
import { getRandomColor } from "@/lib/utils";

interface Tag {
  id?: string;
  name: string;
  color: string;
}

interface TagInputProps {
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
}

export function TagInput({ selectedTags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        if (!response.ok) {
          throw new Error("Failed to fetch tags");
        }
        const data = await response.json();
        setAvailableTags(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleAddTag = () => {
    if (!inputValue.trim()) return;

    // Check if tag already exists in available tags
    const existingTag = availableTags.find(
      (tag) => tag.name.toLowerCase() === inputValue.toLowerCase()
    );

    // Check if tag is already selected
    const isAlreadySelected = selectedTags.some(
      (tag) => tag.name.toLowerCase() === inputValue.toLowerCase()
    );

    if (isAlreadySelected) {
      setInputValue("");
      return;
    }

    if (existingTag) {
      onChange([...selectedTags, existingTag]);
    } else {
      const newTag = {
        name: inputValue.trim(),
        color: getRandomColor().replace("bg-", ""),
      };
      onChange([...selectedTags, newTag]);
    }

    setInputValue("");
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tagToRemove: Tag) => {
    onChange(selectedTags.filter((tag) => tag.name !== tagToRemove.name));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Backspace" && !inputValue && selectedTags.length > 0) {
      handleRemoveTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const filteredAvailableTags = availableTags.filter(
    (tag) =>
      !selectedTags.some((selectedTag) => selectedTag.name === tag.name) &&
      tag.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((tag) => (
          <div
            key={tag.name}
            className="flex items-center gap-1 px-2 py-1 text-sm rounded-full"
            style={{ 
              backgroundColor: `#${tag.color.replace("#", "")}20`,
              color: tag.color 
            }}
          >
            <TagIcon className="h-3 w-3" />
            <span>{tag.name}</span>
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 rounded-full hover:bg-background/20 p-0.5"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag.name}</span>
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add tags..."
            className="w-full"
          />
          
          {inputValue && filteredAvailableTags.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-md max-h-48 overflow-y-auto">
              {filteredAvailableTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-muted"
                  onClick={() => {
                    onChange([...selectedTags, tag]);
                    setInputValue("");
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  ></div>
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <Button
          type="button"
          onClick={handleAddTag}
          disabled={!inputValue.trim()}
          size="icon"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add tag</span>
        </Button>
      </div>
    </div>
  );
}