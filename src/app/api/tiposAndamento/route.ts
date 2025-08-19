import { NextResponse } from 'next/server';
import db from '@/lib/firebaseAdmin';
import { TipoAndamento } from '@/types';

// GET: Buscar todos os tipos de andamento
export async function GET() {
  try {
    const snapshot = await db.collection('tiposAndamento').get();
    const items: TipoAndamento[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<TipoAndamento, 'id'>),
    }));
    return NextResponse.json(items);
  } catch (error) {
    console.error("Erro ao buscar tipos de andamento:", error);
    return NextResponse.json({ error: 'Falha ao buscar tipos de andamento.' }, { status: 500 });
  }
}

// POST: Criar um novo tipo de andamento
export async function POST(req: Request) {
  try {
    const { nome, descricao, cor } = await req.json() as TipoAndamento;
    if (!nome || !cor) {
      return NextResponse.json({ error: 'Os campos "nome" e "cor" são obrigatórios.' }, { status: 400 });
    }

    // VERIFICA SE JÁ EXISTE UM COM O MESMO NOME
    const existing = await db.collection('tiposAndamento').where('nome', '==', nome).limit(1).get();
    if (!existing.empty) {
        return NextResponse.json({ error: 'Já existe um tipo de andamento com este nome.' }, { status: 409 });
    }

    const newItem: Omit<TipoAndamento, 'id'> = {
      nome,
      descricao: descricao || '',
      cor,
    };
    const docRef = await db.collection('tiposAndamento').add(newItem);
    return NextResponse.json({ id: docRef.id, ...newItem }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar tipo de andamento:", error);
    return NextResponse.json({ error: 'Falha ao criar tipo de andamento.' }, { status: 500 });
  }
}

// PUT: Atualizar um tipo de andamento
export async function PUT(req: Request) {
    try {
        const { id, nome, descricao, cor } = await req.json() as TipoAndamento;
        if (!id || !nome || !cor) {
            return NextResponse.json({ error: 'Os campos "id", "nome" e "cor" são obrigatórios.' }, { status: 400 });
        }

        // VERIFICA SE OUTRO DOCUMENTO JÁ USA ESTE NOME
        const existing = await db.collection('tiposAndamento').where('nome', '==', nome).limit(1).get();
        if (!existing.empty && existing.docs[0].id !== id) {
            return NextResponse.json({ error: 'Já existe outro tipo de andamento com este nome.' }, { status: 409 });
        }

        await db.collection('tiposAndamento').doc(id).update({ nome, descricao: descricao || '', cor });
        return NextResponse.json({ id, nome, descricao, cor });
    } catch (error) {
        console.error("Erro ao atualizar tipo de andamento:", error);
        return NextResponse.json({ error: 'Falha ao atualizar tipo de andamento.' }, { status: 500 });
    }
}

// DELETE: Apagar um tipo de andamento
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ error: 'O campo "id" é obrigatório.' }, { status: 400 });
        }
        await db.collection('tiposAndamento').doc(id).delete();
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error("Erro ao apagar tipo de andamento:", error);
        return NextResponse.json({ error: 'Falha ao apagar tipo de andamento.' }, { status: 500 });
    }
}