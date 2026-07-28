"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Save,
  Loader2,
  Sparkles,
  Settings,
  Plus,
  Lightbulb,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlayground } from "../hooks/playground-context";
import { useParams } from "next/navigation";

export function PlaygroundHeader() {
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

      {activeFile && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {activeFile.fileExtension
              ? `${activeFile.filename}.${activeFile.fileExtension}`
              : activeFile.filename}
          </span>

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
                onClick={() =>
                  setIsAISuggestionsEnabled(!isAISuggestionsEnabled)
                }
              >
                AI Suggestions: {isAISuggestionsEnabled ? "On" : "Off"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
}
