"use client";

import { useRef, useEffect } from "react";
import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import { useWebsiteTheme } from "@/components/providers/WebsiteThemeProvider";
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

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.updateOptions({
      ...defaultEditorOptions,
      // Quick suggestions
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false,
      },
      // Smooth cursor
      cursorSmoothCaretAnimation: "on",
    });

    configureMonaco(monaco);

    updateEditorLanguage();
  };

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
    <div className="h-full relative">
      <Editor
        height="100%"
        value={content}
        onChange={(value) => onContentChange(value || "")}
        onMount={handleEditorDidMount}
        language={
          activeFile
            ? getEditorLanguage(activeFile.fileExtension || "")
            : "plaintext"
        }
        options={defaultEditorOptions}
      />
    </div>
  );
};
