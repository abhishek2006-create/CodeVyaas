"use client";

import Script from "next/script";
import { useRef, useState } from "react";

const cameramanId = "a341bb581e0d49a68158b449c5df2c40";

type Viewer = {
  start: () => void;
  addEventListener: (event: "viewerready", listener: () => void) => void;
  setBackground: (background: { color: [number, number, number] }, callback: () => void) => void;
};

type ViewerConstructor = new (iframe: HTMLIFrameElement) => {
  init: (id: string, options: {
    success: (viewer: Viewer) => void;
    [option: string]: number | string | ((viewer: Viewer) => void);
  }) => void;
};

export default function ModelBackdrop({ className }: { className: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const initialized = useRef(false);
  const [ready, setReady] = useState(false);

  function startViewer() {
    const ViewerClient = (window as Window & { Sketchfab?: ViewerConstructor }).Sketchfab;
    if (!ViewerClient || !frame.current || initialized.current ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    initialized.current = true;
    new ViewerClient(frame.current).init(cameramanId, {
      autostart: 1,
      autospin: 0.045,
      scrollwheel: 0,
      ui_theme: "dark",
      ui_start: 0,
      ui_stop: 0,
      ui_infos: 0,
      ui_watermark: 0,
      ui_watermark_link: 0,
      ui_controls: 0,
      ui_general_controls: 0,
      ui_hint: 0,
      success(viewer) {
        viewer.addEventListener("viewerready", () => {
          // The hero's hue filter maps this dark teal to the page's plum backdrop.
          viewer.setBackground({ color: [0, 0.086, 0.070] }, () => setReady(true));
        });
        viewer.start();
      },
    });
  }

  return (
    <div className={className}>
      <iframe
        ref={frame}
        title="Interactive 3D Cameraman"
        allow="autoplay"
        loading="eager"
        tabIndex={ready ? 0 : -1}
        aria-hidden={!ready}
        className={`block h-full w-full border-0 motion-safe:transition-opacity ${ready ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <Script
        src="https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js"
        onReady={startViewer}
        strategy="afterInteractive"
      />
    </div>
  );
}
