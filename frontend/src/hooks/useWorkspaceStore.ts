import type { User, WorkSpace, WorkspaceStore } from "@/types/workspace";

import { useEffect, useState } from "react";

export function useWorkspaceStore(user: User | null) {
  const [workspaces, setWorkspaces] = useState<WorkSpace[]>([]);

  useEffect(() => {
    if (!user?._id) return;

    const store: WorkspaceStore = JSON.parse(
      localStorage.getItem("workspaces") || "{}",
    );

    const userWorkspaces = store[user._id]?.workspaces || [];

    setWorkspaces(userWorkspaces);
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;

    const store: WorkspaceStore = JSON.parse(
      localStorage.getItem("workspaces") || "{}",
    );

    store[user._id] = {
      workspaces,
    };

    localStorage.setItem("workspaces", JSON.stringify(store));
  }, [workspaces, user]);

  function createWorkspace(name: string, description: string) {
    const newWorkspace: WorkSpace = {
      name,
      description,
      id: crypto.randomUUID(),
      leafNodes: [],
      nodes: [],
      created_at: Date.now(),
    };

    setWorkspaces((prev) => [...prev, newWorkspace]);
  }

  function modifyWorkSpace(
    workspaceId: string,
    newName: string,
    newDescription: string,
  ) {
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === workspaceId
          ? {
              ...w,
              name: newName,
              description: newDescription,
            }
          : w,
      ),
    );
  }

  return {
    workspaces,
    createWorkspace,
    modifyWorkSpace,
  };
}
