import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedAdminFromRequest } from '@/lib/admin/jwt';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const adminData = getAuthenticatedAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (status) {
      whereClause.status = status;
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.product.count({ where: whereClause })
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminData = getAuthenticatedAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    
    const product = await db.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        category: data.category,
        status: data.status || 'ACTIVE',
        images: data.images || [],
        createdById: adminData.adminId
      }
    });

    // Log da ação
    await db.adminLog.create({
      data: {
        adminId: adminData.adminId,
        action: 'CREATE',
        target: product.id,
        targetType: 'PRODUCT',
        details: { productName: product.name },
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown'
      }
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminData = getAuthenticatedAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    
    const product = await db.product.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        category: data.category,
        status: data.status,
        images: data.images || []
      }
    });

    // Log da ação
    await db.adminLog.create({
      data: {
        adminId: adminData.adminId,
        action: 'UPDATE',
        target: product.id,
        targetType: 'PRODUCT',
        details: { productName: product.name },
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown'
      }
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminData = getAuthenticatedAdminFromRequest(request);
    if (!adminData) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id }
    });

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    await db.product.delete({
      where: { id }
    });

    // Log da ação
    await db.adminLog.create({
      data: {
        adminId: adminData.adminId,
        action: 'DELETE',
        target: id,
        targetType: 'PRODUCT',
        details: { productName: product.name },
        ipAddress: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown'
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
