import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// GET - fetch documents for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const toolType = searchParams.get('toolType')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const id = searchParams.get('id')

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 })
    }

    // Single document fetch
    if (id) {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('teacher_id', userId)
        .single()

      if (error) return Response.json({ error: error.message }, { status: 500 })
      return Response.json({ document: data })
    }

    // Build query
    let query = supabase
      .from('documents')
      .select('*')
      .eq('teacher_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (toolType) query = query.eq('tool_type', toolType)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ documents: data || [] })

  } catch (error) {
    console.error('GET /api/documents error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    console.log('POST /api/documents body:', JSON.stringify(body))
    
    const { userId, title, toolType, toolName, content, metadata } = body

    if (!userId || !title || !content) {
      console.log('POST /api/documents missing fields:', { userId: !!userId, title: !!title, content: !!content })
      return Response.json({ error: 'userId, title, and content are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('documents')
  
    .insert({
    teacher_id: userId,
    title,
    doc_type: toolType || 'general',
    tool_type: toolType,
    tool_name: toolName,
    content,
    metadata: metadata || {},
  })
      .select()
      .single()

    if (error) {
      console.error('POST /api/documents supabase error:', error.message, error.code, error.details, error.hint)
      return Response.json({ error: error.message }, { status: 500 })
    }
    return Response.json({ document: data })

  } catch (error) {
    console.error('POST /api/documents catch error:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - update an existing document
export async function PATCH(request) {
  try {
    const body = await request.json()
    const { documentId, userId, title, content } = body

    if (!documentId || !userId) {
      return Response.json({ error: 'documentId and userId are required' }, { status: 400 })
    }

    const updates = { updated_at: new Date().toISOString() }
    if (title !== undefined) updates.title = title
    if (content !== undefined) updates.content = content

    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', documentId)
      .eq('teacher_id', userId)
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ document: data })

  } catch (error) {
    console.error('PATCH /api/documents error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - delete a document
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!id || !userId) {
      return Response.json({ error: 'id and userId are required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('teacher_id', userId)

   if (error) {
  console.error('POST /api/documents supabase error:', error.message, error.code, error.details)
  return Response.json({ error: error.message }, { status: 500 })
 }

  } catch (error) {
    console.error('DELETE /api/documents error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}