"use client";

import React from "react";
import { useParams } from "next/navigation";
import { PlaygroundProvider } from "../hooks/playground-context";
import { PlaygroundLayout } from "../components/playground-layout";
import NavigationHeader from "@/components/NavigationHeader";

// page.tsx / MainPlaygroundPage.tsx
const MainPlaygroundPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return (
    // Use h-screen (or h-dvh) with overflow-hidden
    <div className="flex flex-col min-h-screen min-w-screen overflow-hidden">
      <PlaygroundProvider id={id}>
        <NavigationHeader />
        {/* Fill ONLY remaining vertical space below the header */}
        <div className="flex-1 min-h-0 relative overflow-hidden">
          <PlaygroundLayout />
        </div>
      </PlaygroundProvider>
    </div>
  );
};
export default MainPlaygroundPage;
