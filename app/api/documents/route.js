import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET - Retrieve documents for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const toolType = searchParams.get("toolType");
    const limit = parseInt(searchParams.get("limit")) || 50;
    const offset = parseInt(searchParams.get("offset")) || 0;

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    let query = supabase
      .from("documents")
      .select("*")
      .eq("teacher_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (toolType) {
      query = query.eq("tool_type", toolType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching documents:", error);
      return Response.json({ error: "Failed to fetch documents" }, { status: 500 });
    }

    return Response.json({ documents: data });
  } catch (error) {
    console.error("Error in GET documents:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Save a new document
export async function POST(request) {
  try {
    const { userId, title, toolType, toolName, content, metadata } = await request.json();

    if (!userId || !title || !toolType || !toolName || !content) {
      return Response.json(
        { error: "Missing required fields: userId, title, toolType, toolName, content" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("documents")
      .insert([
        {
          teacher_id: userId,
          title: title,
          tool_type: toolType,
          tool_name: toolName,
          content: content,
          metadata: metadata || {},
          doc_type: toolType,
          tone: metadata?.tone || 'neutral',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error saving document:", error);
      return Response.json({ error: "Failed to save document: " + error.message }, { status: 500 });
    }

    return Response.json({ document: data, message: "Document saved successfully" });
  } catch (error) {
    console.error("Error in POST document:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete a document
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!documentId || !userId) {
      return Response.json(
        { error: "Document ID and User ID are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId)
      .eq("teacher_id", userId);

    if (error) {
      console.error("Error deleting document:", error);
      return Response.json({ error: "Failed to delete document" }, { status: 500 });
    }

    return Response.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE document:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}