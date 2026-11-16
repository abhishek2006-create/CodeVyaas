import HeaderProfileBtn from "@/app/(root)/_components/HeaderProfileBtn";
import { SignedOut } from "@clerk/nextjs";
import { Code2, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function NavigationHeader() {
  return (
    <div className="sticky top-0 z-50 w-full surface-header transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative flex min-h-16 flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2">
          <div className="flex items-center gap-3 sm:gap-8">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group relative sm:gap-3">

              {/* Logo */}
              <div className="relative bg-secondary p-2 rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all shadow-md">
                <Image
                    src="/compiler.png"
                    alt="Compiler"
                    width={24}
                    height={24}
                    className="size-6 -rotate-6 transition-transform duration-500 group-hover:rotate-0 bg-primary"
                />
              </div>

              <div className="relative">
                <span
                  className="block text-base font-semibold text-foreground sm:text-lg"
                >
                  CodeVyaas
                </span>
                <span className="hidden text-xs font-medium text-muted-foreground sm:block">
                  Interactive Code Editor
                </span>
              </div>
            </a>

            {/* snippets Link */}
            <Link
              href="/snippets"
              className="relative group flex items-center gap-2 px-2 py-1.5 rounded-lg text-muted-foreground bg-muted hover:bg-secondary sm:px-4
              border border-border hover:border-primary/50 transition-all duration-300 shadow-sm overflow-hidden"
            >
              <Code2 className="w-4 h-4 relative z-10 group-hover:rotate-3 transition-transform" />
              <span className="sr-only text-sm font-medium sm:not-sr-only sm:relative sm:z-10 group-hover:text-foreground transition-colors">
                Snippets
              </span>
            </Link>
          </div>

          {/* right rection */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/workspace" className="surface-button rounded-lg px-2.5 py-2 text-xs font-medium sm:text-sm">Workspace</Link>

            <SignedOut>
              <Link
                href="/pricing"
                className="surface-button flex items-center gap-2 rounded-lg px-4 py-1.5"
              >
                <Sparkles className="size-4 text-primary" />
                <span className="text-sm font-medium">
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
