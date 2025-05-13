"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";

interface Mood {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

interface MoodSelectorProps {
  selectedMoodId: string | null;
  onSelect: (moodId: string | null) => void;
}

export function MoodSelector({ selectedMoodId, onSelect }: MoodSelectorProps) {
  const [moods, setMoods] = useState<Mood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMoods = async () => {
      try {
        const response = await fetch("/api/moods");
        if (!response.ok) {
          throw new Error("Failed to fetch moods");
        }
        const data = await response.json();
        
        // If no moods exist, create default ones
        if (data.length === 0) {
          const defaultMoods = [
            { name: "Happy", emoji: "😊", color: "#4CAF50" },
            { name: "Sad", emoji: "😢", color: "#2196F3" },
            { name: "Angry", emoji: "😠", color: "#F44336" },
            { name: "Excited", emoji: "🎉", color: "#FF9800" },
            { name: "Calm", emoji: "😌", color: "#9C27B0" },
            { name: "Anxious", emoji: "😰", color: "#607D8B" },
            { name: "Grateful", emoji: "🙏", color: "#8BC34A" },
          ];
          
          for (const mood of defaultMoods) {
            await fetch("/api/moods", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(mood),
            });
          }
          
          // Fetch again to get the created moods with IDs
          const newResponse = await fetch("/api/moods");
          const newData = await newResponse.json();
          setMoods(newData);
        } else {
          setMoods(data);
        }
      } catch (err) {
        setError("Failed to load moods");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoods();
  }, []);

  const selectedMood = moods.find((mood) => mood.id === selectedMoodId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          {selectedMood ? (
            <>
              <span className="text-lg">{selectedMood.emoji}</span>
              <span>{selectedMood.name}</span>
            </>
          ) : (
            <>
              <SmilePlus className="h-4 w-4 mr-2" />
              Select Mood
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="space-y-2">
          <h4 className="font-medium text-sm mb-2">How are you feeling?</h4>
          
          {error && <p className="text-destructive text-sm">{error}</p>}
          
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  className={`flex flex-col items-center justify-center p-2 rounded-md transition-all ${
                    selectedMoodId === mood.id
                      ? "bg-primary/20 ring-2 ring-primary"
                      : "hover:bg-secondary"
                  }`}
                  onClick={() => onSelect(mood.id)}
                  title={mood.name}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs mt-1">{mood.name}</span>
                </button>
              ))}
              
              <button
                className={`flex flex-col items-center justify-center p-2 rounded-md transition-all ${
                  selectedMoodId === null
                    ? "bg-primary/20 ring-2 ring-primary"
                    : "hover:bg-secondary"
                }`}
                onClick={() => onSelect(null)}
                title="No mood"
              >
                <span className="text-2xl">❓</span>
                <span className="text-xs mt-1">None</span>
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}