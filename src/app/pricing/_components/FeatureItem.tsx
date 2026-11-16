import { Check } from "lucide-react";

const FeatureItem = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-3 group">
    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-accent flex items-center justify-center border border-primary group-hover:border-primary group-hover:bg-accent transition-colors">
      <Check className="w-3 h-3 text-primary" />
    </div>
    <span className="text-gray-400 group-hover:text-gray-300 transition-colors">{children}</span>
  </div>
);

export default FeatureItem;
