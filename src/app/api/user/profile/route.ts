import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar dados completos do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const response = NextResponse.json({ user });
    
    // Adicionar headers de cache
    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=60'); // 5 min cache, 1 min stale
    response.headers.set('ETag', `"${user.updatedAt.getTime()}"`);
    response.headers.set('Last-Modified', user.updatedAt.toUTCString());

    return response;

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
