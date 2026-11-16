"use client";

import { useRef, useEffect } from "react";
import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";

import {
  configureMonaco,
  defaultEditorOptions,
  getEditorLanguage,
} from "../libs/editor-config";
import type { TemplateFile } from "./types";
import type { editor } from "monaco-editor";

interface PlaygroundEditorProps {
  activeFile: TemplateFile | undefined;
  content: string;
  onContentChange: (value: string) => void;
}

export const PlaygroundEditor = ({
  activeFile,
  content,
  onContentChange,
}: PlaygroundEditorProps) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.updateOptions({
      ...defaultEditorOptions,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false,
      },
      cursorSmoothCaretAnimation: "on",
    });

    updateEditorLanguage();
  };

  const updateEditorLanguage = () => {
    if (!activeFile || !monacoRef.current || !editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const language = getEditorLanguage(activeFile.fileExtension || "");
    try {
      monacoRef.current.editor.setModelLanguage(model, language);
    } catch (error) {
      console.warn("Failed to set editor language:", error);
    }
  };

  useEffect(() => {
    updateEditorLanguage();
  }, [activeFile]);

  return (
    <div className="h-full flex flex-col relative">
      {/* Editor Header Toolbar with Global Settings Menu */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted">
        <span className="text-xs font-medium text-muted-foreground">
          {activeFile ? activeFile.filename : "Editor"}
        </span>

      </div>

      {/* Monaco Code Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          theme="modern-theme"
          value={content}
          onChange={(value) => onContentChange(value || "")}
          beforeMount={configureMonaco}
          onMount={handleEditorDidMount}
          language={
            activeFile
              ? getEditorLanguage(activeFile.fileExtension || "")
              : "plaintext"
          }
          options={defaultEditorOptions}
        />
      </div>
    </div>
  );
};
