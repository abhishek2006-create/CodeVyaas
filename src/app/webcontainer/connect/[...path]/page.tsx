"use client";

import { setupConnect } from "@webcontainer/api/connect";
import { useEffect, useRef, useState } from "react";

export default function WebContainerConnectPage() {
  const started = useRef(false);
  const [disconnected, setDisconnected] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!window.opener) {
      setDisconnected(true);
      return;
    }
    setupConnect();
  }, []);

  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <p className="text-sm text-muted-foreground">
        {disconnected
          ? "Return to the playground and open the live preview again."
          : "Connecting to the live preview…"}
      </p>
    </main>
  );
}
