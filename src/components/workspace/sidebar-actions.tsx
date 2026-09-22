"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCollection, createRequest } from "@/app/workspace/[workspaceId]/actions"

export function SidebarActions({ workspaceId, collections }: { workspaceId: string, collections: any[] }) {
  const router = useRouter()
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  
  const [name, setName] = useState("")
  const [selectedCollection, setSelectedCollection] = useState(collections[0]?.id || "")

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    await createCollection(workspaceId, name)
    setCollectionDialogOpen(false)
    setName("")
    router.refresh()
  }

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !selectedCollection) return
    const { data } = await createRequest(selectedCollection, null, name)
    setRequestDialogOpen(false)
    setName("")
    router.refresh()
    if (data) {
      router.push(`/workspace/${workspaceId}/request/${data.id}`)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setCollectionDialogOpen(true)}>
            New Collection
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setRequestDialogOpen(true)}
            disabled={collections.length === 0}
          >
            New Request
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={collectionDialogOpen} onOpenChange={setCollectionDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreateCollection}>
            <DialogHeader>
              <DialogTitle>New Collection</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreateRequest}>
            <DialogHeader>
              <DialogTitle>New Request</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="req-name">Name</Label>
                <Input
                  id="req-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="collection">Collection</Label>
                <select 
                  id="collection"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                >
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
