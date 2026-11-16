import NavigationHeader from "@/components/NavigationHeader";
import { ArrowRight, Command, Star } from "lucide-react";
import Link from "next/link";

function ProPlanView() {
  return (
    <div className="bg-background">
      <NavigationHeader />
      <div className="relative px-4 h-[80vh] flex items-center justify-center">
        <div className="relative max-w-xl mx-auto text-center">

          <div className="relative surface-panel rounded-2xl p-12">

            <div className="relative">
              <div className="inline-flex p-4 rounded-2xl bg-secondary mb-6 ring-1 ring-border">
                <Star className="w-8 h-8 text-secondary" />
              </div>

              <h1 className="text-3xl font-semibold text-foreground mb-3">Pro Plan Active</h1>
              <p className="text-muted-foreground mb-8 text-lg">
                Experience the full power of professional development
              </p>

              <Link
                href="/workspace"
                className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 bg-secondary hover:bg-accent text-foreground rounded-xl transition-all duration-200 border border-border hover:border-primary/50 group"
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
