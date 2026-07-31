"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import toast from "react-hot-toast";
import { MessageSquare } from "lucide-react";
import Comment from "./Comment";
import CommentForm from "./CommentForm";

function Comments({ snippetId }: { snippetId: Id<"snippets"> }) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null,
  );

  const comments = useQuery(api.snippets.getComments, { snippetId }) || [];
  const addComment = useMutation(api.snippets.addComment);
  const deleteComment = useMutation(api.snippets.deleteComment);

  const handleSubmitComment = async (content: string) => {
    setIsSubmitting(true);

    try {
      await addComment({ snippetId, content });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: Id<"snippetComments">) => {
    setDeletingCommentId(commentId);

    try {
      await deleteComment({ commentId });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Something went wrong");
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <div className="glass-panel border border-border rounded-2xl overflow-hidden bg-card/50 text-card-foreground transition-colors duration-200">
      <div className="px-6 sm:px-8 py-6 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Discussion ({comments.length})
        </h2>
      </div>

      <div className="p-6 sm:p-8">
        {user ? (
          <CommentForm
            onSubmit={handleSubmitComment}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div className="bg-muted/30 rounded-xl p-6 text-center mb-8 border border-border">
            <p className="text-muted-foreground mb-4">
              Sign in to join the discussion
            </p>
            <SignInButton mode="modal">
              <button className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
                Sign In
              </button>
            </SignInButton>
          </div>
        )}

        <div className="space-y-6">
          {comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              onDelete={handleDeleteComment}
              isDeleting={deletingCommentId === comment._id}
              currentUserId={user?.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Comments;
