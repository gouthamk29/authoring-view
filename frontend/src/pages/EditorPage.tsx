import { useEffect } from "react";
import { useParams } from "react-router";

import MainEditor from "@/components/MainEditor";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import type { WorkSpace, TreeNode } from "@/types/workspace";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { WorkSpaceSidebar } from "@/components/EditorUI/EditorSideBar";
import { NavBar } from "@/components/EditorUI/EditorNavbar";
import { useNodeStore } from "@/store/nodeStore";

const EditorPage = () => {
  const { id: workspaceId } = useParams();

  const {
    workSpace: workspace,
    initWorkSpace,
    addNode,
    addLeafNode,
    activeLeafData,
    activeLeafNodeId: acticeLeafNodeId,
    deleteLeaf,
    handleDocumentChange,
    deleteNode,
    handleLeafClick,
    renameLeaf,
    renameNode,
  } = useNodeStore();

  const { user } = useAuthProfile();

  useEffect(() => {
    // check user exists
    if (!workspaceId || !user?._id) return;
    //initialise workspace
    try {
      initWorkSpace(workspaceId, user._id);
    } catch (error) {
      console.error(error);
    }
  }, [workspaceId, user?._id]);

  return (
    <div className="flex h-full min-h-dvh w-full flex-col">
      <div>
        <SidebarProvider>
          <WorkSpaceSidebar
            workspace={workspace}
            addNode={addNode}
            addLeaf={addLeafNode}
            onLeafClick={handleLeafClick}
            activeLeafId={acticeLeafNodeId}
            renameNode={renameNode}
            deleteNode={deleteNode}
            renameLeaf={renameLeaf}
            deleteLeaf={deleteLeaf}
          />
          <SidebarInset>
            <NavBar
              workSpace={workspace}
              user={user}
              onLeafClick={handleLeafClick}
              activeLeafId={acticeLeafNodeId}
            />
            {acticeLeafNodeId == "empty" && (
              <EmptyContentComponent addNote={addLeafNode} />
            )}
            {acticeLeafNodeId !== "empty" && (
              <MainEditor
                key={acticeLeafNodeId}
                document={activeLeafData}
                onChange={handleDocumentChange}
              />
            )}
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default EditorPage;

function EmptyContentComponent({
  addNote,
}: {
  addNote: (name: string, parentId: string) => void;
}) {
  return (
    <div className="mx-10 flex min-h-80 items-center justify-between rounded-xl bg-gray-400/80">
      <div className="flex w-full justify-center">
        <h2 className="text-4xl">
          Welcome,
          <span
            onClick={() => {
              addNote("new Note", null);
            }}
            className="cursor-pointer underline hover:font-semibold"
          >
            Add a New Note
          </span>
        </h2>
      </div>
    </div>
  );
}
