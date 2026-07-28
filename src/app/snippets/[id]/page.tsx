"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import SnippetLoadingSkeleton from "./_components/SnippetLoadingSkeleton";
import NavigationHeader from "@/components/NavigationHeader";
import { Clock, Code, MessageSquare, User } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import { useWebsiteTheme } from "@/components/providers/WebsiteThemeProvider";
import CopyButton from "./_components/CopyButton";
import Comments from "./_components/Comments";
import { useEffect } from "react";

function SnippetDetailPage() {
  const snippetId = useParams().id;
  const { websiteTheme, resolvedColorMode } = useWebsiteTheme();

  const snippet = useQuery(api.snippets.getSnippetById, {
    snippetId: snippetId as Id<"snippets">,
  });
  const comments = useQuery(api.snippets.getComments, {
    snippetId: snippetId as Id<"snippets">,
  });

  if (snippet === undefined) return <SnippetLoadingSkeleton />;

  return (
    <div className="min-h-screen">
      <NavigationHeader />

      <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 mb-6 transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-12 rounded-xl bg-[#ffffff08] p-2.5">
                  <img
                    src={`/${snippet.language}.png`}
                    alt={`${snippet.language} logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                    {snippet.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{snippet.userName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(snippet._creationTime).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      <span>{comments?.length} comments</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center px-3 py-1.5 bg-[#ffffff08] text-[#808086] rounded-lg text-sm font-medium">
                {snippet.language}
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="mb-8 rounded-2xl overflow-hidden glass-panel transition-all duration-300">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-2 text-[#808086]">
                <Code className="w-4 h-4" />
                <span className="text-sm font-medium">Source Code</span>
              </div>
              <CopyButton code={snippet.code} />
            </div>
            <Editor
              height="600px"
              language={LANGUAGE_CONFIG[snippet.language].monacoLanguage}
              value={snippet.code}
              theme="codevyaas"
              onMount={(editor, monaco) => {
                defineMonacoThemes(monaco);
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 16,
                readOnly: true,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                renderWhitespace: "selection",
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                fontLigatures: true,
              }}
            />
          </div>

          <Comments snippetId={snippet._id} />
        </div>
      </main>
    </div>
  );
}
export default SnippetDetailPage;
