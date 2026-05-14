import { useRef } from "react";

import { useAuthProfile } from "@/hooks/useAuthProfile";
import { Navbar } from "@/components/dashboardUI/navbar";
import CreateWorkspaceDialog from "@/components/dashboardUI/dashBoardDialog";
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";
import { useWorkspaceSearch } from "@/hooks/useWorkspaceSearch";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscapekey } from "@/hooks/useEscapekey";
import { WorkspaceCard } from "@/components/dashboardUI/workspaceCard";

const Dashboard = () => {
  const searchRef = useRef(null);
  const { user, loading } = useAuthProfile();
  const { workspaces, createWorkspace, modifyWorkSpace } =
    useWorkspaceStore(user);
  const { search, setSearch, filteredWorkspaces } =
    useWorkspaceSearch(workspaces);

  useClickOutside(searchRef, () => {
    setSearch("");
  });
  useEscapekey(() => {
    setSearch("");
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full min-h-dvh flex-col">
      <Navbar searchValue={search} setSearchValue={setSearch} user={user} />

      <main className="mx-4">
        <div>
          <h1 className="text-4xl">My WorkSpace</h1>
        </div>
        <div className="my-2 flex min-h-20 min-w-20 rounded-md border">
          {workspaces.length < 1 && (
            <div className="flex w-full items-center justify-center">
              <CreateWorkspaceDialog createWorkspace={createWorkspace} />
            </div>
          )}

          {workspaces.length > 0 && (
            <div className="w-full">
              <div ref={searchRef} className="flex flex-wrap gap-2 p-4">
                {filteredWorkspaces.length === 0 && (
                  <div className="text-muted-foreground flex w-full items-center justify-center py-10 text-sm">
                    No workspace found
                  </div>
                )}
                {filteredWorkspaces.map((w) => (
                  <WorkspaceCard
                    key={w.id}
                    workspace={w}
                    modifyWorkSpace={modifyWorkSpace}
                  />
                ))}
              </div>
              <div className="mx-2 my-4 flex justify-end">
                <CreateWorkspaceDialog createWorkspace={createWorkspace} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
