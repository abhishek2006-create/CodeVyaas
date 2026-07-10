import HeaderProfileBtn from "@/app/(root)/_components/HeaderProfileBtn";
import NavbarSettings from "@/components/settings/NavbarSettings";
import { SignedOut } from "@clerk/nextjs";
import { Blocks, Code2, Sparkles } from "lucide-react";
import Link from "next/link";

function NavigationHeader() {
  return (
    <div className="sticky top-0 z-50 w-full glass-header transition-all backdrop-blur-md duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group relative">
              {/* logo hover effect */}
              <div
                className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 
              group-hover:opacity-100 transition-all duration-500 blur-xl"
              />

              {/* Logo */}
              <div className="relative bg-gradient-to-br from-gray-900 to-black p-2 rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all shadow-md">
                <Blocks className="w-6 h-6 text-blue-400 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500" />
              </div>

              <div className="relative">
                <span
                  className="block text-lg font-semibold bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600
                 dark:from-blue-400 dark:via-blue-300 dark:to-purple-400 text-transparent bg-clip-text"
                >
                  CodeVyaas
                </span>
                <span className="block text-xs text-blue-600/60 dark:text-blue-400/60 font-medium">
                  Interactive Code Editor
                </span>
              </div>
            </Link>

            {/* snippets Link */}
            <Link
              href="/snippets"
              className="relative group flex items-center gap-2 px-4 py-1.5 rounded-lg text-muted-foreground bg-muted/20 hover:bg-primary/10 
              border border-border hover:border-primary/50 transition-all duration-300 shadow-sm overflow-hidden"
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-primary/5 
              to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <Code2 className="w-4 h-4 relative z-10 group-hover:rotate-3 transition-transform" />
              <span className="text-sm font-medium relative z-10 group-hover:text-foreground transition-colors">
                Snippets
              </span>
            </Link>
          </div>

          {/* right rection */}
          <div className="flex items-center gap-4">
            <NavbarSettings />

            <SignedOut>
              <Link
                href="/pricing"
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-amber-500/20
                 hover:border-amber-500/40 bg-gradient-to-r from-amber-500/10 
                to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 transition-all 
                duration-300"
              >
                <Sparkles className="w-4 h-4 text-amber-400 hover:text-amber-300" />
                <span className="text-sm font-medium text-amber-400/90 hover:text-amber-300">
                  Pro
                </span>
              </Link>
            </SignedOut>

            {/* profile button */}
            <HeaderProfileBtn />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavigationHeader;
