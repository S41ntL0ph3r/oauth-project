import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { withApiHandler, apiResponse } from '@/server/http/route';
import { emailService } from '@/services/email/emailService';

export async function POST(request: NextRequest) {
  return withApiHandler(async () => {
    if (process.env.NODE_ENV === 'production') {
      const session = await auth();
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Não autorizado' },
          { status: 401 }
        );
      }
    }
    
    const { email, subject, message } = await request.json();

    if (!email) {
      return apiResponse({ error: "Email é obrigatório" }, 400);
    }

    const result = await emailService.sendTestEmail(email, subject, message);
    emailService.assertSuccess(result, 'Falha no envio do email de teste');

    return {
      message: 'Email de teste enviado com sucesso.',
      provider: result.provider,
    };
  });
}
