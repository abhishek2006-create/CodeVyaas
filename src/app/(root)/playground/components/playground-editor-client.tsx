"use client";

import React, { useState } from "react";
import { PlaygroundEditor } from "./playground-editor";
import type { TemplateFile } from "./types";

interface PlaygroundEditorClientProps {
  templateData: TemplateFile;
}

const PlaygroundEditorClient: React.FC<PlaygroundEditorClientProps> = ({
  templateData,
}) => {
  const [content, setContent] = useState(templateData.content);

  return (
    <div className="h-screen">
      <PlaygroundEditor
        activeFile={templateData}
        content={content}
        onContentChange={setContent}
      />
    </div>
  );
};

export default PlaygroundEditorClient;
