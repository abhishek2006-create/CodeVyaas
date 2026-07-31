"use client";

import { useRef, useEffect } from "react";
import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { useWebsiteTheme } from "@/components/providers/WebsiteThemeProvider";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { defineMonacoThemes } from "@/app/(root)/_constants";

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
  const { websiteTheme, resolvedColorMode } = useWebsiteTheme();

  // 1. Consume the shared global theme state from Zustand
  const { theme } = useCodeEditorStore();

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom themes and immediately apply the stored theme
    defineMonacoThemes(monaco);
    monaco.editor.setTheme(theme);

    editor.updateOptions({
      ...defaultEditorOptions,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false,
      },
      cursorSmoothCaretAnimation: "on",
    });

    configureMonaco(monaco);
    updateEditorLanguage();
  };

  // 2. React to theme changes from SettingsMenu across any editor scope
  useEffect(() => {
    if (monacoRef.current) {
      defineMonacoThemes(monacoRef.current);
      monacoRef.current.editor.setTheme(theme);
    }
  }, [theme]);

  // React to website dark/light mode changes
  useEffect(() => {
    if (monacoRef.current) {
      configureMonaco(monacoRef.current);
    }
  }, [websiteTheme, resolvedColorMode]);

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
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/20">
        <span className="text-xs font-medium text-muted-foreground">
          {activeFile ? activeFile.filename : "Editor"}
        </span>

      </div>

      {/* Monaco Code Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          theme={theme}
          value={content}
          onChange={(value) => onContentChange(value || "")}
          beforeMount={(monaco) => {
            defineMonacoThemes(monaco);
          }}
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
