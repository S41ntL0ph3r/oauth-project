import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth, AdminJWTPayload } from '@/lib/admin/jwt';
import { validateAndSanitize, getClientIP, getClientUserAgent } from '@/lib/admin/security';

// GET - Listar usuários com paginação e filtros
export const GET = requireAuth(async (request: NextRequest & { admin?: AdminJWTPayload }) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status === 'verified') {
      where.emailVerified = { not: null };
    } else if (status === 'unverified') {
      where.emailVerified = null;
    }

    // Buscar usuários
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          sessions: {
            select: {
              expires: true,
              updatedAt: true
            },
            orderBy: { updatedAt: 'desc' },
            take: 1
          },
          accounts: {
            select: {
              provider: true,
              createdAt: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Adicionar informações extras
    const usersWithExtras = users.map(user => ({
      ...user,
      isOnline: user.sessions.length > 0 && new Date(user.sessions[0].expires) > new Date(),
      lastActive: user.sessions[0]?.updatedAt || user.updatedAt,
      loginMethod: user.accounts[0]?.provider || 'email',
      accountAge: Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    }));

    return NextResponse.json({
      success: true,
      users: usersWithExtras,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
}, ['SUPER_ADMIN', 'ADMIN']);

// PUT - Atualizar usuário
export const PUT = requireAuth(async (request: NextRequest & { admin?: AdminJWTPayload }) => {
  try {
    const body = await request.json();
    const { userId, ...updateData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Validação dos dados
    const allowedFields = ['name', 'email'];
    const dataToUpdate: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        dataToUpdate[field] = updateData[field];
      }
    }

    // Validar dados se fornecidos
    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum dado válido para atualização' },
        { status: 400 }
      );
    }

    const validation = validateAndSanitize(dataToUpdate, {
      name: { type: 'string', minLength: 2, maxLength: 100 },
      email: { type: 'email', maxLength: 254 }
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.errors },
        { status: 400 }
      );
    }

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar email duplicado se email foi alterado
    if (validation.sanitized.email && validation.sanitized.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validation.sanitized.email as string }
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Este email já está em uso' },
          { status: 409 }
        );
      }

      // Se email mudou, remover verificação
      validation.sanitized.emailVerified = null;
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validation.sanitized,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        updatedAt: true
      }
    });

    // Log da ação
    if (request.admin) {
      await prisma.adminLog.create({
        data: {
          adminId: request.admin.adminId,
          action: 'USER_UPDATED',
          target: userId,
          targetType: 'user',
          details: JSON.parse(JSON.stringify({
            updatedFields: Object.keys(validation.sanitized),
            oldData: {
              name: existingUser.name,
              email: existingUser.email
            },
            newData: validation.sanitized
          })),
          ipAddress: getClientIP(request),
          userAgent: getClientUserAgent(request)
        }
      });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Usuário atualizado com sucesso'
    });

  } catch (error) {
    console.error('Update user error:', error);
    
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
}, ['SUPER_ADMIN', 'ADMIN']);

// DELETE - Excluir usuário
export const DELETE = requireAuth(async (request: NextRequest & { admin?: AdminJWTPayload }) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Excluir usuário (cascata automática)
    await prisma.user.delete({
      where: { id: userId }
    });

    // Log da ação
    if (request.admin) {
      await prisma.adminLog.create({
        data: {
          adminId: request.admin.adminId,
          action: 'USER_DELETED',
          target: userId,
          targetType: 'user',
          details: JSON.parse(JSON.stringify({
            deletedUser: {
              name: existingUser.name,
              email: existingUser.email
            }
          })),
          ipAddress: getClientIP(request),
          userAgent: getClientUserAgent(request)
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir usuário' },
      { status: 500 }
    );
  }
}, ['SUPER_ADMIN', 'ADMIN']);
