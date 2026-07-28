import { Id } from "../../../../../convex/_generated/dataModel";

export type TemplateItemType = "file" | "folder";

export interface TemplateFile {
  type: "file";
  filename: string;
  fileExtension: string;
  content: string;
}

export interface TemplateFolder {
  type: "folder";
  folderName: string;
  items: (TemplateFile | TemplateFolder)[];
}

export type FileSystemItem = TemplateFile | TemplateFolder;
export type TemplateItem = FileSystemItem;

export interface PlaygroundData {
  _id: Id<"playgrounds">;
  _creationTime: number;
  title: string;
  description?: string;
  template: string;
  userId: string;
  isMarked?: boolean;
  templateFiles?: { content: string }[];
}

export interface LoadingStepProps {
  currentStep: number;
  step: number;
  label: string;
}

export interface OpenFile extends TemplateFile {
  id: string;
  hasUnsavedChanges: boolean;
  originalContent: string;
}
