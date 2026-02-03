import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // SEGURANÇA: Apenas usuários autenticados ou ambiente de desenvolvimento
    if (process.env.NODE_ENV === 'production') {
      const session = await auth();
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Não autorizado' },
          { status: 401 }
        );
      }
    }
    
    const { email, serviceId, templateId, publicKey } = await request.json();

    if (!email || !serviceId || !templateId || !publicKey) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // Simular o envio do email usando EmailJS no frontend
    // Esta API é apenas para validação, o envio real acontece no frontend
    
    return NextResponse.json({
      message: "Configuração válida! O email será enviado pelo frontend.",
      config: {
        serviceId,
        templateId,
        publicKey: publicKey.substring(0, 8) + "...", // Mostrar apenas parte da chave
        email
      }
    });
  } catch (error) {
    console.error("Erro ao testar configuração EmailJS:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
