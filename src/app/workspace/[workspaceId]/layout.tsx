import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WorkspaceSidebar } from "@/components/workspace/sidebar"

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { workspaceId: string }
}) {
  const { workspaceId } = await params;
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch workspace details
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single()

  if (workspaceError || !workspace) {
    redirect("/dashboard")
  }

  // Fetch collections, folders, requests
  const { data: collections } = await supabase
    .from("collections")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("name")

  const { data: folders } = await supabase
    .from("folders")
    .select("*, collections!inner(workspace_id)")
    .eq("collections.workspace_id", workspaceId)
    .order("name")

  const { data: requests } = await supabase
    .from("requests")
    .select("*, collections!inner(workspace_id)")
    .eq("collections.workspace_id", workspaceId)
    .order("name")

  const { data: environments } = await supabase
    .from("environments")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("name")

  const { data: history } = await supabase
    .from("history")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground overflow-hidden">
      {/* Top Navbar */}
      <header className="flex h-12 items-center gap-4 border-b bg-background px-4 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-primary font-bold">APIFlow</span>
        </Link>
        <div className="h-4 w-px bg-border mx-2" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{workspace.name}</span>
        </div>
        <div className="h-4 w-px bg-border mx-2" />
        
        {/* Environment Selector Placeholder */}
        <div className="flex items-center gap-2">
           <select className="h-8 rounded-md border border-input bg-background px-2 text-sm text-muted-foreground">
             <option value="">No Environment</option>
             {environments?.map(env => (
               <option key={env.id} value={env.id}>{env.name}</option>
             ))}
           </select>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <form action="/auth/signout" method="post">
            <Button variant="ghost" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      
      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <WorkspaceSidebar 
          workspaceId={workspaceId}
          collections={collections || []}
          folders={folders || []}
          requests={requests || []}
          history={history || []}
        />
        
        {/* Editor Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
