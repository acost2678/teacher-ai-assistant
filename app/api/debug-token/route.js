import { getToken } from "next-auth/jwt";

export async function GET(request) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET,
    raw: false
  });

  console.log("=== DEBUG TOKEN ===", JSON.stringify(token, null, 2));

  return Response.json({
    hasToken: !!token,
    hasAccessToken: !!token?.accessToken,
    email: token?.email,
    tokenKeys: token ? Object.keys(token) : [],
  });
}