export default function WorkspaceEmptyState() {
  return (
    <div className="flex h-full w-full items-center justify-center text-muted-foreground flex-col gap-2">
      <div className="text-xl font-semibold text-foreground">Workspace ready</div>
      <p>Select a request from the sidebar or create a new one to get started.</p>
    </div>
  )
}
