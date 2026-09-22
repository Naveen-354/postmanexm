'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createWorkspace(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login')
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      name,
      description,
      owner_id: user.id
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating workspace:', error)
    // You could return an error message to display on the client here
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  redirect(`/workspace/${data.id}`)
}
