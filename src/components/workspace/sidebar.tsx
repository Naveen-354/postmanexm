"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ChevronRight, ChevronDown, Folder, Clock, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SidebarActions } from "./sidebar-actions"

// Types based on Supabase schema
type Collection = { id: string; name: string }
type DbFolder = { id: string; collection_id: string; parent_id: string | null; name: string }
type Request = { id: string; collection_id: string; folder_id: string | null; name: string; method: string }
type HistoryItem = { id: string; request_id: string; method: string; url: string; created_at: string; status: number }

export function WorkspaceSidebar({
  workspaceId,
  collections,
  folders,
  requests,
  history,
}: {
  workspaceId: string
  collections: Collection[]
  folders: DbFolder[]
  requests: Request[]
  history: HistoryItem[]
}) {
  const router = useRouter()
  const params = useParams()
  const currentRequestId = params.requestId as string

  const [activeTab, setActiveTab] = useState<'collections' | 'history'>('collections')
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({})
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})

  const toggleCollection = (id: string) => {
    setExpandedCollections(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'text-emerald-500'
      case 'POST': return 'text-amber-500'
      case 'PUT': return 'text-sky-500'
      case 'DELETE': return 'text-rose-500'
      case 'PATCH': return 'text-violet-500'
      default: return 'text-slate-500'
    }
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-emerald-500"
    if (status >= 300 && status < 400) return "text-sky-500"
    if (status >= 400 && status < 500) return "text-amber-500"
    return "text-rose-500"
  }

  return (
    <div className="w-64 border-r bg-muted/20 flex flex-col h-full shrink-0">
      <div className="p-3 border-b flex flex-col gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <Input placeholder="Filter..." className="h-8 text-sm" />
          <SidebarActions workspaceId={workspaceId} collections={collections} />
        </div>
        <div className="flex bg-muted rounded-md p-1">
          <button 
            className={`flex-1 text-xs font-medium py-1.5 rounded-sm transition-colors ${activeTab === 'collections' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('collections')}
          >
            Collections
          </button>
          <button 
            className={`flex-1 text-xs font-medium py-1.5 rounded-sm transition-colors ${activeTab === 'history' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'collections' && (
          <>
            {collections.map(collection => {
              const isExpanded = expandedCollections[collection.id]
              const collectionFolders = folders.filter(f => f.collection_id === collection.id && !f.parent_id)
              const collectionRequests = requests.filter(r => r.collection_id === collection.id && !r.folder_id)

              return (
                <div key={collection.id} className="mb-1">
                  <div 
                    className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-muted rounded-md cursor-pointer text-sm font-medium text-foreground/90"
                    onClick={() => toggleCollection(collection.id)}
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                    <Folder className="h-4 w-4 shrink-0 text-primary/80" />
                    <span className="truncate">{collection.name}</span>
                  </div>
                  
                  {isExpanded && (
                    <div className="pl-6 mt-1 flex flex-col gap-0.5">
                      {collectionFolders.map(folder => (
                        <FolderNode 
                          key={folder.id} 
                          folder={folder} 
                          allFolders={folders} 
                          allRequests={requests} 
                          expanded={expandedFolders} 
                          onToggle={toggleFolder}
                          workspaceId={workspaceId}
                          currentRequestId={currentRequestId}
                        />
                      ))}
                      
                      {collectionRequests.map(request => (
                        <RequestNode 
                          key={request.id} 
                          request={request} 
                          workspaceId={workspaceId}
                          currentRequestId={currentRequestId}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            {collections.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No collections yet.
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="flex flex-col gap-1">
            {history.map(item => (
               <Link 
                 key={item.id}
                 href={`/workspace/${workspaceId}/request/${item.request_id}`}
                 className="flex flex-col gap-1 p-2 hover:bg-muted rounded-md transition-colors"
               >
                 <div className="flex items-center justify-between">
                   <span className={`text-[10px] font-bold ${getMethodColor(item.method)}`}>{item.method}</span>
                   <span className={`text-[10px] font-bold ${getStatusColor(item.status)}`}>{item.status}</span>
                 </div>
                 <span className="text-xs text-foreground/80 truncate">{item.url}</span>
                 <span className="text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleString()}</span>
               </Link>
            ))}
            {history.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <Clock className="h-6 w-6" />
                <span>No history yet.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function FolderNode({ 
  folder, 
  allFolders, 
  allRequests, 
  expanded, 
  onToggle,
  workspaceId,
  currentRequestId
}: { 
  folder: DbFolder
  allFolders: DbFolder[]
  allRequests: Request[]
  expanded: Record<string, boolean>
  onToggle: (id: string) => void
  workspaceId: string
  currentRequestId: string
}) {
  const isExpanded = expanded[folder.id]
  const childFolders = allFolders.filter(f => f.parent_id === folder.id)
  const childRequests = allRequests.filter(r => r.folder_id === folder.id)

  return (
    <div>
      <div 
        className="flex items-center gap-1.5 px-2 py-1 hover:bg-muted rounded-md cursor-pointer text-sm text-foreground/80"
        onClick={() => onToggle(folder.id)}
      >
        {isExpanded ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
        <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{folder.name}</span>
      </div>
      
      {isExpanded && (
        <div className="pl-5 flex flex-col gap-0.5 mt-0.5">
          {childFolders.map(child => (
            <FolderNode 
              key={child.id} 
              folder={child} 
              allFolders={allFolders} 
              allRequests={allRequests} 
              expanded={expanded} 
              onToggle={onToggle}
              workspaceId={workspaceId}
              currentRequestId={currentRequestId}
            />
          ))}
          {childRequests.map(request => (
            <RequestNode 
              key={request.id} 
              request={request} 
              workspaceId={workspaceId}
              currentRequestId={currentRequestId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function RequestNode({ 
  request, 
  workspaceId,
  currentRequestId
}: { 
  request: Request
  workspaceId: string
  currentRequestId: string
}) {
  const isActive = currentRequestId === request.id
  
  // A helper function to assign a color based on method
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'text-emerald-500'
      case 'POST': return 'text-amber-500'
      case 'PUT': return 'text-sky-500'
      case 'DELETE': return 'text-rose-500'
      case 'PATCH': return 'text-violet-500'
      default: return 'text-slate-500'
    }
  }

  return (
    <Link 
      href={`/workspace/${workspaceId}/request/${request.id}`}
      className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer text-sm transition-colors ${
        isActive ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground/80'
      }`}
    >
      <span className={`text-[10px] font-bold w-10 shrink-0 ${getMethodColor(request.method)}`}>
        {request.method}
      </span>
      <span className="truncate">{request.name}</span>
    </Link>
  )
}
