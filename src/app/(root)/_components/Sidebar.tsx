"use client";

import { 
  Files, 
  Search, 
  GitBranch, 
  Play, 
  Blocks, 
  UserCircle 
} from "lucide-react";
import { SetStateAction, useState} from "react";

const ICONS = [
  {id: "explorer", icon: Files},
  {id: "search", icon: Search},
  {id: "git", icon: GitBranch},
  {id: "run", icon: Play},
  {id: "extensions", icon: Blocks},
];

export default function Sidebar() {
  const [active, setActive] = useState("explorer");

  const handleActive = (items_id: SetStateAction<string>) => {
    if (active === items_id) {
      setActive("");
    } else {
      setActive(items_id);
    }
  };
  return (
    <div className="w-12 flex flex-col items-center py-4 gap-4 glass-panel border-y-0 border-l-0 rounded-none h-full transition-all duration-300">
      {ICONS.map((item) => (
        <button
          key={item.id}
          onClick={()=> handleActive(item.id)}
          style={{
            backgroundColor: active === item.id ? "color-mix(in oklab, var(--primary) 15%, transparent)" : "transparent",
          }}
          className={`p-2 rounded-lg transition-colors relative ${
            active === item.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <item.icon className="size-5" />
          {active === item.id && (
            <div className={`${active !== "" ? "block" : "hidden" } absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary`} />
          )}
        </button>
      ))}
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <UserCircle className="size-5" />
        </button>

    </div>
  );
}
