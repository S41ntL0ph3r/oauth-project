import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 })
    }

    // Validar tamanho (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `${session.user.id}-${timestamp}.${extension}`
    const filepath = join(uploadDir, filename)

    // Salvar arquivo
    await writeFile(filepath, buffer)

    // Atualizar URL da imagem no banco
    const imageUrl = `/uploads/avatars/${filename}`
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl }
    })

    return NextResponse.json({ 
      message: 'Foto atualizada com sucesso',
      url: imageUrl 
    })

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
