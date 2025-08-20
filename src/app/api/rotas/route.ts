// src/app/api/rotas/route.ts

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

// PUT: Atualizar uma rota (pelo nome)
export async function PUT(req: Request) {
    try {
        const { id, nome_rota, solicitacoes } = await req.json() as Rota;
        if (!id || !nome_rota) {
            return NextResponse.json({ error: 'Os campos "id" e "nome_rota" são obrigatórios.' }, { status: 400 });
        }

        await db.collection('rotas').doc(id).update({ nome_rota, solicitacoes });
        return NextResponse.json({ id, nome_rota, solicitacoes });
    } catch (error) {
        console.error("Erro ao atualizar rota:", error);
        return NextResponse.json({ error: 'Falha ao atualizar rota.' }, { status: 500 });
    }
}

// DELETE: Apagar uma rota
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ error: 'O campo "id" é obrigatório.' }, { status: 400 });
        }
        await db.collection('rotas').doc(id).delete();
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error("Erro ao apagar rota:", error);
        return NextResponse.json({ error: 'Falha ao apagar rota.' }, { status: 500 });
    }
}

// PATCH: Otimizar e reordenar solicitações em uma rota
export async function PATCH(req: Request) {
    try {
        const { id, solicitacoes_ids } = await req.json();
        if (!id || !Array.isArray(solicitacoes_ids)) {
            return NextResponse.json({ error: 'Os campos "id" e "solicitacoes_ids" (como array) são obrigatórios.' }, { status: 400 });
        }

        await db.collection('rotas').doc(id).update({ solicitacoes: solicitacoes_ids });
        return NextResponse.json({ message: 'Rota otimizada com sucesso.' });
    } catch (error) {
        console.error("Erro ao otimizar rota:", error);
        return NextResponse.json({ error: 'Falha ao otimizar rota.' }, { status: 500 });
    }
}