import { CodeIcon, SendIcon } from "lucide-react";
import { useState } from "react";
import CommentContent from "./CommentContent";

interface CommentFormProps {
  onSubmit: (comment: string) => Promise<void>;
  isSubmitting: boolean;
}

function CommentForm({ isSubmitting, onSubmit }: CommentFormProps) {
  const [comment, setComment] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newComment = comment.substring(0, start) + "  " + comment.substring(end);
      setComment(newComment);
      e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) return;

    await onSubmit(comment);

    setComment("");
    setIsPreview(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="glass-panel rounded-xl border border-border overflow-hidden">
        {/* Comment form header */}
        <div className="flex justify-end gap-2 px-4 pt-2">
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`text-sm px-3 py-1 rounded-md transition-colors ${
              isPreview ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-muted-foreground"
            }`}
          >
            {isPreview ? "Edit" : "Preview"}
          </button>
        </div>

        {/* Comment form body */}
        {isPreview ? (
          <div className="min-h-[120px] p-4 text-foreground">
            <CommentContent content={comment} />
          </div>
        ) : (
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add to the discussion..."
            className="w-full bg-transparent border-0 text-foreground placeholder:text-muted-foreground/50 outline-none 
            resize-none min-h-[120px] p-4 font-mono text-sm"
          />
        )}

        {/* Comment Form Footer */}
        <div className="flex items-center justify-between gap-4 px-4 py-3 glass-header border-t border-border">
          <div className="hidden sm:block text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <CodeIcon className="w-3.5 h-3.5" />
              <span>Format code with ```language</span>
            </div>
            <div className="text-muted-foreground/60 pl-5">
              Tab key inserts spaces • Preview your comment before posting
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !comment.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all ml-auto"
          >
            {isSubmitting ? (
              <>
                <div
                  className="w-4 h-4 border-2 border-primary-foreground/30 
                border-t-primary-foreground rounded-full animate-spin"
                />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <SendIcon className="w-4 h-4" />
                <span>Comment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
export default CommentForm;
