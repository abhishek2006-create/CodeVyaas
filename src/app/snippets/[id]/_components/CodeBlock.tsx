import SyntaxHighlighter from "react-syntax-highlighter";
import { codeHighlight } from "@/lib/code-highlight";
import CopyButton from "./CopyButton";

const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  const trimmedCode = code
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");

  return (
    <div className="my-4 bg-background rounded-lg overflow-hidden border border-border">

      <div className="flex items-center justify-between px-4 py-2 bg-secondary">
        <div className="flex items-center gap-2">
          <img
            src={`/${language}.png`}
            alt={language}
            className="size-4 object-contain"
          />
          <span className="text-sm text-gray-400">
            {language || "plaintext"}
          </span>
        </div>
        <CopyButton code={trimmedCode} />
      </div>

      <div className="relative">
        <SyntaxHighlighter
          language={language || "plaintext"}
          style={codeHighlight}
          customStyle={{
            padding: "1rem",
            background: "var(--background)",
            margin: 0,
          }}
          showLineNumbers={true}
          wrapLines={true}
        >
          {trimmedCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
