import { Terminal } from "lucide-react";

export function EditorPanelSkeleton() {
  return (
    <div className="relative">
      <div className="relative bg-card rounded-xl border border-white/[0.04] p-6 h-[600px]">
        {/* Editor Area Skeleton */}
        <div className="relative rounded-xl overflow-hidden ring-1 ring-white/[0.05]">
          <div className="h-[600px] bg-muted p-4">
            {/* Code line skeletons */}
            {[...Array(15)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-4 bg-muted rounded`} />
                <div
                  className={`h-4 bg-muted rounded`}
                  style={{ width: `${Math.random() * 60 + 20}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-3 flex justify-end">
          <div className={`w-40 h-6 bg-muted rounded-lg`} />
        </div>
      </div>
    </div>
  );
}

export function OutputPanelSkeleton() {
  return (
    <div className="relative bg-card rounded-xl p-4 ring-1 ring-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-secondary ring-1 ring-border">
            <Terminal className="w-4 h-4 text-primary" />
          </div>
          <div className={`w-16 h-4 bg-muted rounded`} />
        </div>
      </div>

      {/* Output Area Skeleton */}
      <div className="relative">
        <div className="absolute inset-0 bg-background rounded-xl -z-10" />
        <div className="relative bg-card border border-[#313244] rounded-xl p-4 h-[600px]">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className={`w-12 h-12 mx-auto mb-4 bg-muted rounded-xl`} />
              <div className={`w-48 h-4 mx-auto bg-muted rounded`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading state for the entire editor view
export function EditorViewSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <EditorPanelSkeleton />
      <OutputPanelSkeleton />
    </div>
  );
}
