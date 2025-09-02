import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    if (!email || !code) return NextResponse.json({ error: "Missing" }, { status: 400 });

    const token = await db.verificationToken.findUnique({ where: { identifier_token: { identifier: email, token: code } } });
    if (!token) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

    if (new Date(token.expires) < new Date()) {
      // delete expired token
      await db.verificationToken.delete({ where: { identifier_token: { identifier: email, token: code } } });
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    // mark user verified
    await db.user.update({ where: { email }, data: { emailVerified: new Date() } });

    // delete token
    await db.verificationToken.delete({ where: { identifier_token: { identifier: email, token: code } } });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : "Internal";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
