import { NextResponse } from "next/server";
import { schema } from "@/lib/schema";
import { hash } from "bcrypt";
import { randomBytes } from "crypto";
import { withApiHandler, parseJsonBody, apiResponse } from '@/server/http/route';
import { userRepository } from '@/server/repositories/user-repository';
import { emailService } from '@/services/email/emailService';
import { analyticsService } from '@/services/analytics/analyticsService';

export async function POST(req: Request) {
  return withApiHandler(async () => {
    const validated = await parseJsonBody(req, schema);

    const exists = await userRepository.findByEmail(validated.email);
    if (exists) {
      return apiResponse({ error: "Usuário já existe" }, 409);
    }

    const hashedPassword = await hash(validated.password, 12);

    const user = await userRepository.createUser({
      email: validated.email,
      password: hashedPassword,
      name: validated.email.split('@')[0],
    });

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await userRepository.createVerificationToken({
      email: validated.email,
      token,
      expires,
    });

    const emailResult = await emailService.sendVerificationEmail(validated.email, token);

    await analyticsService.captureServerEvent({
      event: 'feature_visited',
      distinctId: user.id,
      properties: {
        feature: 'register',
        emailSent: emailResult.success,
      },
    });

    if (!emailResult.success) {
      console.warn('Falha ao enviar email de verificação para:', validated.email);
      return {
        ok: true,
        warning: "Conta criada, mas houve problema no envio do email. Tente fazer login ou contacte o suporte.",
      };
    }

    return {
      ok: true,
      message: "Conta criada com sucesso! Verifique seu email para ativar a conta.",
    };
  });
}
