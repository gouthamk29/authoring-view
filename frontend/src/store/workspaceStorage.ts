import { STORAGE_KEY } from "@/constant";
import type { WorkSpace, WorkspaceStore } from "@/types/workspace";

export const getWorkspaceFromStorage = (
  workspaceId: string,
  userId: string,
): WorkSpace | null => {
  try {
    const store: WorkspaceStore = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}",
    );

    const activeWorkspace = store[userId]?.workspaces?.find(
      (workspace: WorkSpace) => workspace.id === workspaceId,
    );

    return activeWorkspace || null;
  } catch (error) {
    console.error("Trouble retrieving workspace data:", error);
    return null;
  }
};

export function saveWorkspaceToStorage(
  userId: string,
  updatedWorkspace: WorkSpace,
) {
  try {
    const store: WorkspaceStore = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}",
    );

    const workspaces = store[userId]?.workspaces || [];

    store[userId] = {
      workspaces: workspaces.map((workspace: WorkSpace) =>
        workspace.id === updatedWorkspace.id ? updatedWorkspace : workspace,
      ),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error("Error saving workspace:", error);
  }
}
