"use client"

import { useEffect } from "react"
import { useRequestStore } from "@/lib/store/request-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KeyValueTable } from "./key-value-table"
import { BodyEditor } from "./body-editor"
import { Save, Send } from "lucide-react"

import { saveRequest } from "@/app/workspace/[workspaceId]/actions"
import { toast } from "sonner" // Will use standard alert for now if sonner isn't installed
import { ResponseViewer } from "./response-viewer"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export function RequestEditor({ 
  initialRequest,
  workspaceId
}: { 
  initialRequest: any
  workspaceId: string
}) {
  const store = useRequestStore()

  // Initialize store with request data on mount or when initialRequest changes
  useEffect(() => {
    store.setRequest({
      id: initialRequest.id,
      workspaceId,
      method: initialRequest.method,
      url: initialRequest.url || "",
      headers: initialRequest.headers || [],
      queryParams: initialRequest.query_params || [],
      body: initialRequest.body || "",
      bodyType: initialRequest.body_type || "none",
      authorization: initialRequest.authorization || {},
    })
  }, [initialRequest.id]) // deliberately only trigger on ID change

  const handleSave = async () => {
    const { id, method, url, headers, queryParams, body, bodyType, authorization } = store
    const updates = {
      method,
      url,
      headers: headers.filter(h => h.key),
      query_params: queryParams.filter(p => p.key),
      body,
      body_type: bodyType,
      authorization
    }
    const res = await saveRequest(id, updates)
    if (res.error) {
      alert("Error saving request")
    } else {
      // Show success indicator (optional)
      console.log("Saved!")
    }
  }

  // Don't render until hydrated
  if (store.id !== initialRequest.id) return null

  return (
    <div className="flex h-full w-full flex-col">
      {/* URL Bar Area */}
      <div className="flex items-center gap-2 border-b p-3 shrink-0 bg-muted/10">
        <select 
          className="flex h-10 w-24 rounded-md border border-input bg-background px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ring"
          value={store.method}
          onChange={(e) => store.setMethod(e.target.value)}
        >
          <option value="GET" className="text-emerald-500">GET</option>
          <option value="POST" className="text-amber-500">POST</option>
          <option value="PUT" className="text-sky-500">PUT</option>
          <option value="PATCH" className="text-violet-500">PATCH</option>
          <option value="DELETE" className="text-rose-500">DELETE</option>
        </select>
        
        <div className="flex-1 relative">
          <input 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="https://api.example.com/v1/users"
            value={store.url}
            onChange={(e) => store.setUrl(e.target.value)}
          />
        </div>

        <button 
          onClick={() => store.executeRequest()}
          disabled={store.isExecuting}
          className="flex items-center gap-2 h-10 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <span>{store.isExecuting ? 'Sending...' : 'Send'}</span>
          <Send className="w-4 h-4" />
        </button>

        <button 
          onClick={handleSave}
          className="flex items-center gap-2 h-10 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
          title="Save Request"
        >
          <Save className="w-4 h-4" />
        </button>
      </div>
      
      {/* Editor & Response Area */}
      <div className="flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={50} minSize={20}>
            <Tabs defaultValue="params" className="flex h-full flex-col overflow-hidden">
              <div className="border-b px-2 shrink-0">
                <TabsList className="h-10 bg-transparent gap-2">
                  <TabsTrigger value="params" className="data-[state=active]:bg-muted data-[state=active]:shadow-none h-8">
                    Params {store.queryParams.filter(p => p.key).length > 0 && `(${store.queryParams.filter(p => p.key).length})`}
                  </TabsTrigger>
                  <TabsTrigger value="auth" className="data-[state=active]:bg-muted data-[state=active]:shadow-none h-8">
                    Authorization
                  </TabsTrigger>
                  <TabsTrigger value="headers" className="data-[state=active]:bg-muted data-[state=active]:shadow-none h-8">
                    Headers {store.headers.filter(h => h.key).length > 0 && `(${store.headers.filter(h => h.key).length})`}
                  </TabsTrigger>
                  <TabsTrigger value="body" className="data-[state=active]:bg-muted data-[state=active]:shadow-none h-8">
                    Body {store.bodyType !== 'none' && <span className="ml-1 text-[10px] uppercase text-primary">({store.bodyType})</span>}
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-auto bg-background">
                <TabsContent value="params" className="m-0 h-full">
                  <KeyValueTable 
                    items={store.queryParams} 
                    onAdd={store.addQueryParam}
                    onUpdate={store.updateQueryParam}
                    onRemove={store.removeQueryParam}
                  />
                </TabsContent>
                <TabsContent value="auth" className="m-0 h-full p-4">
                  <div className="text-sm text-muted-foreground">Authorization settings coming soon.</div>
                </TabsContent>
                <TabsContent value="headers" className="m-0 h-full">
                  <KeyValueTable 
                    items={store.headers} 
                    onAdd={store.addHeader}
                    onUpdate={store.updateHeader}
                    onRemove={store.removeHeader}
                  />
                </TabsContent>
                <TabsContent value="body" className="m-0 h-full flex flex-col">
                  <div className="flex items-center gap-2 p-2 border-b shrink-0">
                    <select 
                      className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                      value={store.bodyType}
                      onChange={(e) => store.setBodyType(e.target.value as any)}
                    >
                      <option value="none">none</option>
                      <option value="form-data">form-data</option>
                      <option value="urlencoded">x-www-form-urlencoded</option>
                      <option value="raw">raw</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <BodyEditor />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </ResizablePanel>

          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={50} minSize={20}>
             <ResponseViewer />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
