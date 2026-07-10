"use client";

import { ChevronDown, ChevronRight, FileCode, Folder, MoreHorizontal } from "lucide-react";
import { useState } from "react";

const FILES = [
  { id: "1", name: "src", type: "folder", isOpen: true, children: [
    { id: "2", name: "app", type: "folder", isOpen: true, children: [
      { id: "3", name: "page.tsx", type: "file" },
      { id: "4", name: "globals.css", type: "file" },
    ]},
    { id: "5", name: "components", type: "folder", children: [] },
  ]},
  { id: "6", name: "package.json", type: "file" },
  { id: "7", name: "tsconfig.json", type: "file" },
];

export default function FileExplorer() {
  return (
    <div className="w-64 flex flex-col glass-panel border-y-0 border-l-0 rounded-none h-full transition-all duration-300 overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Explorer</span>
        <MoreHorizontal className="size-4 text-muted-foreground hover:text-foreground cursor-pointer" />
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        <div className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-muted-foreground uppercase">
          <ChevronDown className="size-3" />
          <span>CodeVyaas</span>
        </div>
        
        <div className="mt-1">
          {FILES.map((file) => (
            <FileItem key={file.id} item={file} depth={0} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FileItem({ item, depth }: { item: any, depth: number }) {
  const [isOpen, setIsOpen] = useState(item.isOpen);

  return (
    <div>
      <div 
        className="flex items-center gap-2 px-2 py-1 hover:bg-primary/10 rounded cursor-pointer text-sm text-muted-foreground hover:text-foreground group transition-colors"
        style={{ paddingLeft: `${(depth + 1) * 12}px` }}
        onClick={() => item.type === "folder" && setIsOpen(!isOpen)}
      >
        {item.type === "folder" ? (
          <>
            {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            <Folder className="size-4 text-blue-400/70" />
          </>
        ) : (
          <>
            <div className="size-4" />
            <FileCode className="size-4 text-purple-400/70" />
          </>
        )}
        <span className="flex-1 truncate">{item.name}</span>
      </div>
      
      {item.type === "folder" && isOpen && item.children && (
        <div>
          {item.children.map((child: any) => (
            <FileItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
