"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  CircleOff,
  Cloud,
  Github,
  Laptop,
  Moon,
  Settings,
  Sun,
  Palette,
} from "lucide-react";
import {
  useWebsiteTheme,
} from "@/components/providers/WebsiteThemeProvider";
import useMounted from "@/hooks/useMounted";
import {
  getSettingsMenuSections,
  SettingsItemType,
  SettingsScope,
} from "@/config/settings-menu";
import { themes } from "@/config/themes";
import { CODE_THEMES } from "@/app/(root)/_constants";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { redirect } from "next/navigation";

const EDITOR_THEME_ICONS: Record<string, React.ReactNode> = {
  "vs-dark": <Moon className="size-4" />,
  "vs-light": <Sun className="size-4" />,
  "github-dark": <Github className="size-4" />,
  monokai: <Laptop className="size-4" />,
  "solarized-dark": <Cloud className="size-4" />,
};

const COLOR_MODE_ICONS: Record<string, React.ReactNode> = {
  light: <Sun className="size-4" />,
  dark: <Moon className="size-4" />,
  system: <Laptop className="size-4" />,
};

const MODE_ICONS: Record<string, React.ReactNode> = {
  development: <Cloud className="size-4" />,
  dsa: <Laptop className="size-4" />,
};

interface SettingsMenuProps {
  scope: SettingsScope;
  triggerClassName?: string;
}

