import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ✅ Supabase client
  const supabase = createMiddlewareClient({ req, res });

  // ✅ Ambil cookie lang atau default "id"
  let lang = req.cookies.get("lang")?.value || "id";

  // ✅ Simpan ke header supaya bisa diakses di Server Components
  res.headers.set("x-lang", lang);

  // ✅ Auth check
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Kalau sudah login, jangan bisa akses /auth/login atau /auth/signup
  if (session && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup"))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Kalau belum login, jangan bisa akses halaman lain selain /auth/*
  if (!session && !pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
