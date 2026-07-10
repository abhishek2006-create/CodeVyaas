import NavigationHeader from "@/components/NavigationHeader";
import { ArrowRight, Command, Star } from "lucide-react";
import Link from "next/link";

function ProPlanView() {
  return (
    <div className="bg-background">
      <NavigationHeader />
      <div className="relative px-4 h-[80vh] flex items-center justify-center">
        <div className="relative max-w-xl mx-auto text-center">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 blur-2xl opacity-10" />

          <div className="relative glass-panel rounded-2xl p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.05] rounded-2xl" />

            <div className="relative">
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-primary/10 mb-6 ring-1 ring-border">
                <Star className="w-8 h-8 text-secondary" />
              </div>

              <h1 className="text-3xl font-semibold text-foreground mb-3">Pro Plan Active</h1>
              <p className="text-muted-foreground mb-8 text-lg">
                Experience the full power of professional development
              </p>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 text-foreground rounded-xl transition-all duration-200 border border-border hover:border-primary/50 group"
              >
                <Command className="w-5 h-5 text-primary" />
                <span>Open Editor</span>
                <ArrowRight className="w-5 h-5 text-secondary group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProPlanView;
