"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import "xterm/css/xterm.css";
import type { Terminal } from "xterm";
import type { FitAddon } from "xterm-addon-fit";
import type { SearchAddon } from "xterm-addon-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Copy, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import WebContainerService from "../service/webContainerService";

interface TerminalProps {
  webcontainerUrl?: string;
  className?: string;
  theme?: "dark" | "light";
  webContainerInstance?: any;
}

export interface TerminalRef {
  writeToTerminal: (data: string) => void;
  clearTerminal: () => void;
  focusTerminal: () => void;
}

const TerminalComponent = forwardRef<TerminalRef, TerminalProps>(
  ({ className, theme = "dark" }, ref) => {
    const shellStarted = useRef(false);
    const terminalRef = useRef<HTMLDivElement>(null);
    const term = useRef<Terminal | null>(null);
    const fitAddon = useRef<FitAddon | null>(null);
    const searchAddon = useRef<SearchAddon | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const shellProcess = useRef<any>(null);

    const terminalThemes = {
      dark: {
        background: "#09090B",
        foreground: "#FAFAFA",
        cursor: "#FAFAFA",
        cursorAccent: "#09090B",
        selection: "#27272A",
        black: "#18181B",
        red: "#EF4444",
        green: "#22C55E",
        yellow: "#EAB308",
        blue: "#3B82F6",
        magenta: "#A855F7",
        cyan: "#06B6D4",
        white: "#F4F4F5",
        brightBlack: "#3F3F46",
        brightRed: "#F87171",
        brightGreen: "#4ADE80",
        brightYellow: "#FDE047",
        brightBlue: "#60A5FA",
        brightMagenta: "#C084FC",
        brightCyan: "#22D3EE",
        brightWhite: "#FFFFFF",
      },
      light: {
        background: "#FFFFFF",
        foreground: "#18181B",
        cursor: "#18181B",
        cursorAccent: "#FFFFFF",
        selection: "#E4E4E7",
        black: "#18181B",
        red: "#DC2626",
        green: "#16A34A",
        yellow: "#CA8A04",
        blue: "#2563EB",
        magenta: "#9333EA",
        cyan: "#0891B2",
        white: "#F4F4F5",
        brightBlack: "#71717A",
        brightRed: "#EF4444",
        brightGreen: "#22C55E",
        brightYellow: "#EAB308",
        brightBlue: "#3B82F6",
        brightMagenta: "#A855F7",
        brightCyan: "#06B6D4",
        brightWhite: "#FAFAFA",
      },
    };

    const clearTerminal = useCallback(() => {
      if (term.current) {
        term.current.clear();
      }
    }, []);

    const initializeTerminal = useCallback(async () => {
      const [{ Terminal }, { FitAddon }, { SearchAddon }, { WebLinksAddon }] =
        await Promise.all([
          import("xterm"),
          import("xterm-addon-fit"),
          import("xterm-addon-search"),
          import("xterm-addon-web-links"),
        ]);

      if (!terminalRef.current || term.current) return;

      const terminal = new Terminal({
        cursorBlink: true,
        fontFamily: '"Fira Code", "JetBrains Mono", "Consolas", monospace',
        fontSize: 14,
        lineHeight: 1.2,
        letterSpacing: 0,
        theme: terminalThemes[theme],
        allowTransparency: false,
        convertEol: true,
        scrollback: 5000,
        tabStopWidth: 4,
        fastScrollSensitivity: 5,
        scrollSensitivity: 1,
      });

      const fitAddonInstance = new FitAddon();
      const webLinksAddon = new WebLinksAddon();
      const searchAddonInstance = new SearchAddon();

      terminal.loadAddon(fitAddonInstance);
      terminal.loadAddon(webLinksAddon);
      terminal.loadAddon(searchAddonInstance);

      terminal.open(terminalRef.current);

      fitAddon.current = fitAddonInstance;
      searchAddon.current = searchAddonInstance;
      term.current = terminal;

      setTimeout(() => {
        fitAddonInstance.fit();
      }, 100);

      terminal.writeln("WebContainer Terminal");

      return terminal;
    }, [theme]);

    useImperativeHandle(ref, () => ({
      writeToTerminal: (data: string) => {
        if (term.current) {
          term.current.write(data);
        }
      },
      clearTerminal: () => {
        clearTerminal();
      },
      focusTerminal: () => {
        if (term.current) {
          term.current.focus();
        }
      },
    }));

    const startShell = useCallback(async () => {
      if (!term.current || shellProcess.current) return;

      try {
        const instance = await WebContainerService.getInstance();
        console.log("Starting Shell");

        const shell = await instance.spawn("jsh", {
          terminal: {
            cols: term.current.cols,
            rows: term.current.rows,
          },
        });

        shellProcess.current = shell;

        shell.output.pipeTo(
          new WritableStream({
            write(data) {
              term.current?.write(data);
            },
          }),
        );

        console.log("Shell started");
        const input = shell.input.getWriter();

        const dataListener = term.current.onData((data) => {
          input.write(data);
        });

        setIsConnected(true);

        shell.exit.then(() => {
          shellProcess.current = null;
          setIsConnected(false);
          dataListener.dispose();
          input.releaseLock();
        });
      } catch (error) {
        console.error("Failed to start shell:", error);
      }
    }, []);

    useEffect(() => {
      let cancelled = false;
      let resizeObserver: ResizeObserver | null = null;
      let termEl: HTMLDivElement | null = null;

      const handleWheel = (e: WheelEvent) => {
        if (term.current) {
          e.stopPropagation();
        }
      };

      async function init() {
        await initializeTerminal();

        if (cancelled || !term.current) return;

        termEl = terminalRef.current;
        termEl?.addEventListener("wheel", handleWheel, { passive: false });

        if (!shellStarted.current) {
          shellStarted.current = true;
          await startShell();
        }

        resizeObserver = new ResizeObserver(() => {
          if (fitAddon.current) {
            setTimeout(() => {
              fitAddon.current?.fit();

              if (shellProcess.current) {
                shellProcess.current.resize({
                  cols: term.current?.cols ?? 80,
                  rows: term.current?.rows ?? 24,
                });
              }
            }, 100);
          }
        });

        if (terminalRef.current) {
          resizeObserver.observe(terminalRef.current);
        }
      }

      init();

      return () => {
        cancelled = true;

        if (termEl) {
          termEl.removeEventListener("wheel", handleWheel);
        }

        resizeObserver?.disconnect();
        shellStarted.current = false;

        if (shellProcess.current) {
          shellProcess.current.kill();
          shellProcess.current = null;
        }

        term.current?.dispose();
        term.current = null;
      };
    }, [initializeTerminal, startShell]);

    const copyTerminalContent = useCallback(async () => {
      if (term.current) {
        const content = term.current.getSelection();
        if (content) {
          try {
            await navigator.clipboard.writeText(content);
          } catch (error) {
            console.error("Failed to copy to clipboard:", error);
          }
        }
      }
    }, []);

    const downloadTerminalLog = useCallback(() => {
      if (term.current) {
        const buffer = term.current.buffer.active;
        let content = "";

        for (let i = 0; i < buffer.length; i++) {
          const line = buffer.getLine(i);
          if (line) {
            content += line.translateToString(true) + "\n";
          }
        }

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `terminal-log-${new Date().toISOString().slice(0, 19)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }, []);

    const searchInTerminal = useCallback((termToFind: string) => {
      if (searchAddon.current && termToFind) {
        searchAddon.current.findNext(termToFind);
      }
    }, []);

    return (
      <div
        className={cn(
          "flex flex-col h-full bg-background border rounded-lg overflow-hidden",
          className,
        )}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm font-medium">WebContainer Terminal</span>
            {isConnected && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Connected</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {showSearch && (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    searchInTerminal(e.target.value);
                  }}
                  className="h-6 w-32 text-xs"
                />
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="h-6 w-6 p-0"
            >
              <Search className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={copyTerminalContent}
              className="h-6 w-6 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={downloadTerminalLog}
              className="h-6 w-6 p-0"
            >
              <Download className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearTerminal}
              className="h-6 w-6 p-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex-1 relative min-h-0 w-full overflow-hidden">
          <div
            ref={terminalRef}
            className="absolute inset-0 p-2"
            style={{
              background: terminalThemes[theme].background,
            }}
          />
        </div>
      </div>
    );
  },
);

TerminalComponent.displayName = "TerminalComponent";

export default TerminalComponent;
