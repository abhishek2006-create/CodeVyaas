import { CodeEditorState } from "./../types/index";
import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import { create } from "zustand";
import { Monaco } from "@monaco-editor/react";

const getInitialState = () => {
  // if we're on the server, return default values
  if (typeof window === "undefined") {
    return {
      language: "javascript",
      fontSize: 16,
      theme: "vs-dark",
      
    };
  }

  // if we're on the client, return values from local storage bc localStorage is a browser API.
  const savedLanguage = localStorage.getItem("editor-language") || "javascript";
  const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
  const savedFontSize = localStorage.getItem("editor-font-size") || 16;

  return {
    language: savedLanguage,
    theme: savedTheme,
    fontSize: Number(savedFontSize),
  };
};

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    output: "",
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,

  getCode: () => get().editor?.getValue() || "",

setCode: (code: string) => {
  const { editor, language } = get();

  if (typeof window !== "undefined") {
    localStorage.setItem(`editor-code-${language}`, code);
  }

  if (editor && editor.getValue() !== code) {
    editor.setValue(code);
  }
},

setEditor: (editor: Monaco) => {
  const savedCode = localStorage.getItem(`editor-code-${get().language}`);

  if (savedCode) {
    editor.setValue(savedCode);
  }

  set({ editor });
},

    setTheme: (theme: string) => {
      localStorage.setItem("editor-theme", theme);
      set({ theme });
    },

    setFontSize: (fontSize: number) => {
      localStorage.setItem("editor-font-size", fontSize.toString());
      set({ fontSize });
    },

    setLanguage: (language: string) => {
      // Save current language code before switching
      const currentCode = get().editor?.getValue();
      if (currentCode) {
        localStorage.setItem(`editor-code-${get().language}`, currentCode);
      }

      localStorage.setItem("editor-language", language);

      set({
        language,
        output: "",
        error: null,
      });
    },

  runCode: async () => {
  const { language, getCode } = get();
  const code = getCode();

  if (!code.trim()) {
    set({ error: "Please enter some code" });
    return;
  }

  set({ isRunning: true, error: null, output: "" });

  try {
    const judgeApiUrl =
      process.env.NEXT_PUBLIC_JUDGE_API_URL ?? "http://localhost:3000";

    const response = await fetch(`${judgeApiUrl}/api/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        source: code, // Docker Judge API expects `source`, not `code`
        stdin: "", // Replace later with your editor's custom input state
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data.error || data.stderr || "Failed to execute code";

      set({
        error,
        executionResult: { code, output: "", error },
      });
      return;
    }

    const output = data.stdout ?? "";
    const error =
      data.timedOut
        ? "Execution timed out"
        : data.exitCode !== 0
          ? data.stderr || "Code execution failed"
          : null;

    set({
      output: output.trim(),
      error,
      executionResult: {
        code,
        output: output.trim(),
        error,
      },
    });
  } catch (error) {
    console.error("Error running code:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error running code";

    set({
      error: errorMessage,
      executionResult: { code, output: "", error: errorMessage },
    });
  } finally {
    set({ isRunning: false });
  }
},
  };
});

export const getExecutionResult = () => useCodeEditorStore.getState().executionResult;
