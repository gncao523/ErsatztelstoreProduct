import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/eed";
import { getClientIp } from "@/lib/client-ip";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const sessionId =
    request.cookies.get("eed_session")?.value ??
    request.nextUrl.searchParams.get("sessionId") ??
    undefined;

  try {
    const clientIp = await getClientIp();
    const result = await searchProducts(query, clientIp, sessionId);

    const response = NextResponse.json(result);
    if (result.sessionId) {
      response.cookies.set("eed_session", result.sessionId, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 3,
      });
    }
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
