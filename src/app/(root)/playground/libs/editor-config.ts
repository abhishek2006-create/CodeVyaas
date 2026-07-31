import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { getMonacoColor } from "@/lib/color-utils";

export const getEditorLanguage = (fileExtension: string): string => {
  const extension = fileExtension.toLowerCase();
  const languageMap: Record<string, string> = {
    // JavaScript/TypeScript
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    mjs: "javascript",
    cjs: "javascript",

    // Web languages
    json: "json",
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    sass: "scss",
    less: "less",

    // Markup/Documentation
    md: "markdown",
    markdown: "markdown",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",

    // Programming languages
    py: "python",
    python: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    php: "php",
    rb: "ruby",
    go: "go",
    rs: "rust",
    sh: "shell",
    bash: "shell",
    sql: "sql",

    // Config files
    toml: "ini",
    ini: "ini",
    conf: "ini",
    dockerfile: "dockerfile",
  };

  return languageMap[extension] || "plaintext";
};

export const configureMonaco = (monaco: Monaco) => {
  // Define a beautiful modern theme
  monaco.editor.defineTheme("modern-theme", {
    base: "vs-dark",
    inherit: true,
    rules: [
      // Comments
      {
        token: "comment",
        foreground: getMonacoColor("--editor-comment"),
        fontStyle: "italic",
      },
      {
        token: "comment.line",
        foreground: getMonacoColor("--editor-comment"),
        fontStyle: "italic",
      },
      {
        token: "comment.block",
        foreground: getMonacoColor("--editor-comment"),
        fontStyle: "italic",
      },

      // Keywords
      {
        token: "keyword",
        foreground: getMonacoColor("--editor-keyword"),
        fontStyle: "bold",
      },
      {
        token: "keyword.control",
        foreground: getMonacoColor("--editor-keyword"),
        fontStyle: "bold",
      },
      {
        token: "keyword.operator",
        foreground: getMonacoColor("--editor-operator"),
      },

      // Strings
      { token: "string", foreground: getMonacoColor("--editor-string") },
      { token: "string.quoted", foreground: getMonacoColor("--editor-string") },
      {
        token: "string.template",
        foreground: getMonacoColor("--editor-string"),
      },

      // Numbers
      { token: "number", foreground: getMonacoColor("--editor-number") },
      { token: "number.hex", foreground: getMonacoColor("--editor-number") },
      { token: "number.float", foreground: getMonacoColor("--editor-number") },

      // Functions
      {
        token: "entity.name.function",
        foreground: getMonacoColor("--editor-function"),
      },
      {
        token: "support.function",
        foreground: getMonacoColor("--editor-function"),
      },

      // Variables
      { token: "variable", foreground: getMonacoColor("--editor-variable") },
      {
        token: "variable.parameter",
        foreground: getMonacoColor("--editor-variable"),
      },
      {
        token: "variable.other",
        foreground: getMonacoColor("--editor-variable"),
      },

      // Types
      {
        token: "entity.name.type",
        foreground: getMonacoColor("--editor-type"),
      },
      { token: "support.type", foreground: getMonacoColor("--editor-type") },
      { token: "storage.type", foreground: getMonacoColor("--editor-keyword") },

      // Classes
      {
        token: "entity.name.class",
        foreground: getMonacoColor("--editor-class"),
      },
      { token: "support.class", foreground: getMonacoColor("--editor-class") },

      // Constants
      { token: "constant", foreground: getMonacoColor("--editor-variable") },
      {
        token: "constant.language",
        foreground: getMonacoColor("--editor-keyword"),
      },
      {
        token: "constant.numeric",
        foreground: getMonacoColor("--editor-number"),
      },

      // Operators
      {
        token: "keyword.operator",
        foreground: getMonacoColor("--editor-operator"),
      },
      {
        token: "punctuation",
        foreground: getMonacoColor("--editor-foreground"),
      },

      // HTML/XML
      { token: "tag", foreground: getMonacoColor("--editor-keyword") },
      { token: "tag.id", foreground: getMonacoColor("--editor-variable") },
      { token: "tag.class", foreground: getMonacoColor("--editor-type") },
      {
        token: "attribute.name",
        foreground: getMonacoColor("--editor-variable"),
      },
      {
        token: "attribute.value",
        foreground: getMonacoColor("--editor-string"),
      },

      // CSS
      {
        token: "attribute.name.css",
        foreground: getMonacoColor("--editor-variable"),
      },
      {
        token: "attribute.value.css",
        foreground: getMonacoColor("--editor-string"),
      },
      {
        token: "property-name.css",
        foreground: getMonacoColor("--editor-variable"),
      },
      {
        token: "property-value.css",
        foreground: getMonacoColor("--editor-string"),
      },

      // JSON
      { token: "key", foreground: getMonacoColor("--editor-variable") },
      { token: "string.key", foreground: getMonacoColor("--editor-variable") },
      { token: "string.value", foreground: getMonacoColor("--editor-string") },

      // Error/Warning
      { token: "invalid", foreground: "#F44747", fontStyle: "underline" },
      {
        token: "invalid.deprecated",
        foreground: "#D4D4D4",
        fontStyle: "strikethrough",
      },
    ],
    colors: {
      // Editor background
      "editor.background": getMonacoColor("--editor-background"),
      "editor.foreground": getMonacoColor("--editor-foreground"),

      // Line numbers
      "editorLineNumber.foreground": getMonacoColor("--editor-line-number"),
      "editorLineNumber.activeForeground": getMonacoColor(
        "--editor-line-number-active",
      ),

      // Cursor
      "editorCursor.foreground": getMonacoColor("--editor-foreground"),

      // Selection
      "editor.selectionBackground": getMonacoColor("--editor-selection"),
      "editor.selectionHighlightBackground":
        getMonacoColor("--editor-selection") + "80",
      "editor.inactiveSelectionBackground":
        getMonacoColor("--editor-selection") + "40",

      // Current line
      "editor.lineHighlightBackground": getMonacoColor(
        "--editor-line-highlight",
      ),
      "editor.lineHighlightBorder": getMonacoColor("--editor-border"),

      // Gutter
      "editorGutter.background": getMonacoColor("--editor-background"),
      "editorGutter.modifiedBackground": "#BB800966",
      "editorGutter.addedBackground": "#347D3966",
      "editorGutter.deletedBackground": "#F8514966",

      // Scrollbar
      "scrollbar.shadow": "#00000088",
      "scrollbarSlider.background": getMonacoColor("--muted") + "66",
      "scrollbarSlider.hoverBackground": getMonacoColor("--muted") + "88",
      "scrollbarSlider.activeBackground": getMonacoColor("--muted") + "BB",

      // Minimap
      "minimap.background": getMonacoColor("--editor-background"),
      "minimap.selectionHighlight": getMonacoColor("--editor-selection"),

      // Find/Replace
      "editor.findMatchBackground": "#9E6A03",
      "editor.findMatchHighlightBackground": "#F2CC6080",
      "editor.findRangeHighlightBackground": "#3FB95040",

      // Word highlight
      "editor.wordHighlightBackground": "#575757B8",
      "editor.wordHighlightStrongBackground": "#004972B8",

      // Brackets
      "editorBracketMatch.background": "#0064001A",
      "editorBracketMatch.border": "#888888",

      // Indentation guides
      "editorIndentGuide.background": getMonacoColor("--border"),
      "editorIndentGuide.activeBackground": getMonacoColor("--ring"),

      // Ruler
      "editorRuler.foreground": getMonacoColor("--border"),

      // Whitespace
      "editorWhitespace.foreground":
        getMonacoColor("--muted-foreground") + "66",

      // Error/Warning squiggles
      "editorError.foreground": "#F85149",
      "editorWarning.foreground": "#D29922",
      "editorInfo.foreground": "#75BEFF",
      "editorHint.foreground": "#EEEEEE",

      // Suggest widget
      "editorSuggestWidget.background": getMonacoColor("--popover"),
      "editorSuggestWidget.border": getMonacoColor("--border"),
      "editorSuggestWidget.foreground": getMonacoColor("--popover-foreground"),
      "editorSuggestWidget.selectedBackground": getMonacoColor("--accent"),

      // Hover widget
      "editorHoverWidget.background": getMonacoColor("--popover"),
      "editorHoverWidget.border": getMonacoColor("--border"),

      // Panel
      "panel.background": getMonacoColor("--background"),
      "panel.border": getMonacoColor("--border"),
    },
  });

  // Set the theme
  monaco.editor.setTheme("modern-theme");

  // Configure additional editor settings
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  // Set compiler options for better IntelliSense
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    allowJs: true,
    typeRoots: ["node_modules/@types"],
  });

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    allowJs: true,
    typeRoots: ["node_modules/@types"],
  });
};

