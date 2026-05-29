import { useEffect } from "react";
import { useParams } from "react-router";

import MainEditor from "@/components/MainEditor";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import { useAuthProfile } from "@/hooks/useAuthProfile";
import { WorkSpaceSidebar } from "@/components/EditorUI/EditorSideBar";
import { NavBar } from "@/components/EditorUI/EditorNavbar";
import { useNodeStore } from "@/store/nodeStore";
import { useEditorStore } from "@/store/editorStore";

const EditorPage = () => {
  const { id: workspaceId } = useParams();
  const { user } = useAuthProfile();

  const initWorkSpace = useNodeStore((state) => state.initWorkSpace);
  const activeLeafNodeId = useNodeStore((state) => state.activeLeafNodeId);
  const addLeafNode = useNodeStore((state) => state.addLeafNode);

  const activeDocument = useEditorStore((state) => state.activeDocument);
  const loadDocument = useEditorStore((state) => state.loadDocument);
  const clearDocument = useEditorStore((state) => state.clearDocument);
  const handleDocumentChange = useEditorStore(
    (state) => state.handleDocumentChange,
  );

  useEffect(() => {
    if (!workspaceId || !user?._id) return;

    initWorkSpace(workspaceId, user._id);
  }, [workspaceId, user?._id, initWorkSpace]);

  useEffect(() => {
    if (!workspaceId || !user?._id || !activeLeafNodeId) return;

    if (activeLeafNodeId === "empty") {
      clearDocument();
      return;
    }

    loadDocument(user._id, workspaceId, activeLeafNodeId);
  }, [workspaceId, user?._id, activeLeafNodeId, loadDocument, clearDocument]);

  if (!workspaceId || !user?._id) {
    return null;
  }

  return (
    <div className="flex h-full min-h-dvh w-full flex-col">
      <SidebarProvider>
        <WorkSpaceSidebar />

        <SidebarInset>
          <NavBar />

          {activeLeafNodeId === "empty" && (
            <EmptyContentComponent addNote={addLeafNode} />
          )}

          {activeLeafNodeId !== "empty" && (
            <MainEditor
              key={activeLeafNodeId}
              document={activeDocument}
              onChange={(newDocument) => {
                handleDocumentChange(
                  newDocument,
                  user._id,
                  activeLeafNodeId,
                  workspaceId,
                );
              }}
            />
          )}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default EditorPage;

function EmptyContentComponent({
  addNote,
}: {
  addNote: (name: string, parentId: string | null) => void;
}) {
  return (
    <div className="mx-10 flex min-h-80 items-center justify-between rounded-xl bg-gray-400/80">
      <div className="flex w-full justify-center">
        <h2 className="text-4xl">
          Welcome,{" "}
          <span
            onClick={() => {
              addNote("New Note", null);
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
