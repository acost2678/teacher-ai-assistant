import { getToken } from "next-auth/jwt";
import { google } from "googleapis";
import { NextRequest } from "next/server";

export async function POST(request) {
  try {
    // Use getToken which reads directly from the cookie - more reliable than getServerSession
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    console.log("=== DRIVE TOKEN ===", JSON.stringify({
      hasToken: !!token,
      hasAccessToken: !!token?.accessToken,
      email: token?.email
    }));

    if (!token?.accessToken) {
      return Response.json(
        { error: "Not authenticated with Google. Please connect your Google account." },
        { status: 401 }
      );
    }

    const { title, content, toolName } = await request.json();

    if (!title || !content) {
      return Response.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Set up Google OAuth client
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({ access_token: token.accessToken });

    const docs = google.docs({ version: "v1", auth });

    // Create a new Google Doc
    const docResponse = await docs.documents.create({
      requestBody: {
        title: title,
      },
    });

    const documentId = docResponse.data.documentId;

    // Clean content and insert into doc
    const cleanContent = content
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`{1,3}(.*?)`{1,3}/gs, "$1");

    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: cleanContent,
            },
          },
        ],
      },
    });

    const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;

    return Response.json({
      success: true,
      documentId,
      docUrl,
      message: "Document saved to Google Drive",
    });

  } catch (error) {
    console.error("=== GOOGLE DRIVE ERROR ===", error?.message, error?.code);

    if (error?.code === 401 || error?.status === 401) {
      return Response.json(
        { error: "Google session expired. Please reconnect your Google account." },
        { status: 401 }
      );
    }

    if (error?.code === 403 || error?.status === 403) {
      return Response.json(
        { error: "Google Drive permission denied. Please reconnect and allow Drive access." },
        { status: 403 }
      );
    }

    return Response.json(
      { error: error?.message || "Failed to save to Google Drive." },
      { status: 500 }
    );
  }
}