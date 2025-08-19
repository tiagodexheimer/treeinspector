import { NextResponse } from 'next/server';
import db from '@/lib/firebaseAdmin';
import { TipoDemanda } from '@/types';

// GET: Buscar todos os tipos de demanda
export async function GET() {
  try {
    const snapshot = await db.collection('tiposDemanda').get();
    const items: TipoDemanda[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<TipoDemanda, 'id'>),
    }));
    return NextResponse.json(items);
  } catch (error) {
    console.error("Erro ao buscar tipos de demanda:", error);
    return NextResponse.json({ error: 'Falha ao buscar tipos de demanda.' }, { status: 500 });
  }
}

// POST: Criar um novo tipo de demanda
export async function POST(req: Request) {
  try {
    const { nome, descricao } = await req.json() as TipoDemanda;
    if (!nome) {
      return NextResponse.json({ error: 'O campo "nome" é obrigatório.' }, { status: 400 });
    }

    // VERIFICA SE JÁ EXISTE UM COM O MESMO NOME
    const existing = await db.collection('tiposDemanda').where('nome', '==', nome).limit(1).get();
    if (!existing.empty) {
        return NextResponse.json({ error: 'Já existe um tipo de demanda com este nome.' }, { status: 409 }); // 409 Conflict
    }

    const newItem: Omit<TipoDemanda, 'id'> = {
      nome,
      descricao: descricao || '',
    };
    const docRef = await db.collection('tiposDemanda').add(newItem);
    return NextResponse.json({ id: docRef.id, ...newItem }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar tipo de demanda:", error);
    return NextResponse.json({ error: 'Falha ao criar tipo de demanda.' }, { status: 500 });
  }
}

// PUT: Atualizar um tipo de demanda
export async function PUT(req: Request) {
    try {
        const { id, nome, descricao } = await req.json() as TipoDemanda;
        if (!id || !nome) {
            return NextResponse.json({ error: 'Os campos "id" e "nome" são obrigatórios.' }, { status: 400 });
        }

        // VERIFICA SE OUTRO DOCUMENTO JÁ USA ESTE NOME
        const existing = await db.collection('tiposDemanda').where('nome', '==', nome).limit(1).get();
        if (!existing.empty && existing.docs[0].id !== id) {
            return NextResponse.json({ error: 'Já existe outro tipo de demanda com este nome.' }, { status: 409 });
        }

        await db.collection('tiposDemanda').doc(id).update({ nome, descricao: descricao || '' });
        return NextResponse.json({ id, nome, descricao });
    } catch (error) {
        console.error("Erro ao atualizar tipo de demanda:", error);
        return NextResponse.json({ error: 'Falha ao atualizar tipo de demanda.' }, { status: 500 });
    }
}

// DELETE: Apagar um tipo de demanda
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ error: 'O campo "id" é obrigatório.' }, { status: 400 });
        }
        await db.collection('tiposDemanda').doc(id).delete();
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error("Erro ao apagar tipo de demanda:", error);
        return NextResponse.json({ error: 'Falha ao apagar tipo de demanda.' }, { status: 500 });
    }
}