export const defaultEditorOptions: editor.IStandaloneEditorConstructionOptions =
  {
    // Font
    fontSize: 14,
    fontFamily:
      "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
    fontLigatures: true,
    fontWeight: "400",

    // Layout
    automaticLayout: true,
    scrollBeyondLastLine: false,
    padding: {
      top: 16,
      bottom: 16,
    },

    // Minimap
    minimap: {
      enabled: true,
      size: "proportional",
      showSlider: "mouseover",
    },

    // Lines
    lineNumbers: "on",
    lineHeight: 20,
    renderLineHighlight: "all",
    renderWhitespace: "selection",

    // Indentation
    tabSize: 2,
    insertSpaces: true,
    detectIndentation: true,

    // Word Wrap
    wordWrap: "on",
    wordWrapColumn: 120,
    wrappingIndent: "indent",

    // Folding
    folding: true,
    foldingHighlight: true,
    foldingStrategy: "indentation",
    showFoldingControls: "mouseover",

    // Scrolling
    smoothScrolling: true,
    mouseWheelZoom: true,
    fastScrollSensitivity: 5,

    // Selection
    selectionHighlight: true,
    occurrencesHighlight: "singleFile",
    multiCursorModifier: "ctrlCmd",

    // Suggestions
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: "on",
    tabCompletion: "on",
    wordBasedSuggestions: "currentDocument",
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false,
    },

    // Formatting
    formatOnPaste: true,
    formatOnType: true,

    // Brackets
    matchBrackets: "always",
    bracketPairColorization: {
      enabled: true,
    },

    // Guides (NEW API)
    guides: {
      indentation: true,
      highlightActiveIndentation: true,
      bracketPairs: true,
    },

    rulers: [80, 120],

    // Cursor
    cursorBlinking: "smooth",
    cursorSmoothCaretAnimation: "on",
    cursorStyle: "line",
    cursorWidth: 2,

    // Find
    find: {
      addExtraSpaceOnTop: false,
      autoFindInSelection: "never",
      seedSearchStringFromSelection: "always",
    },

    // Hover
    hover: {
      enabled: "on",
      delay: 300,
      sticky: true,
    },

    // Sticky Scroll
    stickyScroll: {
      enabled: true,
    },

    // Accessibility
    accessibilitySupport: "auto",
  };
