// app/api/admin/login/route.js
import { NextResponse } from "next/server";
import { checkCredentials, createSessionToken, COOKIE_NAME, TOKEN_TTL_SECONDS } from "../../../../lib/auth";

export async function POST(request) {
  const { login, password } = await request.json();

  if (!checkCredentials(login, password)) {
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
  }

  const token = createSessionToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_TTL_SECONDS,
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return response;
}
