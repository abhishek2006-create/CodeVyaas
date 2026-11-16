import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { Code2, Sparkles } from "lucide-react";
import { SignedIn } from "@clerk/nextjs";
import LanguageSelector from "./LanguageSelector";
import RunButton from "./RunButton";
import HeaderProfileBtn from "./HeaderProfileBtn";
import ChatbotLauncher from "./ChatbotLauncher";
import Image from "next/image";

async function Header() {
  let convexUser: { isPro?: boolean } | null = null;

  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "http://localhost:3210");
    const user = await currentUser();

    convexUser = await convex.query(api.users.getUser, {
      userId: user?.id || "",
    });
  } catch {
    convexUser = null;
  }

  return (
    <div className="relative z-10">
      <div
        className="surface-panel mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl p-3 transition-all duration-300 sm:p-5"
      >
        <div className="flex items-center gap-5">
            <a href="/" className="flex items-center gap-3 group relative">


              {/* Logo */}
              <div
                className="relative bg-secondary p-2 rounded-xl ring-1
              ring-white/10 group-hover:ring-white/20 transition-all shadow-md"
              >
                <Image
                    src="/compiler.png"
                    alt="Compiler"
                    width={24}
                    height={24}
                    className="size-6 -rotate-6 transition-transform duration-500 group-hover:rotate-0 bg-primary"
                />
              </div>

              <div className="flex flex-col">
                <span className="block text-lg font-semibold text-foreground">
                  CodeVyaas
                </span>
                <span className="block text-xs text-primary text-muted-foreground font-medium">
                  Interactive Code Editor
                </span>
              </div>
            </a>

          {/* Navigation */}
          <nav className="hidden items-center space-x-1 md:flex">
            <Link
              href="/snippets"
              className="relative group flex items-center gap-2 px-4 py-1.5 rounded-lg text-muted-foreground bg-muted
                hover:bg-secondary border border-border hover:border-primary/50 transition-all duration-300 shadow-sm overflow-hidden"
            >
              <Code2 className="w-4 h-4 relative z-10 group-hover:rotate-3 transition-transform" />
              <span
                className="text-sm font-medium relative z-10 group-hover:text-foreground
                 transition-colors"
              >
                Snippets
              </span>
            </Link>
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <LanguageSelector hasAccess={Boolean(convexUser?.isPro)} />
          </div>

          {!convexUser?.isPro && (
            <Link
              href="/pricing"
              className="surface-button flex items-center gap-2 rounded-lg px-4 py-1.5"
            >
              <Sparkles className="size-4 text-primary" />
              <span className="text-sm font-medium">
                Pro
              </span>
            </Link>
          )}

          <SignedIn>
            <div className="flex items-center gap-2">
              <RunButton />
              <ChatbotLauncher />
            </div>
          </SignedIn>

          <div className="pl-3 border-l border-border">
            <HeaderProfileBtn />
          </div>
        </div>
      </div>
    </div>
  );
}
export default Header;
