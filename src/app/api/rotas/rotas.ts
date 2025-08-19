import { NextResponse } from 'next/server';
import db from '@/lib/firebaseAdmin';
import { Rota } from '@/types';

// POST: Criar uma nova rota
export async function POST(req: Request) {
  try {
    const { nome_rota, solicitacoes_ids } = await req.json();
    if (!nome_rota) {
      return NextResponse.json({ error: 'O campo "nome_rota" é obrigatório.' }, { status: 400 });
    }

    const novaRota: Omit<Rota, 'id'> = {
      nome_rota,
      solicitacoes: solicitacoes_ids || [],
    };

    const docRef = await db.collection('rotas').add(novaRota);
    return NextResponse.json({ id: docRef.id, ...novaRota }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar rota:", error);
    return NextResponse.json({ error: 'Falha ao criar rota.' }, { status: 500 });
  }
}

// GET: Buscar todas as rotas
export async function GET() {
    try {
        const snapshot = await db.collection('rotas').get();
        const rotas: Rota[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<Rota, 'id'>),
        }));
        return NextResponse.json(rotas);
    } catch (error) {
        console.error("Erro ao buscar rotas:", error);
        return NextResponse.json({ error: 'Falha ao buscar rotas.' }, { status: 500 });
    }
}