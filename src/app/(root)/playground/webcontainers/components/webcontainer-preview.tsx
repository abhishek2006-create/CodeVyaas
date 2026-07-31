"use client";

import { Loader2, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WebContainerPreviewProps {
  serverUrl: string | null;
  isLoading: boolean;
  error: string | null;
  templateData?: any;
  writeFileSync?: (path: string, content: string) => Promise<void>;
  forceResetup?: boolean;
}

export default function WebContainerPreview({
  serverUrl,
  isLoading,
  error,
}: WebContainerPreviewProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 bg-background text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">
          Starting WebContainer dev server...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-background">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
        <p className="text-sm font-semibold text-red-600 mb-1">
          Failed to load preview
        </p>
        <p className="text-xs text-muted-foreground max-w-md">{error}</p>
      </div>
    );
  }

  if (!serverUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/60" />
        <p className="text-sm">Waiting for server ready event...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-background border-l">
      {/* 🌐 Live Server Address Bar Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/40 gap-2 text-xs">
        <div className="flex-1 truncate bg-background border rounded px-2.5 py-1 text-muted-foreground select-all font-mono">
          {serverUrl}
        </div>

        {/* Open in New Tab Button */}
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2.5 gap-1.5 shrink-0"
          onClick={() => window.open(serverUrl, "_blank")}
          title="Open preview in new tab"
        >
          <span>Open Live</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Preview Iframe */}
      <div className="relative flex-1 w-full h-full bg-white">
        <iframe
          src={serverUrl}
          className="w-full h-full border-0"
          title="WebContainer Live Preview"
          allow="cross-origin-isolated; autoplay; camera; microphone; geolocation"
        />
      </div>
    </div>
  );
}
