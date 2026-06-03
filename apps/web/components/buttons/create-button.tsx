import React from "react";
import { Button } from "../ui/button";
import { useProject } from "@/hooks/useProject";
import { Loader2, PlusIcon } from "lucide-react";

const CreateButton = () => {
  const { canCreate, createProject, isCreating } = useProject();

  return (
    <Button
      variant="default"
      disabled={!canCreate || isCreating}
      onClick={createProject}
      className="flex items-center gap-2 w-38"
    >
      {isCreating ? (
        <Loader2 className="animate-spin h-4 w-4" />
      ) : (
        <PlusIcon className="h-4 w-4" />
      )}
      <span className="pr-1">
        {isCreating ? "Creating..." : "Create Project"}
      </span>
    </Button>
  );
};

export default CreateButton;
