"use client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { codeHighlight } from "@/lib/code-highlight";

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const lines = code.split("\n");
  const displayCode = isExpanded ? code : lines.slice(0, 6).join("\n");

  return (
    <div className="relative">
      <SyntaxHighlighter
        language={language.toLowerCase()}
        style={codeHighlight}
        customStyle={{
          padding: "1rem",
          borderRadius: "0.5rem",
          background: "var(--background)",
          margin: 0,
        }}
      >
        {displayCode}
      </SyntaxHighlighter>

      {lines.length > 6 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute bottom-2 right-2 px-2 py-1 bg-accent text-accent-foreground rounded text-xs flex items-center
          gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              Show More <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default CodeBlock;
