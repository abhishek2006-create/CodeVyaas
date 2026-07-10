export type ThemeVariables = {
  "--background": string;
  "--foreground": string;
  "--card": string;
  "--card-foreground": string;
  "--popover": string;
  "--popover-foreground": string;
  "--primary": string;
  "--primary-foreground": string;
  "--secondary": string;
  "--secondary-foreground": string;
  "--muted": string;
  "--muted-foreground": string;
  "--accent": string;
  "--accent-foreground": string;
  "--destructive": string;
  "--destructive-foreground": string;
  "--border": string;
  "--input": string;
  "--ring": string;
  "--glass-background": string;
  "--glass-border": string;

  // Editor specific variables
  "--editor-background": string;
  "--editor-foreground": string;
  "--editor-line-number": string;
  "--editor-line-number-active": string;
  "--editor-line-highlight": string;
  "--editor-selection": string;
  "--editor-comment": string;
  "--editor-keyword": string;
  "--editor-string": string;
  "--editor-number": string;
  "--editor-function": string;
  "--editor-variable": string;
  "--editor-operator": string;
  "--editor-type": string;
  "--editor-class": string;
  "--editor-border": string;

  [key: string]: string;
};

export interface ThemeDefinition {
  id: string;
  label: string;
  color: string; // Preview color for the UI
  light: ThemeVariables;
  dark: ThemeVariables;
}
