import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function POST() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Resetar a imagem do usuário para null
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: null }
    })

    return NextResponse.json({ 
      message: 'Avatar resetado com sucesso',
      success: true 
    })

  } catch (error) {
    console.error('Erro ao resetar avatar:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}
