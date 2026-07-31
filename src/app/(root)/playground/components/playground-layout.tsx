"use client";

import { useRef, useCallback } from "react";
import { usePlayground } from "../hooks/playground-context";
import { AlertCircle, Loader2, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaygroundEditor } from "./playground-editor";
import { PlaygroundHeader } from "./playground-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TemplateFileTree } from "./playground-explorer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import WebContainerPreview from "../webcontainers/components/webcontainer-preview";
import { useWebContainer } from "../webcontainers/hooks/useWebContainer";
import { TooltipProvider } from "@/components/ui/tooltip";
import dynamic from "next/dynamic";
import type { TerminalRef } from "../webcontainers/components/terminal";

const PlaygroundTerminal = dynamic(
  () => import("../webcontainers/components/terminal"),
  {
    ssr: false,
  },
);

export function PlaygroundLayout() {
  const {
    playgroundData,
    error: playgroundError,
    isLoading: isPlaygroundLoading,
    templateData,
    activeFile,
    activeFileId,
    openFiles,
    setActiveFileId,
    closeFile,
    closeAllFiles,
    updateActiveFileContent,
    isPreviewVisible,
    isTerminalVisible,
    handleAddFile,
    handleAddFolder,
    handleDeleteFile,
    handleDeleteFolder,
    handleRenameFile,
    handleRenameFolder,
    openFile,
  } = usePlayground();

  // 1. Ref to imperative terminal API
  const terminalRef = useRef<TerminalRef>(null);

  // 2. Stable callback to forward WebContainer stdout/stderr streams to xterm
  const handleTerminalData = useCallback((data: string) => {
    if (terminalRef.current) {
      terminalRef.current.writeToTerminal(data);
    }
  }, []);

  // 3. Connect the terminal callback to useWebContainer hook
  const {
    container,
    previewUrl,
    isLoading: containerLoading,
    error: containerError,
    writeFile: writeFileSync,
  } = useWebContainer({
    templateData: templateData as any,
    onTerminalData: handleTerminalData,
  });

  if (playgroundError) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">{playgroundError}</p>
        <Button onClick={() => window.location.reload()} variant="destructive">
          Try Again
        </Button>
      </div>
    );
  }

  if (isPlaygroundLoading || !templateData) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading playground...</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <TemplateFileTree
          data={templateData}
          onFileSelect={openFile}
          selectedFile={activeFile || undefined}
          onAddFile={handleAddFile}
          onAddFolder={handleAddFolder}
          onDeleteFile={handleDeleteFile}
          onDeleteFolder={handleDeleteFolder}
          onRenameFile={handleRenameFile}
          onRenameFolder={handleRenameFolder}
        />
        <SidebarInset>
          {/* Header with live preview URL */}
          <PlaygroundHeader liveUrl={previewUrl} />

          <main className="flex-1 flex flex-col overflow-hidden">
            {openFiles.length > 0 ? (
              <div className="h-full flex flex-col">
                {/* File Tabs */}
                <div className="border-b bg-muted/30">
                  <Tabs
                    value={activeFileId || ""}
                    onValueChange={setActiveFileId}
                  >
                    <div className="flex items-center justify-between px-4 py-1">
                      <TabsList className="h-9 bg-transparent p-0 gap-1">
                        {openFiles.map((file) => (
                          <TabsTrigger
                            key={file.id}
                            value={file.id}
                            className="relative h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm group border"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="max-w-[150px] truncate text-xs font-medium">
                                {file.filename}.{file.fileExtension}
                              </span>
                              {file.hasUnsavedChanges && (
                                <span className="h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                              )}
                              <span
                                role="button"
                                tabIndex={0}
                                className="ml-1.5 h-4 w-4 hover:bg-muted-foreground/20 rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  closeFile(file.id);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    closeFile(file.id);
                                  }
                                }}
                              >
                                <X className="h-3 w-3" />
                              </span>
                            </div>
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {openFiles.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={closeAllFiles}
                          className="h-7 px-2 text-[10px] uppercase tracking-wider font-bold text-muted-foreground"
                        >
                          Close All
                        </Button>
                      )}
                    </div>
                  </Tabs>
                </div>

                {/* Editor, Preview & Terminal Panel Group */}
                <div className="flex-1 relative">
                  <ResizablePanelGroup
                    orientation="vertical"
                    className="h-full"
                  >
                    <ResizablePanel defaultSize={isTerminalVisible ? 70 : 100}>
                      <ResizablePanelGroup
                        orientation="horizontal"
                        className="h-full"
                      >
                        <ResizablePanel
                          defaultSize={isPreviewVisible ? 50 : 100}
                          minSize={30}
                        >
                          <PlaygroundEditor
                            activeFile={activeFile || undefined}
                            content={activeFile?.content || ""}
                            onContentChange={updateActiveFileContent}
                          />
                        </ResizablePanel>

                        {isPreviewVisible && (
                          <>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={50} minSize={30}>
                              <WebContainerPreview
                                templateData={templateData as any}
                                writeFileSync={writeFileSync}
                                isLoading={containerLoading}
                                error={containerError}
                                serverUrl={previewUrl}
                                forceResetup={false}
                              />
                            </ResizablePanel>
                          </>
                        )}
                      </ResizablePanelGroup>
                    </ResizablePanel>

                    {isTerminalVisible && (
                      <>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={30} minSize={10}>
                          <div className="h-full flex flex-col min-h-0 overflow-hidden">
                            {/* 4. Pass ref to terminal */}
                            <PlaygroundTerminal
                              ref={terminalRef}
                              webContainerInstance={container}
                            />
                          </div>
                        </ResizablePanel>
                      </>
                    )}
                  </ResizablePanelGroup>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-muted-foreground gap-4 bg-muted/5">
                <FileText className="h-16 w-16 text-muted-foreground/20" />
                <div className="text-center">
                  <p className="text-lg font-medium">No files open</p>
                  <p className="text-sm">
                    Select a file from the explorer to start editing
                  </p>
                </div>
              </div>
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
