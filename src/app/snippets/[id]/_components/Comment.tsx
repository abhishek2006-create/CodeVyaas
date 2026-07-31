import { Trash2Icon, UserIcon } from "lucide-react";
import { Id } from "../../../../../convex/_generated/dataModel";
import CommentContent from "./CommentContent";

interface CommentProps {
  comment: {
    _id: Id<"snippetComments">;
    _creationTime: number;
    userId: string;
    userName: string;
    snippetId: Id<"snippets">;
    content: string;
  };
  onDelete: (commentId: Id<"snippetComments">) => void;
  isDeleting: boolean;
  currentUserId?: string;
}

function Comment({
  comment,
  currentUserId,
  isDeleting,
  onDelete,
}: CommentProps) {
  return (
    <div className="group">
      <div className="bg-card/40 rounded-xl p-5 sm:p-6 border border-border/60 hover:border-border transition-all duration-200 shadow-sm">
        <div className="flex items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <span className="block text-foreground font-medium text-sm sm:text-base truncate">
                {comment.userName}
              </span>
              <span className="block text-xs sm:text-sm text-muted-foreground">
                {new Date(comment._creationTime).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {comment.userId === currentUserId && (
            <button
              onClick={() => onDelete(comment._id)}
              disabled={isDeleting}
              className="opacity-0 group-hover:opacity-100 p-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all focus:opacity-100"
              title="Delete comment"
            >
              <Trash2Icon className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="text-foreground/90">
          <CommentContent content={comment.content} />
        </div>
      </div>
    </div>
  );
}

export default Comment;
