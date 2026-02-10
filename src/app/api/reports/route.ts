import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    // Mostrar apenas relatórios do usuário
    where.generatedBy = session.user.id;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: {
          generatedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar relatórios:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar relatórios' },
      { status: 500 }
    );
  }
}

// POST: Gerar novo relatório
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, type, format, parameters } = body;

    if (!title || !type || !format) {
      return NextResponse.json(
        { error: 'Título, tipo e formato são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar registro de relatório
    const report = await prisma.report.create({
      data: {
        title,
        description,
        type,
        format,
        parameters: parameters || {},
        generatedBy: session.user.id!,
        status: 'PENDING',
      },
    });

    // Iniciar processo de geração (simulado)
    setTimeout(async () => {
      try {
        await prisma.report.update({
          where: { id: report.id },
          data: { status: 'GENERATING' },
        });

        // Buscar dados baseado no tipo
        let reportData: unknown[] = [];

        switch (type) {
          case 'USERS':
            reportData = await prisma.user.findMany({
              select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
              },
            });
            break;

          case 'ANALYTICS':
            reportData = await prisma.analytics.findMany({
              orderBy: { date: 'desc' },
              take: 1000,
            });
            break;

          case 'SECURITY':
            reportData = await prisma.securityEvent.findMany({
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 1000,
            });
            break;

          case 'SESSIONS':
            reportData = await prisma.sessionLog.findMany({
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 1000,
            });
            break;

          case 'AUDIT':
            reportData = await prisma.dataAccessLog.findMany({
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 1000,
            });
            break;

          default:
            throw new Error('Tipo de relatório não suportado');
        }

        // Gerar arquivo baseado no formato
        const reportsDir = path.join(process.cwd(), 'reports');
        await fs.mkdir(reportsDir, { recursive: true });

        const filename = `report_${report.id}_${Date.now()}`;
        let filepath: string = '';
        let fileContent: string = '';

        if (format === 'CSV') {
          filepath = path.join(reportsDir, `${filename}.csv`);
          fileContent = Papa.unparse(reportData);
          await fs.writeFile(filepath, fileContent, 'utf-8');
        } else if (format === 'JSON') {
          filepath = path.join(reportsDir, `${filename}.json`);
          fileContent = JSON.stringify(reportData, null, 2);
          await fs.writeFile(filepath, fileContent, 'utf-8');
        } else if (format === 'EXCEL') {
          // Para Excel, salvamos como CSV por enquanto
          // Em produção, use biblioteca como 'xlsx'
          filepath = path.join(reportsDir, `${filename}.csv`);
          fileContent = Papa.unparse(reportData);
          await fs.writeFile(filepath, fileContent, 'utf-8');
        } else if (format === 'PDF') {
          // PDF será gerado no lado do cliente ou com biblioteca específica
          filepath = path.join(reportsDir, `${filename}.json`);
          fileContent = JSON.stringify(reportData, null, 2);
          await fs.writeFile(filepath, fileContent, 'utf-8');
        }

        // Obter tamanho do arquivo
        const stats = await fs.stat(filepath);

        // Atualizar registro
        await prisma.report.update({
          where: { id: report.id },
          data: {
            status: 'COMPLETED',
            fileUrl: `/api/reports/download?reportId=${report.id}`,
            fileSize: BigInt(stats.size),
            recordCount: reportData.length,
            completedAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
            metadata: { filepath },
          },
        });
      } catch (error) {
        console.error('Erro ao processar relatório:', error);
        await prisma.report.update({
          where: { id: report.id },
          data: {
            status: 'FAILED',
            metadata: { error: String(error) },
          },
        });
      }
    }, 100);

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar relatório:', error);
    return NextResponse.json(
      { error: 'Erro ao criar relatório' },
      { status: 500 }
    );
  }
}

// DELETE: Remover relatório
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');

    if (!reportId) {
      return NextResponse.json(
        { error: 'reportId é obrigatório' },
        { status: 400 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Relatório não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o relatório pertence ao usuário
    if (report.generatedBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Sem permissão para deletar este relatório' },
        { status: 403 }
      );
    }

    // Deletar arquivo se existir
    if (report.metadata && typeof report.metadata === 'object' && 'filepath' in report.metadata) {
      try {
        await fs.unlink(report.metadata.filepath as string);
      } catch (error) {
        console.error('Erro ao deletar arquivo de relatório:', error);
      }
    }

    // Deletar registro
    await prisma.report.delete({
      where: { id: reportId },
    });

    return NextResponse.json({ message: 'Relatório removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover relatório:', error);
    return NextResponse.json(
      { error: 'Erro ao remover relatório' },
      { status: 500 }
    );
  }
}
