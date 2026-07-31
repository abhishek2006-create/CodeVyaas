"use client";

import { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import { loader } from "@monaco-editor/react";
import { cn } from "@/lib/utils";
import { useWebsiteTheme } from "@/components/providers/WebsiteThemeProvider";
import {
  configureMonaco,
  defaultEditorOptions,
  getEditorLanguage,
} from "../libs/editor-config";

// Configure Monaco loader
loader.config({ monaco });

interface MonacoEditorProps {
  content: string;
  language: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
}

export function MonacoEditor({
  content,
  language,
  onChange,
  readOnly = false,
  className,
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { websiteTheme, resolvedColorMode } = useWebsiteTheme();

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return;

    // Use defaultEditorOptions for consistency
    const newEditor = monaco.editor.create(editorRef.current, {
      ...defaultEditorOptions,
      value: content,
      language: getEditorLanguage(language),
      theme: "modern-theme",
      readOnly,
    });

    // Ensure Monaco is configured with our themes
    configureMonaco(monaco as any);

    setEditorInstance(newEditor);

    return () => {
      newEditor.dispose();
    };
  }, [editorRef.current]);

  // Update theme when website theme changes
  useEffect(() => {
    if (editorInstance) {
      configureMonaco(monaco as any);
    }
  }, [websiteTheme, resolvedColorMode, editorInstance]);

  // Update content when it changes
  useEffect(() => {
    if (editorInstance && content !== editorInstance.getValue()) {
      editorInstance.setValue(content);
    }
  }, [content, editorInstance]);

  // Update language when it changes
  useEffect(() => {
    if (editorInstance) {
      const model = editorInstance.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, getEditorLanguage(language));
      }
    }
  }, [language, editorInstance]);

  // Handle content changes
  useEffect(() => {
    if (editorInstance && onChange) {
      const disposable = editorInstance.onDidChangeModelContent(() => {
        onChange(editorInstance.getValue());
      });

      return () => {
        disposable.dispose();
      };
    }
  }, [editorInstance, onChange]);

  return (
    <div
      ref={editorRef}
      className={cn(
        "h-full w-full border border-border rounded-md overflow-hidden",
        className,
      )}
    />
  );
}
