"use client";

import TemplateSelectionModal from "@/components/modals/template-selecter-model";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";

const AddNewButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const createPlayground = useMutation(api.playground.action.createPlayground);

  const handleSubmit = async (data: {
    title: string;
    template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
    description?: string;
  }) => {
    try {
      const playgroundId = await createPlayground({
        title: data.title,
        template: data.template,
        description: data.description,
      });

      toast.success("Playground created successfully");

      console.log("Creating new playground:", data);

      setIsModalOpen(false);

      window.location.assign(`/playground/${playgroundId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create playground");
    }
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group relative flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary hover:bg-secondary"
      >
        <div className="flex flex-row justify-center items-start gap-4">
          <Button
            variant={"outline"}
            aria-label="New project"
            className="flex items-center justify-center border-border bg-accent text-accent-foreground group-hover:bg-accent"
            size={"icon"}
          >
            <Plus
              size={30}
              className="transition-transform duration-300 group-hover:rotate-90 hover:fill-accent"
            />
          </Button>
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-foreground">New project</h2>
            <p className="max-w-[220px] text-sm text-muted-foreground">
              Create a new playground
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <Image
            src="/add-new.svg"
            alt="Add New Image"
            width={150}
            height={150}
            className="transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </div>

      <TemplateSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default AddNewButton;
