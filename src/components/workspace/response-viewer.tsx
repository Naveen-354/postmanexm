"use client"

import { useRequestStore } from "@/lib/store/request-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Editor from "@monaco-editor/react"
import { Loader2 } from "lucide-react"

export function ResponseViewer() {
  const { response, isExecuting } = useRequestStore()

  if (isExecuting) {
    return (
      <div className="flex h-full w-full items-center justify-center flex-col gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <div>Executing Request...</div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
        Enter a URL and click Send to get a response
      </div>
    )
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-emerald-500"
    if (status >= 300 && status < 400) return "text-sky-500"
    if (status >= 400 && status < 500) return "text-amber-500"
    return "text-rose-500"
  }

  let formattedBody = response.body
  let language = "plaintext"

  try {
    if (response.headers && response.headers['content-type']?.includes('application/json')) {
      const parsed = JSON.parse(response.body)
      formattedBody = JSON.stringify(parsed, null, 2)
      language = "json"
    }
  } catch (e) {
    // Ignore JSON parse errors and stick to raw text
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const handleSaveExample = async () => {
    // Basic implementation: Could trigger a dialog for name/status code, etc.
    alert("Save as Example coming soon!")
  }

  return (
    <div className="flex h-full w-full flex-col bg-background border-t">
      <div className="flex items-center justify-between border-b px-4 py-2 shrink-0 bg-muted/10">
        <div className="flex items-center gap-4">
          <div className="font-semibold text-sm">Response</div>
          <button 
            onClick={handleSaveExample}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Save as Example
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Status:</span>
            <span className={`font-bold ${getStatusColor(response.status)}`}>
              {response.status} {response.error && `(${response.error})`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Time:</span>
            <span className="font-bold text-emerald-500">{response.time} ms</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Size:</span>
            <span className="font-bold text-emerald-500">{formatSize(response.size)}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="body" className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b px-2 shrink-0">
          <TabsList className="h-8 bg-transparent gap-2">
            <TabsTrigger value="body" className="data-[state=active]:bg-muted data-[state=active]:shadow-none h-6 text-xs">
              Body
            </TabsTrigger>
            <TabsTrigger value="headers" className="data-[state=active]:bg-muted data-[state=active]:shadow-none h-6 text-xs">
              Headers ({Object.keys(response.headers || {}).length})
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-auto bg-background">
          <TabsContent value="body" className="m-0 h-full">
            <Editor
              height="100%"
              defaultLanguage={language}
              language={language}
              value={formattedBody}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
                fontFamily: "JetBrains Mono, monospace",
                wordWrap: "on",
                padding: { top: 16 },
              }}
            />
          </TabsContent>
          <TabsContent value="headers" className="m-0 h-full p-4">
             <div className="grid grid-cols-[1fr_2fr] gap-x-4 gap-y-2 text-sm font-mono">
               {Object.entries(response.headers || {}).map(([key, value]) => (
                 <div key={key} className="contents border-b last:border-b-0">
                   <div className="py-1 font-semibold text-muted-foreground truncate">{key}</div>
                   <div className="py-1 break-all">{value}</div>
                 </div>
               ))}
               {Object.keys(response.headers || {}).length === 0 && (
                 <div className="text-muted-foreground text-sm col-span-2">No headers</div>
               )}
             </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
