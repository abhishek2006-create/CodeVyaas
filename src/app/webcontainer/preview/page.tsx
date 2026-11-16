"use client";

import { useEffect, useState } from "react";

function readPreviewUrl() {
  try {
    const url = new URL(decodeURIComponent(window.location.hash.slice(1)));
    if (url.protocol === "https:" && !url.username && !url.password &&
      url.hostname.endsWith(".webcontainer-api.io")) return url.href;
  } catch {
    // Missing or invalid preview address.
  }
  return null;
}

export default function StandaloneWebContainerPreview() {
  const [url, setUrl] = useState<string | null | undefined>(undefined);
  useEffect(() => setUrl(readPreviewUrl()), []);

  return (
    <main className="h-dvh">
      {url ? (
        <iframe
          src={url}
          title="WebContainer Live Preview"
          className="block h-full w-full border-0 bg-white"
          allow="cross-origin-isolated; autoplay; camera; microphone; geolocation"
        />
      ) : (
        <p className="grid h-full place-items-center p-6 text-center text-sm text-muted-foreground">
          {url === undefined ? "Opening live preview…" : "Return to the playground and open the live preview again."}
        </p>
      )}
    </main>
  );
}
