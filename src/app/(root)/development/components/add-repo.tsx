import { Button } from "@/components/ui/button";
import { ArrowDown, Github } from "lucide-react";

const AddRepo = () => {
  return (
    <div
      className="group relative flex cursor-pointer items-center justify-between rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary hover:bg-secondary"
    >
      <div className="flex flex-row justify-center items-start gap-4">
        <Button
          variant={"outline"}
          className="flex items-center justify-center border-border bg-accent text-accent-foreground group-hover:bg-accent"
          size={"icon"}
        >
          <ArrowDown
            size={30}
            className="transition-transform duration-300 group-hover:translate-y-1"
          />
        </Button>
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-foreground">
            GitHub repository
          </h2>
          <p className="max-w-[220px] text-sm text-muted-foreground">
            Work with your repositories in our editor
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <Github
          width={75}
          height={75}
          className="transition-transform duration-300 group-hover:scale-110"
        />
      </div>
    </div>
  );
};

export default AddRepo;
