import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
        <Button asChild>
          <Link href="/dashboard/workspaces/new">Create Workspace</Link>
        </Button>
      </div>

      {workspaces && workspaces.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Link key={workspace.id} href={`/workspace/${workspace.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle>{workspace.name}</CardTitle>
                  {workspace.description && (
                    <CardDescription>{workspace.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(workspace.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-24 border rounded-lg border-dashed">
          <h2 className="text-xl font-semibold">No workspaces found</h2>
          <p className="text-muted-foreground">Create your first workspace to get started.</p>
          <Button asChild>
            <Link href="/dashboard/workspaces/new">Create Workspace</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
