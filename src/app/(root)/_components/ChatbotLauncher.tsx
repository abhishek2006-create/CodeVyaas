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
type ChatMessage = { id: number; role: "assistant" | "user"; text: string };

const defaultSize: Size = { w: 380, h: 520 };
const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    text: "Hello 👋 I can help debug, explain code, or suggest improvements.",
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

  const { getCode, language, output, error } = useCodeEditorStore();

  const code = getCode();

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

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage = { id: Date.now(), role: "user" as const, text };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          code,
          output,
          error,
          language,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: data.reply,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: "I could not connect to Ollama. Check that it is running.",
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
            className="fixed z-[70] overflow-hidden rounded-2xl border border-white/10 bg-background/95 shadow-2xl backdrop-blur-xl"
            style={{
              left: position.x,
              top: position.y,
              width: size.w,
              height: size.h,
            }}
          >
            <div
              onPointerDown={startDrag}
              className="flex cursor-grab items-center justify-between border-b border-border/60 bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-3 active:cursor-grabbing"
            >
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/15 p-2 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">CodeVyaas AI</p>
                  <p className="text-xs text-muted-foreground">
                    Ask anything about your code
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Reset chat window size"
                  onClick={resetSize}
                  className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-background/80 hover:text-foreground"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Close chat"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-background/80 hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex h-[calc(100%-64px)] flex-col bg-background/70 p-4">
              <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-border/60 bg-muted/20 p-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.role === "user"
                        ? "ml-8 rounded-xl bg-primary p-3 text-sm text-primary-foreground"
                        : "mr-8 flex items-start gap-2 rounded-xl bg-background/80 p-3 shadow-sm"
                    }
                  >
                    {message.role === "assistant" && (
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    )}
                    <p className="text-sm">{message.text}</p>
                  </div>
                ))}
                <div className="flex items-start gap-2 rounded-xl bg-primary/10 p-3 text-sm text-foreground/90">
                  <Move className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    Drag the header to move me anywhere. Pull the corner to
                    resize me.
                  </span>
                </div>
              </div>
              <form
                onSubmit={sendMessage}
                className="mt-3 flex items-center gap-2 rounded-xl border border-primary/20 bg-background/90 p-2"
              >
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  aria-label="Chat message"
                  placeholder="Ask your next question…"
                  className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="rounded-lg bg-primary p-2 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
            <div
              onPointerDown={startResize}
              aria-label="Resize chat window"
              className="absolute bottom-0 right-0 h-5 w-5 cursor-se-resize rounded-tl-lg bg-gradient-to-br from-transparent to-primary/30"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
