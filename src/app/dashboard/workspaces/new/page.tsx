import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createWorkspace } from "./actions"

export default function NewWorkspacePage() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6 mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create Workspace</CardTitle>
          <CardDescription>
            Workspaces organize your collections, requests, and environments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createWorkspace}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Workspace Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. My Personal APIs"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="What is this workspace for?"
                />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="submit">Create</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
