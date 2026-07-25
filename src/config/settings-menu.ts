export type SettingsScope = "navbar" | "editor";

export type SettingsItemType = "website-theme" | "color-mode" | "editor-theme" | "mode";

export interface SettingsMenuItem {
  id: string;
  label: string;
  type: SettingsItemType;
}

export interface SettingsMenuSection {
  id: string;
  label: string;
  items: SettingsMenuItem[];
}

const WEBSITE_APPEARANCE_SECTION_BASE: SettingsMenuSection = {
  id: "website-appearance",
  label: "Settings Menu",
  items: [
    {
      id: "website-theme",
      label: "Website Theme",
      type: "website-theme",
    },
    {
      id: "color-mode",
      label: "Color Mode",
      type: "color-mode",
    },
    {
      id:"mode",
      label: "Mode",
      type:"mode",
    }
  ],
};

const EDITOR_APPEARANCE_ITEM: SettingsMenuItem = {
  id: "editor-theme",
  label: "Editor Theme",
  type: "editor-theme",
};

export function getSettingsMenuSections(scope: SettingsScope): SettingsMenuSection[] {
  if (scope === "navbar") {
    return [WEBSITE_APPEARANCE_SECTION_BASE];
  }

  return [
    {
      ...WEBSITE_APPEARANCE_SECTION_BASE,
      items: [...WEBSITE_APPEARANCE_SECTION_BASE.items, EDITOR_APPEARANCE_ITEM],
    },
  ];
}
