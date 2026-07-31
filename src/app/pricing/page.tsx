import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import ProPlanView from "./_components/ProPlanView";
import NavigationHeader from "@/components/NavigationHeader";
import { ENTERPRISE_FEATURES, FEATURES } from "./_constants";
import { Star } from "lucide-react";
import FeatureCategory from "./_components/FeatureCategory";
import FeatureItem from "./_components/FeatureItem";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import UpgradeButton from "./_components/UpgradeButton";
import LoginButton from "@/components/LoginButton";

async function PricingPage() {
  let convexUser: { isPro?: boolean } | null = null;

  try {
    const user = await currentUser();
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "http://localhost:3210");
    convexUser = await convex.query(api.users.getUser, {
      userId: user?.id || "",
    });
  } catch {
    convexUser = null;
  }

  if (convexUser?.isPro) return <ProPlanView />;

  return (
    <div
      className="relative min-h-screen selection:bg-blue-500/20
     selection:text-blue-200"
    >
      <NavigationHeader />

      {/* main content */}

      <main className="relative pt-32 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero   */}
          <div className="text-center mb-24">
            <div className="relative inline-block">
              <div className="absolute -inset-px bg-gradient-to-r from-blue-500 to-purple-500 blur-xl opacity-10" />
              <h1
                className="relative text-5xl md:text-6xl lg:text-7xl font-semibold bg-gradient-to-r
               from-foreground to-foreground/70 text-transparent bg-clip-text mb-8"
              >
                Elevate Your <br />
                Development Experience
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join the next generation of developers with our professional suite of tools
            </p>
          </div>

          {/* Enterprise Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {ENTERPRISE_FEATURES.map((feature) => (
              <div
                key={feature.label}
                className="group relative glass-card rounded-2xl p-6 hover:transform hover:scale-[1.02] transition-all duration-300"
              >
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 
                  flex items-center justify-center mb-4 ring-1 ring-border group-hover:ring-primary/20"
                  >
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>

                  <h3 className="text-lg font-medium text-foreground mb-2">{feature.label}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Card */}

          <div className="relative max-w-4xl mx-auto">
            <div className="relative glass-panel rounded-2xl overflow-hidden transition-all duration-300">
              <div
                className="absolute inset-x-0 -top-px h-px bg-gradient-to-r 
              from-transparent via-primary/50 to-transparent"
              />
              <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />

              <div className="relative p-8 md:p-12">
               
                <div className="text-center mb-12">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 ring-1 ring-border mb-6">
                    <Star className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-3xl font-semibold text-foreground mb-4">3 months Pro Access</h2>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-2xl text-muted-foreground">₹</span>
                    <span className="text-6xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 text-transparent bg-clip-text">
                      249
                    </span>
                    <span className="text-xl text-muted-foreground">one-time</span>
                  </div>
                  <p className="text-muted-foreground text-lg">Unlock the full potential of CodeVyaas</p>
                </div>

               
                <div className="grid md:grid-cols-3 gap-12 mb-12">
                  <FeatureCategory label="Development">
                    {FEATURES.development.map((feature, idx) => (
                      <FeatureItem key={idx}>{feature}</FeatureItem>
                    ))}
                  </FeatureCategory>

                  <FeatureCategory label="Collaboration">
                    {FEATURES.collaboration.map((feature, idx) => (
                      <FeatureItem key={idx}>{feature}</FeatureItem>
                    ))}
                  </FeatureCategory>

                  <FeatureCategory label="Deployment">
                    {FEATURES.deployment.map((feature, idx) => (
                      <FeatureItem key={idx}>{feature}</FeatureItem>
                    ))}
                  </FeatureCategory>
                </div>

                
                <div className="flex justify-center">
                  <SignedIn>
                    <UpgradeButton />
                  </SignedIn>

                  <SignedOut>
                    <LoginButton />
                  </SignedOut>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
export default PricingPage;
