// src/app/api/solicitacoes/route.ts

import { NextResponse } from 'next/server';
import db from '@/lib/firebaseAdmin';
import { Solicitacao } from '@/types';
// A linha 'import admin from 'firebase-admin';' foi removida daqui.

// GET: Buscar todas as solicitações
export async function GET() {
  try {
    const snapshot = await db.collection('solicitacoes').get();
    const solicitacoes = snapshot.docs.map(doc => {
      const data = doc.data();
      const dataCriacao = data.data_criacao || new Date().toISOString();
      return {
        id: doc.id,
        ...data,
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        data_criacao: dataCriacao,
      } as Solicitacao;
    });
    return NextResponse.json(solicitacoes);
  } catch (error) {
    console.error("Erro ao buscar solicitações:", error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return NextResponse.json({ error: `Falha ao buscar solicitações: ${errorMessage}` }, { status: 500 });
  }
}

// POST: Criar uma nova solicitação
export async function POST(req: Request) {
  try {
    const solicitacaoData = await req.json();

    if (!solicitacaoData.tipo_demanda_id || !solicitacaoData.tipo_andamento_id || !solicitacaoData.latitude || !solicitacaoData.longitude) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 });
    }
    
    const novaSolicitacao: Omit<Solicitacao, 'id'> = {
      ...solicitacaoData,
      data_criacao: new Date().toISOString(),
    };

    const docRef = await db.collection('solicitacoes').add(novaSolicitacao);
    const doc = await docRef.get();
    return NextResponse.json({ id: doc.id, ...doc.data() }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar solicitação:", error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return NextResponse.json({ error: `Falha ao criar solicitação: ${errorMessage}` }, { status: 500 });
  }
}

// PUT: Atualizar uma solicitação
export async function PUT(req: Request) {
    try {
        const { id, ...solicitacaoData } = await req.json();
        if (!id) {
            return NextResponse.json({ error: 'O ID da solicitação é obrigatório.' }, { status: 400 });
        }

        await db.collection('solicitacoes').doc(id).update(solicitacaoData);
        return NextResponse.json({ id, ...solicitacaoData });

    } catch (error) {
        console.error("Erro ao atualizar solicitação:", error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return NextResponse.json({ error: `Falha ao atualizar solicitação: ${errorMessage}` }, { status: 500 });
    }
}

// DELETE: Apagar uma solicitação
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ error: 'O ID da solicitação é obrigatório.' }, { status: 400 });
        }
        await db.collection('solicitacoes').doc(id).delete();
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error("Erro ao apagar solicitação:", error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        return NextResponse.json({ error: `Falha ao apagar solicitação: ${errorMessage}` }, { status: 500 });
    }
}