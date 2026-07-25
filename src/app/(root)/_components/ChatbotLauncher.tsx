"use client";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { AnimatePresence, motion } from "framer-motion";

import {
  Bot,
  Maximize2,
  MessageCircleMore,
  Move,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type Position = { x: number; y: number };
type Size = { w: number; h: number };
type DebugBug = {
  line: number | null;
  title: string;
  reason: string;
  fix: string;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  errorType?: string | null;
  bugs?: DebugBug[];
  correctedCode?: string | null;
};

type ChatResponse = {
  replyMarkdown: string;
  errorType: string | null;
  bugs: DebugBug[];
  correctedCode: string | null;
};
const defaultSize: Size = { w: 380, h: 520 };
const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "Hello 👋 I can read your editor code, output panel, and runtime errors. Ask me to debug your code or use Auto Fix.",
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

function getDefaultPosition(size: Size): Position {
  return {
    x: Math.max(16, window.innerWidth - size.w - 24),
    y: Math.max(16, window.innerHeight - size.h - 24),
  };
}

const createMessageId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const createAssistantMessage = (data: ChatResponse): ChatMessage => ({
  id: createMessageId(),
  role: "assistant",
  text: data.replyMarkdown || "No response received.",
  errorType: data.errorType,
  bugs: data.bugs || [],
  correctedCode: data.correctedCode,
});

export default function ChatbotLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 24, y: 120 });
  const [size, setSize] = useState<Size>(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const { getCode, setCode, runCode } = useCodeEditorStore();

  const [previousCode, setPreviousCode] = useState<string | null>(null);

  useEffect(() => {
    setPosition(getDefaultPosition(defaultSize));
  }, []);

  useEffect(() => {
    const keepInViewport = () => {
      setSize((current) => ({
        w: clamp(current.w, 280, window.innerWidth - 32),
        h: clamp(current.h, 320, window.innerHeight - 32),
      }));
      setPosition((current) => ({
        x: clamp(current.x, 16, window.innerWidth - size.w - 16),
        y: clamp(current.y, 16, window.innerHeight - size.h - 16),
      }));
    };

    window.addEventListener("resize", keepInViewport);
    return () => window.removeEventListener("resize", keepInViewport);
  }, [size.w, size.h]);

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMove = (event: PointerEvent) => {
      if (isDragging) {
        setPosition({
          x: clamp(
            event.clientX - dragOffset.x,
            16,
            window.innerWidth - size.w - 16,
          ),
          y: clamp(
            event.clientY - dragOffset.y,
            16,
            window.innerHeight - size.h - 16,
          ),
        });
      }
      if (isResizing && resizeStart) {
        setSize({
          w: clamp(
            resizeStart.w + event.clientX - resizeStart.x,
            280,
            window.innerWidth - position.x - 16,
          ),
          h: clamp(
            resizeStart.h + event.clientY - resizeStart.y,
            320,
            window.innerHeight - position.y - 16,
          ),
        });
      }
    };
    const handleUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeStart(null);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [
    isDragging,
    isResizing,
    dragOffset,
    resizeStart,
    position.x,
    position.y,
    size.w,
    size.h,
  ]);

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    event.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    });
  };

  const startResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: event.clientX,
      y: event.clientY,
      w: size.w,
      h: size.h,
    });
  };

  const resetSize = () => {
    setSize(defaultSize);
    setPosition(getDefaultPosition(defaultSize));
  };

  const [isLoading, setIsLoading] = useState(false);

  const askAssistant = async (
    history: ChatMessage[],
  ): Promise<ChatResponse> => {
    const currentEditorState = useCodeEditorStore.getState();

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: history,
        code: currentEditorState.getCode(),
        output: currentEditorState.output,
        error: currentEditorState.error,
        language: currentEditorState.language,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to contact the AI service.");
    }

    return data as ChatResponse;
  };

  const applyFix = (correctedCode: string) => {
    const currentCode = getCode();

    setPreviousCode(currentCode);
    setCode(correctedCode);

    setMessages((current) => [
      ...current,
      {
        id: createMessageId(),
        role: "assistant",
        text: "✅ Applied the proposed fix to the editor. Run the code to verify it.",
      },
    ]);
  };

  const restorePreviousCode = () => {
    if (!previousCode) return;

    setCode(previousCode);

    setMessages((current) => [
      ...current,
      {
        id: createMessageId(),
        role: "assistant",
        text: "↩️ Restored the code that existed before the AI fix.",
      },
    ]);
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = input.trim();

    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      text,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await askAssistant(nextMessages);

      setMessages((current) => [...current, createAssistantMessage(response)]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          text: "I could not connect to Ollama. Check that Ollama is running and the model is installed.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const autoFixCurrentCode = async () => {
    if (isLoading) return;

    const originalCode = getCode();

    if (!originalCode.trim()) {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          text: "There is no code in the editor to debug.",
        },
      ]);
      return;
    }

    setPreviousCode(originalCode);

    const debugRequest: ChatMessage = {
      id: createMessageId(),
      role: "user",
      text: "Debug the current workspace completely. Read the editor code, output panel, and error panel. Fix the current error and return the complete corrected code.",
    };

    let history = [...messages, debugRequest];

    setMessages(history);
    setIsLoading(true);

    try {
      for (let attempt = 1; attempt <= 3; attempt++) {
        const response = await askAssistant(history);
        const assistantMessage = createAssistantMessage(response);

        history = [...history, assistantMessage];
        setMessages(history);

        if (!response.correctedCode?.trim()) {
          break;
        }

        setCode(response.correctedCode);

        // Execute corrected code through our Judge API.
        await runCode();

        const latestState = useCodeEditorStore.getState();

        // shows latest error.
        if (!latestState.error) {
          const successMessage: ChatMessage = {
            id: createMessageId(),
            role: "assistant",
            text: `✅ Fix applied and verification run completed successfully after attempt ${attempt}.`,
          };

          setMessages((current) => [...current, successMessage]);
          return;
        }

        // Give the new runner error back to the AI.
        const verificationMessage: ChatMessage = {
          id: createMessageId(),
          role: "user",
          text: `The previous fix was applied and executed, but the code still failed.

        Current error:
        ${latestState.error}

        Current output:
        ${latestState.output}

        Please continue debugging and provide a new full correctedCode.`,
        };

        history = [...history, verificationMessage];
        setMessages(history);
      }
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          text: "I stopped automatic repair after three attempts. Review the latest suggested fix and error details before continuing.",
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          text: "Auto Fix could not complete because Ollama or the execution service was unavailable.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="group relative inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/80 px-3 py-2.5 shadow-sm transition-all hover:border-primary/40 hover:bg-primary/10"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="relative flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
            <MessageCircleMore className="h-4 w-4" />
          </div>
          <span className="hidden text-sm font-medium text-foreground/90 lg:inline">
            AI Chat
          </span>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.18 }}
            className="fixed z-[70] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
            style={{
              left: position.x,
              top: position.y,
              width: size.w,
              height: size.h,
            }}
          >
            <div
              onPointerDown={startDrag}
              className="flex cursor-grab items-center justify-between border-b border-border bg-gradient-to-r from-primary/20 to-purple-600/20 px-4 py-3 active:cursor-grabbing"
            >
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary p-2 text-primary-foreground shadow-md">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    CodeVyaas AI
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Editor-aware debugging assistant
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Reset chat window size"
                  onClick={resetSize}
                  className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Close chat"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex h-[calc(100%-64px)] flex-col bg-background p-4">
              {/* Messages Area */}
              <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-border bg-card p-3 shadow-inner">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.role === "user"
                        ? "ml-auto max-w-[85%] rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground shadow-md"
                        : "mr-auto max-w-[95%] rounded-xl border border-border bg-card px-3 py-2.5 text-sm shadow-sm"
                    }
                  >
                    <div className="flex items-start gap-2">
                      {message.role === "assistant" && (
                        <div className="mt-0.5 rounded-lg bg-primary/10 p-1.5 text-primary">
                          <Sparkles className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                          {message.text}
                        </p>

                        {message.role === "assistant" && message.errorType && (
                          <div className="rounded-lg border border-red-400/30 bg-red-600/90 p-2.5 text-xs text-white shadow-md">
                            <p className="font-bold tracking-wide">
                              ERROR TYPE
                            </p>
                            <p className="mt-1 font-mono text-sm">
                              {message.errorType}
                            </p>
                          </div>
                        )}

                        {message.role === "assistant" &&
                          Boolean(message.bugs?.length) && (
                            <div className="space-y-2">
                              {message.bugs?.map((bug, index) => (
                                <div
                                  key={`${bug.title}-${index}`}
                                  className="rounded-lg border border-amber-400/20 bg-amber-500/90 p-2.5 text-xs text-white shadow-md"
                                >
                                  <p className="font-bold">
                                    {bug.line ? `Line ${bug.line}: ` : ""}
                                    {bug.title}
                                  </p>
                                  <p className="mt-1 text-amber-50/90">
                                    {bug.reason}
                                  </p>
                                  <p className="mt-2 font-semibold text-amber-100">
                                    Fix:{" "}
                                    <span className="font-normal text-white">
                                      {bug.fix}
                                    </span>
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                        {message.role === "assistant" &&
                          message.correctedCode && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => applyFix(message.correctedCode!)}
                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500"
                              >
                                Apply Fix to Editor
                              </button>

                              <details className="w-full rounded-lg border border-border bg-card shadow-sm">
                                <summary className="cursor-pointer px-3 py-2 text-xs font-bold text-foreground select-none">
                                  Preview corrected code
                                </summary>
                                <div className="border-t border-border bg-black/5 p-3">
                                  <pre className="max-h-52 overflow-auto whitespace-pre-wrap text-xs font-mono leading-relaxed text-foreground">
                                    {message.correctedCode}
                                  </pre>
                                </div>
                              </details>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex items-start gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground shadow-sm">
                  <Move className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    Drag the header to move. Pull the bottom-right corner to
                    resize.
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={autoFixCurrentCode}
                  disabled={isLoading}
                  className="rounded-lg border-2 border-primary bg-primary px-4 py-2 text-xs font-extrabold text-white shadow-lg transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "Analyzing..." : "Debug & Auto Fix"}
                </button>

                {previousCode && (
                  <button
                    type="button"
                    onClick={restorePreviousCode}
                    disabled={isLoading}
                    className="rounded-lg border-2 border-border bg-card px-4 py-2 text-xs font-bold text-foreground shadow-sm transition hover:bg-muted disabled:opacity-50"
                  >
                    Restore Previous Code
                  </button>
                )}
              </div>

              <form
                onSubmit={sendMessage}
                className="mt-3 flex items-center gap-2 rounded-xl border-2 border-border bg-card p-2 shadow-md"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  aria-label="Chat message"
                  placeholder="Ask your next question…"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="rounded-lg bg-primary px-3 py-2 font-bold text-white shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>

            <div
              onPointerDown={startResize}
              aria-label="Resize chat window"
              className="absolute bottom-0 right-0 h-5 w-5 cursor-se-resize rounded-tl-lg border-t border-l border-border bg-gradient-to-br from-transparent to-primary/40"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
