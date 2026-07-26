import { Monaco } from "@monaco-editor/react";
import { Id } from "../../convex/_generated/dataModel";

export interface CodeTheme {
  id: string;
  label: string;
  color: string;
}

export interface WebsiteTheme {
  id: string;
  label: string;
  color: string;
}

export interface Language {
  id: string;
  label: string;
  logoPath: string;
  monacoLanguage: string;
  defaultCode: string;
  pistonRuntime: LanguageRuntime;
}

export interface LanguageRuntime {
  language: string;
  version: string;
}

export interface ExecuteCodeResponse {
  compile?: {
    output: string;
  };
  run?: {
    output: string;
    stderr: string;
  };
}

export interface ExecutionResult {
  code: string;
  output: string;
  error: string | null;
}

export interface CodeEditorState {
  language: string;
  theme: string;
  fontSize: number;
  output: string;
  error: string | null;
  isRunning: boolean;

  editor: Monaco | null;
  executionResult: {
    code: string;
    output: string;
    error: string | null;
  } | null;

  getCode: () => string;
  setCode: (code: string) => void;

  setEditor: (editor: any) => void;
  setTheme: (theme: string) => void;
  setFontSize: (fontSize: number) => void;
  setLanguage: (language: string) => void;
  runCode: () => Promise<void>;
}

export interface Snippet {
  _id: Id<"snippets">;
  _creationTime: number;
  userId: string;
  language: string;
  code: string;
  title: string;
  userName: string;
}
