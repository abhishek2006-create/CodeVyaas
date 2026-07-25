import { Id } from "../../../../../convex/_generated/dataModel";

export interface Project {
  _id: Id<"playgrounds">;
  _creationTime: number;

  title: string;
  description?: string;
  template: string;
  userId: string;

  isMarked: boolean;
}
