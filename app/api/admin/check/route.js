// app/api/admin/check/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, COOKIE_NAME } from "../../../../lib/auth";

export async function GET() {
  const token = cookies().get(COOKIE_NAME)?.value;
  const isValid = token ? verifySessionToken(token) : false;
  return NextResponse.json({ authenticated: isValid });
}
