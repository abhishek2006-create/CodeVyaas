import { Zap } from "lucide-react";
import Link from "next/link";

export default function UpgradeButton() {
  const CHEKOUT_URL =
    "https://codevyaas.lemonsqueezy.com/checkout/buy/7c724d09-793e-4b06-9cac-a8b827720687";

  return (
    <Link
      href={CHEKOUT_URL}
      className="inline-flex items-center justify-center gap-2 px-8 py-4 text-primary-foreground 
        bg-gradient-to-r from-primary to-primary/80 rounded-lg 
        hover:from-primary/90 hover:to-primary transition-all font-medium shadow-lg shadow-primary/20"
    >
      <Zap className="w-5 h-5" />
      Upgrade to Pro
    </Link>
  );
}
