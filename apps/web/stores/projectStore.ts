import { create } from "zustand";

export interface ProjectSummary {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ViewportData {
  scale: number;
  translate: { x: number; y: number };
}

export interface ProjectDetail extends ProjectSummary {
  viewportData: ViewportData | null;
}

interface ProjectState {
  // Project list
  projects: ProjectSummary[];
  total: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  isCreating: boolean;
  createError: string | null;

  // Active project (canvas editing session)
  activeProjectId: string | null;
  activeProject: ProjectDetail | null;
  isLoadingProject: boolean;
  projectError: string | null;

  // List actions
  /** Sets loading state before fetching the project list. */
  fetchProjectsStart: () => void;
  /** Stores fetched projects and clears loading state. */
  fetchProjectsSuccess: (projects: ProjectSummary[], total: number) => void;
  /** Stores the error message when fetching projects fails. */
  fetchProjectsFailure: (error: string) => void;
  /** Sets creating state before the create project API call. */
  createProjectStart: () => void;
  /** Clears creating state after a successful project creation. */
  createProjectSuccess: () => void;
  /** Stores the error message when project creation fails. */
  createProjectFailure: (error: string) => void;
  /** Prepends a newly created project to the top of the list. */
  addProject: (project: ProjectSummary) => void;
  /** Replaces a project in the list with updated data (e.g. after a rename). */
  updateProject: (updated: ProjectSummary) => void;
  /** Removes a project from the list by id. */
  deleteProject: (id: string) => void;
  /** Resets the project list back to its empty initial state. */
  clearProjects: () => void;
  /** Clears both list and create error messages. */
  clearErrors: () => void;

  // Active project actions
  /** Marks a project as loading before fetching its full detail (viewport data etc). */
  loadActiveProjectStart: (id: string) => void;
  /** Stores the loaded project detail and marks it as the active project. */
  loadActiveProjectSuccess: (project: ProjectDetail) => void;
  /** Stores the error message when loading the active project fails. */
  loadActiveProjectFailure: (error: string) => void;
  /** Updates the viewport data on the active project after an autosave flush. */
  updateActiveProjectViewport: (viewportData: ViewportData) => void;
  /** Clears the active project when the user navigates away from the canvas. */
  clearActiveProject: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  // List initial state
  projects: [],
  total: 0,
  isLoading: false,
  error: null,
  lastFetched: null,
  isCreating: false,
  createError: null,

  // Active project initial state
  activeProjectId: null,
  activeProject: null,
  isLoadingProject: false,
  projectError: null,

  // List actions
  fetchProjectsStart: () => set({ isLoading: true, error: null }),

  fetchProjectsSuccess: (projects, total) =>
    set({
      isLoading: false,
      projects,
      total,
      error: null,
      lastFetched: Date.now(),
    }),

  fetchProjectsFailure: (error) => set({ isLoading: false, error }),

  createProjectStart: () => set({ isCreating: true, createError: null }),

  createProjectSuccess: () => set({ isCreating: false, createError: null }),

  createProjectFailure: (error) =>
    set({ isCreating: false, createError: error }),

  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),

  updateProject: (updated) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
    })),

  deleteProject: (id) =>
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),

  clearProjects: () =>
    set({
      projects: [],
      total: 0,
      lastFetched: null,
      error: null,
      createError: null,
    }),

  clearErrors: () => set({ error: null, createError: null }),

  // Active project actions
  loadActiveProjectStart: (id) =>
    set({ isLoadingProject: true, projectError: null, activeProjectId: id }),

  loadActiveProjectSuccess: (project) =>
    set({
      isLoadingProject: false,
      activeProject: project,
      activeProjectId: project.id,
    }),

  loadActiveProjectFailure: (error) =>
    set({ isLoadingProject: false, projectError: error }),

  updateActiveProjectViewport: (viewportData) =>
    set((s) =>
      s.activeProject
        ? { activeProject: { ...s.activeProject, viewportData } }
        : s,
    ),

  clearActiveProject: () =>
    set({
      activeProjectId: null,
      activeProject: null,
      isLoadingProject: false,
      projectError: null,
    }),
}));
