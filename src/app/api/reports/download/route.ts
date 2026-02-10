import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';
import { promises as fs } from 'fs';

// GET: Baixar relatório
export async function GET(request: Request) {
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
        { error: 'Sem permissão para acessar este relatório' },
        { status: 403 }
      );
    }

    if (report.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Relatório ainda não está completo' },
        { status: 400 }
      );
    }

    if (!report.metadata || typeof report.metadata !== 'object' || !('filepath' in report.metadata)) {
      return NextResponse.json(
        { error: 'Arquivo de relatório não encontrado' },
        { status: 404 }
      );
    }

    const filepath = report.metadata.filepath as string;

    // Ler arquivo
    const fileBuffer = await fs.readFile(filepath);

    // Determinar Content-Type baseado no formato
    let contentType = 'application/octet-stream';
    let extension = 'file';

    switch (report.format) {
      case 'CSV':
        contentType = 'text/csv';
        extension = 'csv';
        break;
      case 'JSON':
        contentType = 'application/json';
        extension = 'json';
        break;
      case 'EXCEL':
        contentType = 'application/vnd.ms-excel';
        extension = 'csv'; // Por enquanto, até implementar XLSX real
        break;
      case 'PDF':
        contentType = 'application/pdf';
        extension = 'pdf';
        break;
    }

    // Atualizar contador de downloads
    await prisma.report.update({
      where: { id: reportId },
      data: {
        downloaded: true,
        downloadCount: { increment: 1 },
      },
    });

    const filename = `${report.title.replace(/[^a-z0-9]/gi, '_')}.${extension}`;

    // Retornar arquivo para download
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Erro ao baixar relatório:', error);
    return NextResponse.json(
      { error: 'Erro ao baixar relatório' },
      { status: 500 }
    );
  }
}
