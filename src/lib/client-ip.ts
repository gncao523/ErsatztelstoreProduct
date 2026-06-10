import { headers } from "next/headers";

export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "127.0.0.1";
  }
  return headerList.get("x-real-ip") ?? "127.0.0.1";
}
