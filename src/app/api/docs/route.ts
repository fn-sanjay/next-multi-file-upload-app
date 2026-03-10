import { NextResponse } from "next/server";
import { openApiSpec } from "@/lib/server/swagger/openapi";

export async function GET() {
  return NextResponse.json(openApiSpec);
}
