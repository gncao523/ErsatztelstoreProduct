import { NextRequest, NextResponse } from "next/server";
import { getProductDetail } from "@/lib/eed";
import { getClientIp } from "@/lib/client-ip";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const sessionId =
    request.cookies.get("eed_session")?.value ??
    request.nextUrl.searchParams.get("sessionId") ??
    undefined;

  try {
    const clientIp = await getClientIp();
    const result = await getProductDetail(id, clientIp, sessionId);

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
      error instanceof Error ? error.message : "Failed to load product";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
