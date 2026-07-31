"use client";

import { Button } from "@/components/ui/button";
import { api } from "../../../../../convex/_generated/api";
import { useMutation } from "convex/react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { StarIcon, StarOffIcon } from "lucide-react";
import React, { forwardRef, useEffect, useState } from "react";
import { toast } from "sonner";

interface MarkedToggleButtonProps extends React.ComponentPropsWithoutRef<
  typeof Button
> {
  markedForRevision: boolean;
  id: Id<"playgrounds">;
}

export const MarkedToggleButton = forwardRef<
  HTMLButtonElement,
  MarkedToggleButtonProps
>(({ markedForRevision, id, onClick, className, children, ...props }, ref) => {
  const [isMarked, setIsMarked] = useState(markedForRevision);

  const toggleStar = useMutation(api.playground.action.toggleStar);

  useEffect(() => {
    setIsMarked(markedForRevision);
  }, [markedForRevision]);

  const handleToggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
  
    onClick?.(event);

    const previousState = isMarked;
    const newState = !previousState;

    // Optimistic update
    setIsMarked(newState);

    try {
      const res = await toggleStar({
        playgroundId: id,
        isMarked: newState,
      });

      if (res.success) {
        toast.success(
          res.isMarked
            ? "Added to Favorites successfully"
            : "Removed from Favorites successfully",
        );
      }
    } catch (err) {
      console.error(err);

      // Rollback
      setIsMarked(previousState);

      toast.error("Failed to update favorite.");
    }
  };

  return (
    <Button
      ref={ref}
      variant="ghost"
      className={`flex items-center justify-start w-full px-2 py-1.5 text-sm rounded-md cursor-pointer ${className}`}
      onClick={handleToggle}
      {...props}
    >
      {isMarked ? (
        <StarIcon size={16} className="text-yellow-500 mr-2 fill-current" />
      ) : (
        <StarOffIcon size={16} className="text-gray-500 mr-2" />
      )}

      {children ?? (isMarked ? "Remove Favorite" : "Add Favorite")}
    </Button>
  );
});

MarkedToggleButton.displayName = "MarkedToggleButton";
