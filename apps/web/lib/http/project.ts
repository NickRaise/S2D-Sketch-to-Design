import { toast } from "sonner";
import api from "../axios";
import { ApiResponse } from "@/types/auth";

interface ProjectCreationPayload {
  name: string;
  description?: string;
  thumbnail?: string;
}

interface ProjectResponse {
  name: string;
  description: string | null;
  thumbnail: string | null;
  id: string;
  viewportData: object;
  isPublic: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const createProject = async (
  data: ProjectCreationPayload,
): Promise<ProjectResponse | null> => {
  try {
    const project = await api.post<ApiResponse<ProjectResponse>>(
      "/project",
      data,
    );

    if (!project.data.success) {
      toast.error(
        project.data.message || "Failed to create project. Please try again.",
      );
      return null;
    }

    return project.data;
  } catch (err) {
    toast.error("Failed to create project. Please try again.");
    console.log("Error creating project:", err);
    return null;
  }
};
