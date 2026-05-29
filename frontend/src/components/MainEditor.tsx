import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useEffect, useRef } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useTheme } from "./theme-provider";

interface MainEditorProps {
  document: any;
  onChange: (data: any) => void;
}

export default function MainEditor({ document, onChange }: MainEditorProps) {
  const editor = useCreateBlockNote();

  const { theme } = useTheme();
  const normaliseTheme = theme === "system" ? "dark" : theme;

  const hasLoadedDocument = useRef(false);

  useEffect(() => {
    if (hasLoadedDocument.current) return;

    if (Array.isArray(document) && document.length > 0) {
      editor.replaceBlocks(editor.document, document);
    }

    hasLoadedDocument.current = true;
  }, [document, editor]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const unsubscribe = editor.onChange(() => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        onChange(editor.document);
      }, 500);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [editor, onChange]);

  return (
    <div className="mx-8 rounded-xl border p-4">
      <div className="w-full overflow-visible px-4">
        <BlockNoteView editor={editor} theme={normaliseTheme} />
      </div>
    </div>
  );
}
