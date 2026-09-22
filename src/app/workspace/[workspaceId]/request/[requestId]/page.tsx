import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { RequestEditor } from "@/components/workspace/request-editor"

export default async function RequestEditorPage({
  params,
}: {
  params: { workspaceId: string; requestId: string }
}) {
  const { workspaceId, requestId } = await params;
  const supabase = await createClient()

  const { data: request, error } = await supabase
    .from("requests")
    .select("*")
    .eq("id", requestId)
    .single()

  if (error || !request) {
    notFound()
  }

  return (
    <div className="flex h-full w-full flex-col">
      <RequestEditor initialRequest={request} workspaceId={workspaceId} />
    </div>
  )
}

