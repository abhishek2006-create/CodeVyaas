import { Braces, Layers3 } from "lucide-react";

const modes = [
  { id: "dsa", label: "DSA Editor", href: "/workspace", Icon: Braces },
  { id: "development", label: "Development", href: "/development", Icon: Layers3 },
] as const;

export default function WorkspaceModes({ active }: { active: (typeof modes)[number]["id"] }) {
  return (
    <nav aria-label="Workspace modes" className="flex w-fit max-w-full flex-wrap gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
      {modes.map(({ id, label, href, Icon }) => (
        <a
          key={id}
          href={href}
          aria-current={active === id ? "page" : undefined}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground"
        >
          <Icon size={16} aria-hidden="true" /> {label}
        </a>
      ))}
    </nav>
  );
}