function ModeChanger({
  label,
  icon,
  isActive,
  onSelect,
}: {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      className={`
        relative group w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary transition-all duration-200
        ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"}
      `}
      onClick={onSelect}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div
        className={`
          flex items-center justify-center size-8 rounded-lg
          ${isActive ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"}
          group-hover:scale-110 transition-all duration-200
        `}
      >
        {icon}
      </div>

      <span className="flex-1 text-left group-hover:text-foreground transition-colors">
        {label}
      </span>

      <div className="relative size-4 rounded-full border border-border bg-primary/1 group-hover:border-muted-foreground transition-colors" />

      {isActive && (
        <motion.div
          className="absolute inset-0 border-2 border-primary/30 rounded-lg"
          layoutId="active-theme-border"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </motion.button>
  );
}
function ThemeOptionButton({
  label,
  color,
  icon,
  isActive,
  onSelect,
}: {
  label: string;
  color: string;
  icon: React.ReactNode;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      className={`
        relative group w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary transition-all duration-200
        ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"}
      `}
      onClick={onSelect}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div
        className={`
          flex items-center justify-center size-8 rounded-lg
          ${isActive ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"}
          group-hover:scale-110 transition-all duration-200
        `}
      >
        {icon}
      </div>

      <span className="flex-1 text-left group-hover:text-foreground transition-colors">
        {label}
      </span>

      <div
        className="relative size-4 rounded-full border border-border group-hover:border-muted-foreground transition-colors"
        style={{ background: color }}
      />

      {isActive && (
        <motion.div
          className="absolute inset-0 border-2 border-primary/30 rounded-lg"
          layoutId="active-theme-border"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </motion.button>
  );
}

function ThemeSubmenu({
  type,
  onSelect,
}: {
  type: SettingsItemType;
  onSelect?: () => void;
}) {
  const { websiteTheme, setWebsiteTheme, colorMode, setColorMode } =
    useWebsiteTheme();
  const { theme: editorTheme, setTheme: setEditorTheme } = useCodeEditorStore();
  const [selectedMode, setSelectedMode] = useState("development");

  if (type === "website-theme") {
    return (
      <>
        {Object.values(themes).map((theme) => (
          <ThemeOptionButton
            key={theme.id}
            label={theme.label}
            color={theme.color}
            icon={<Palette className="size-4" />}
            isActive={websiteTheme === theme.id}
            onSelect={() => {
              setWebsiteTheme(theme.id);
              onSelect?.();
            }}
          />
        ))}
      </>
    );
  }

  if (type === "color-mode") {
    return (
      <>
        {(["light", "dark", "system"] as const).map((mode) => (
          <ThemeOptionButton
            key={mode}
            label={mode.charAt(0).toUpperCase() + mode.slice(1)}
            color={
              mode === "light"
                ? "#ffffff"
                : mode === "dark"
                  ? "#000000"
                  : "#6b7280"
            }
            icon={COLOR_MODE_ICONS[mode]}
            isActive={colorMode === mode}
            onSelect={() => {
              setColorMode(mode);
              onSelect?.();
            }}
          />
        ))}
      </>
    );
  }

  if (type === "mode") {
    return (
      <>
        {["dsa", "development"].map((option) => (
          <ModeChanger
            label={option.charAt(0).toUpperCase() + option.slice(1)}
            icon={MODE_ICONS[option]}
            isActive={selectedMode === option}
            key={option}
            onSelect={() => {
              setSelectedMode(option);
              if (option === "development") {
                redirect("/development");
              } else if (option === "dsa") {
                redirect("/");
              }
            }}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {CODE_THEMES.map((theme) => (
        <ThemeOptionButton
          key={theme.id}
          label={theme.label}
          color={theme.color}
          icon={
            EDITOR_THEME_ICONS[theme.id] ?? <CircleOff className="size-4" />
          }
          isActive={editorTheme === theme.id}
          onSelect={() => {
            setEditorTheme(theme.id);
            onSelect?.();
          }}
        />
      ))}
    </>
  );
}

function SettingsMenu({ scope, triggerClassName }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<SettingsItemType | null>(
    null,
  );
  const [submenuSide, setSubmenuSide] = useState<"left" | "right">("right");
  const mounted = useMounted();
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sections = getSettingsMenuSections(scope);

  const handleMouseEnter = (type: SettingsItemType) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveSubmenu(type);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveSubmenu(null);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isOpen && activeSubmenu && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const availableRight = window.innerWidth - menuRect.right;
      // If less than 250px available on the right, open submenu to the left
      setSubmenuSide(availableRight < 250 ? "left" : "right");
    }
  }, [isOpen, activeSubmenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return null;

  const defaultTriggerClassName =
    "group relative flex items-center justify-center p-2.5 bg-secondary/80 hover:bg-secondary rounded-lg transition-all duration-200 border border-border hover:border-border";

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setIsOpen((open) => !open);
          setActiveSubmenu(null);
        }}
        className={triggerClassName ?? defaultTriggerClassName}
        aria-label="Settings"
        aria-expanded={isOpen}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        <Settings className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 min-w-[220px] bg-[color-mix(in_srgb,var(--popover)_80%,transparent)] backdrop-blur-md rounded-xl border border-border shadow-2xl py-2 z-50"
          >
            {sections.map((section) => (
              <div key={section.id}>
                <div className="px-4 pb-2 mb-2 border-b border-border">
                  <p className="text-xs font-medium text-muted-foreground">
                    {section.label}
                  </p>
                </div>

                {section.items.map((item) => (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(item.type)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      type="button"
                      className={`
                        relative group w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-all duration-200
                        ${
                          activeSubmenu === item.type
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }
                      `}
                      onClick={() =>
                        setActiveSubmenu((current) =>
                          current === item.type ? null : item.type,
                        )
                      }
                    >
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground" />
                    </button>

                    <AnimatePresence>
                      {activeSubmenu === item.type && (
                        <>
                          {/* Bridge to prevent closing when moving to submenu */}
                          <div
                            className={`absolute top-0 w-2 h-full z-40 ${
                              submenuSide === "right"
                                ? "left-full"
                                : "right-full"
                            }`}
                          />

                          <motion.div
                            initial={{
                              opacity: 0,
                              x: submenuSide === "right" ? 4 : -4,
                              scale: 0.98,
                            }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{
                              opacity: 0,
                              x: submenuSide === "right" ? 4 : -4,
                              scale: 0.98,
                            }}
                            transition={{ duration: 0.15 }}
                            className={`
                              absolute top-0 min-w-[240px] bg-[color-mix(in_srgb,var(--popover)_80%,transparent)] backdrop-blur-md rounded-xl border border-border shadow-2xl py-2 z-50
                              ${submenuSide === "right" ? "left-full ml-1" : "right-full mr-1"}
                            `}
                          >
                            <div className="px-3 pb-2 mb-2 border-b border-border">
                              <p className="text-xs font-medium text-muted-foreground">
                                {item.label}
                              </p>
                            </div>
                            <ThemeSubmenu type={item.type} />
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SettingsMenu;
