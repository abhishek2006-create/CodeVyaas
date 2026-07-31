"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Save, Settings, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlayground } from "../hooks/playground-context";

export function PlaygroundHeader({ liveUrl }: { liveUrl?: string | null }) {
  const {
    playgroundData,
    activeFile,
    openFiles,
    handleSave,
    handleSaveAll,
    isPreviewVisible,
    setIsPreviewVisible,
    isTerminalVisible,
    setIsTerminalVisible,
    isAISuggestionsEnabled,
    setIsAISuggestionsEnabled,
  } = usePlayground();

  const hasUnsavedChanges = openFiles.some((f) => f.hasUnsavedChanges);

  return (
    <header className="h-14 border-b flex items-center px-4 justify-between">
      <div className="flex items-center">
        <SidebarTrigger className="mr-2" />
        <h1 className="text-lg font-semibold">
          {playgroundData?.title || "Code Editor"}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Active File Name Indicator */}
        {activeFile && (
          <span className="text-sm text-muted-foreground mr-2 font-mono">
            {activeFile.fileExtension
              ? `${activeFile.filename}.${activeFile.fileExtension}`
              : activeFile.filename}
          </span>
        )}

        {/* 🚀 LIVE SERVER LINK BUTTON */}
        {liveUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(liveUrl, "_blank")}
            className="gap-2 text-xs h-8 border-green-500/50 hover:bg-green-500/10 text-green-600 dark:text-green-400"
            title="Open live dev server in a new browser tab"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Open Live Link
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        )}

        {activeFile && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSave()}
              disabled={!activeFile.hasUnsavedChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveAll}
              disabled={!hasUnsavedChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Save All
            </Button>
          </>
        )}

        {/* Settings Dropdown */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setIsPreviewVisible(!isPreviewVisible)}
            >
              {isPreviewVisible ? "Hide" : "Show"} Preview
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsTerminalVisible(!isTerminalVisible)}
            >
              {isTerminalVisible ? "Hide" : "Show"} Terminal
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setIsAISuggestionsEnabled(!isAISuggestionsEnabled)}
            >
              AI Suggestions: {isAISuggestionsEnabled ? "On" : "Off"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
