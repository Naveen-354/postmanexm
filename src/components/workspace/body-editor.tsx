"use client"

import { useRequestStore } from "@/lib/store/request-store"
import Editor from "@monaco-editor/react"

export function BodyEditor() {
  const { body, setBody, bodyType } = useRequestStore()

  if (bodyType === "none") {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        This request does not have a body
      </div>
    )
  }

  // Right now, only supporting raw/JSON well in Monaco. We can add UI for form-data later.
  const language = bodyType === "json" ? "json" : "plaintext"

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={body}
        onChange={(val) => setBody(val || "")}
        theme="vs-dark" // TODO: sync with next-themes later
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          fontFamily: "JetBrains Mono, monospace",
          wordWrap: "on",
          padding: { top: 16 },
        }}
      />
    </div>
  )
}
