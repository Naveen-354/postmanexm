'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCollection(workspaceId: string, name: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('collections')
    .insert({
      workspace_id: workspaceId,
      name,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating collection:', error)
    return { error: error.message }
  }

  revalidatePath(`/workspace/${workspaceId}`)
  return { data }
}

export async function createFolder(collectionId: string, name: string, parentId?: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('folders')
    .insert({
      collection_id: collectionId,
      parent_id: parentId || null,
      name,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating folder:', error)
    return { error: error.message }
  }

  // We need workspace_id to revalidate, but we can just let the client router.refresh() 
  // or return success. Let's return success.
  return { data }
}

export async function createRequest(collectionId: string, folderId: string | null, name: string, method: string = 'GET') {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('requests')
    .insert({
      collection_id: collectionId,
      folder_id: folderId || null,
      name,
      method,
      url: '',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating request:', error)
    return { error: error.message }
  }

  return { data }
}

export async function saveRequest(requestId: string, updates: any) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('requests')
    .update(updates)
    .eq('id', requestId)

  if (error) {
    console.error('Error saving request:', error)
    return { error: error.message }
  }

  return { success: true }
}

export async function saveResponseExample(requestId: string, name: string, status: number, body: string, headers: any) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('saved_responses')
    .insert({
      request_id: requestId,
      name,
      status,
      body,
      headers
    })

  if (error) {
    console.error('Error saving response example:', error)
    return { error: error.message }
  }

  return { success: true }
}


