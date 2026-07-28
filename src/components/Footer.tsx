// @/components/Footer.tsx
"use client";

import { Blocks } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Footer() {
  const pathname = usePathname();

  // Hide global footer when the user is inside the playground editor
  if (pathname?.startsWith("/playground")) {
    return null;
  }

  return (
    <footer className="relative border-t border-border mt-auto glass-panel border-l-0 border-r-0 border-b-0 rounded-none">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Blocks className="size-5" />
            <span>Built for developers, by Abhishek And Aditya Raj</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/support"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Support
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
