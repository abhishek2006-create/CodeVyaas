"use client";

import { Loader2, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { reloadPreview } from "@webcontainer/api/utils";
import { openWebContainerPreview } from "../open-preview";

interface WebContainerPreviewProps {
  serverUrl: string | null;
  status: string;
  error: string | null;
  onRetry: () => void;
}

export default function WebContainerPreview({
  serverUrl,
  status,
  error,
  onRetry,
}: WebContainerPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    const iframe = iframeRef.current;
    if (!iframe || !serverUrl) return;
    setIsRefreshing(true);
    try {
      await reloadPreview(iframe);
    } catch {
      iframe.src = serverUrl;
    } finally {
      setIsRefreshing(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-background">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
        <p className="text-sm font-semibold text-red-600 mb-1">
          Failed to load preview
        </p>
        <p className="max-h-36 max-w-md overflow-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">{error}</p>
        <Button className="mt-4" size="sm" variant="outline" onClick={onRetry}>Retry preview</Button>
      </div>
    );
  }

  if (!serverUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/60" />
        <p className="text-sm" role="status">{status}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-background border-l">
      {/* 🌐 Live Server Address Bar Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted gap-2 text-xs">
        <div className="flex-1 truncate bg-background border rounded px-2.5 py-1 text-muted-foreground select-all font-mono">
          {serverUrl}
        </div>

        {/* Reload Preview Button */}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 shrink-0"
          onClick={handleRefresh}
          title="Reload Preview"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>

        {/* Open in New Tab Button */}
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2.5 gap-1.5 shrink-0"
          onClick={() => openWebContainerPreview(serverUrl)}
          title="Open preview in new tab"
        >
          <span>Open Live</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Preview Iframe */}
      <div className="relative flex-1 w-full h-full bg-white">
        <iframe
          ref={iframeRef}
          src={serverUrl}
          className="w-full h-full border-0"
          title="WebContainer Live Preview"
          allow="cross-origin-isolated; autoplay; camera; microphone; geolocation"
        />
      </div>
    </div>
  );
}
