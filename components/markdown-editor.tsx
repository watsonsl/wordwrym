"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Maximize,
  Minimize,
  Eye,
  Edit,
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (
    markdownBefore: string,
    markdownAfter: string = ""
  ) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText =
      textarea.value.substring(0, start) +
      markdownBefore +
      selectedText +
      markdownAfter +
      textarea.value.substring(end);

    onChange(newText);

    // Set cursor position after update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + markdownBefore.length,
        end + markdownBefore.length
      );
    }, 0);
  };

  const markdownButtons = [
    {
      label: "Bold",
      icon: Bold,
      action: () => insertMarkdown("**", "**"),
    },
    {
      label: "Italic",
      icon: Italic,
      action: () => insertMarkdown("*", "*"),
    },
    {
      label: "Heading 1",
      icon: Heading1,
      action: () => insertMarkdown("# "),
    },
    {
      label: "Heading 2",
      icon: Heading2,
      action: () => insertMarkdown("## "),
    },
    {
      label: "Heading 3",
      icon: Heading3,
      action: () => insertMarkdown("### "),
    },
    {
      label: "Bulleted List",
      icon: List,
      action: () => insertMarkdown("- "),
    },
    {
      label: "Numbered List",
      icon: ListOrdered,
      action: () => insertMarkdown("1. "),
    },
    {
      label: "Quote",
      icon: Quote,
      action: () => insertMarkdown("> "),
    },
    {
      label: "Code",
      icon: Code,
      action: () => insertMarkdown("```\n", "\n```"),
    },
  ];

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault();
            insertMarkdown("**", "**");
            break;
          case "i":
            e.preventDefault();
            insertMarkdown("*", "*");
            break;
          case "1":
            if (e.altKey) {
              e.preventDefault();
              insertMarkdown("# ");
            }
            break;
          case "2":
            if (e.altKey) {
              e.preventDefault();
              insertMarkdown("## ");
            }
            break;
          case "3":
            if (e.altKey) {
              e.preventDefault();
              insertMarkdown("### ");
            }
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      className={`w-full transition-all duration-300 ${
        isFocusMode ? "focus-mode" : ""
      }`}
    >
      <div className="editor-container bg-card rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-2 border-b">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="write" onClick={() => setActiveTab("write")}>
                  <Edit className="h-4 w-4 mr-2" />
                  Write
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  onClick={() => setActiveTab("preview")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFocusMode(!isFocusMode)}
                title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
              >
                {isFocusMode ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>

            <TabsContent value="write" className="mt-0">
              {!isFocusMode && (
                <div className="flex flex-wrap gap-1 p-2 bg-muted/50">
                  {markdownButtons.map((button) => (
                    <Button
                      key={button.label}
                      variant="ghost"
                      size="sm"
                      onClick={button.action}
                      title={button.label}
                      className="h-8 px-2"
                    >
                      <button.icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              )}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full min-h-[300px] p-4 bg-transparent border-0 focus:ring-0 focus:outline-none resize-y editor"
                  placeholder="Start writing your journal entry here..."
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="markdown-preview p-4 min-h-[300px]"
                dangerouslySetInnerHTML={{
                  __html: convertMarkdownToHtml(value),
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
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