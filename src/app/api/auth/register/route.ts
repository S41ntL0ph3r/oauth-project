import { NextResponse } from "next/server";
import db from "@/lib/db";
import { schema } from "@/lib/schema";
import { sendVerificationEmail } from "@/lib/mailer";
import { hash } from "bcrypt";

function generateCode(length = 6) {
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < length; i++) code += digits[Math.floor(Math.random() * digits.length)];
  return code;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = schema.parse(body);

    // check existing
    const exists = await db.user.findUnique({ where: { email: validated.email } });
    if (exists) return NextResponse.json({ error: "User already exists" }, { status: 409 });

    // hash password (10 rounds is standard security/speed trade-off)
    const hashedPassword = await hash(validated.password, 10);

    // create user with hashed password
    await db.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
      },
    });

    // create verification token
    const code = generateCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.verificationToken.create({ data: { identifier: validated.email, token: code, expires } });

    // send email
    await sendVerificationEmail(validated.email, code);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: (err as Error)?.message || "Internal" }, { status: 400 });
  }
}
