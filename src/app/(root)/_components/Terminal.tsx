"use client";

import { useState } from "react";
import { 
  ChevronUp, 
  Maximize2, 
  MoreHorizontal, 
  Plus, 
  TerminalIcon, 
  X,
  AlertCircle,
  Layout,
  PlayCircle,
  Radio
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  { id: "problems", label: "Problems", icon: AlertCircle, count: 3 },
  { id: "output", label: "Output", icon: PlayCircle },
  { id: "debug", label: "Debug Console", icon: Layout },
  { id: "terminal", label: "Terminal", icon: TerminalIcon },
  { id: "ports", label: "Ports", icon: Radio },
];

export default function Terminal() {
  const [activeTab, setActiveTab] = useState("terminal");
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className={`glass-panel rounded-xl overflow-hidden transition-all duration-300 ${isMinimized ? "h-12" : "h-72"}`}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-border bg-muted/20">
        <div className="flex items-center gap-4 h-full">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMinimized(false);
              }}
              className={`flex items-center gap-2 px-1 h-full text-xs font-medium transition-colors relative ${
                activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count && (
                <span className="flex items-center justify-center size-4 rounded-full bg-primary/20 text-[10px] text-primary">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="flex items-center gap-1 px-2 py-1 bg-muted/20 rounded text-[10px] border border-border mr-2">
            <span className="opacity-50 font-mono">1:</span>
            <span>powershell</span>
          </div>
          <button className="p-1 hover:bg-muted/40 rounded transition-colors"><Plus className="size-4" /></button>
          <button className="p-1 hover:bg-muted/40 rounded transition-colors"><MoreHorizontal className="size-4" /></button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-muted/40 rounded transition-colors"
          >
            <ChevronUp className={`size-4 transition-transform ${isMinimized ? "rotate-180" : ""}`} />
          </button>
          <button className="p-1 hover:bg-muted/40 rounded transition-colors"><X className="size-4" /></button>
        </div>
      </div>

      {/* Terminal Content */}
      <AnimatePresence mode="wait">
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-4 font-mono text-sm h-[calc(100%-3rem)] overflow-auto"
            style={{ backgroundColor: "var(--editor-background)", color: "var(--editor-foreground)" }}
          >
            {activeTab === "terminal" && (
              <div className="space-y-1">
                <div className="flex gap-2" style={{ color: "var(--editor-function)" }}>
                  <span>Microsoft Windows [Version 10.0.22631.3593]</span>
                </div>
                <div style={{ color: "var(--editor-comment)" }}>(c) Microsoft Corporation. All rights reserved.</div>
                <div className="pt-2 flex items-center gap-2">
                  <span style={{ color: "var(--editor-string)" }}>PS C:\Users\Ace\Desktop\CodeVyaas&gt;</span>
                  <span className="animate-pulse w-2 h-4" style={{ backgroundColor: "var(--editor-foreground)", opacity: 0.5 }} />
                </div>
              </div>
            )}
            {activeTab === "problems" && (
              <div className="text-muted-foreground italic">3 problems detected in the current workspace.</div>
            )}
            {activeTab !== "terminal" && activeTab !== "problems" && (
              <div className="text-muted-foreground italic">No {activeTab} output yet.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
