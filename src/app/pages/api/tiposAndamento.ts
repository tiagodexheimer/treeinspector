import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/firebaseAdmin';
import { TipoAndamento } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { nome, descricao } = req.body as TipoAndamento;
      if (!nome) {
        return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });
      }
      const newTipoAndamento: Omit<TipoAndamento, 'id'> = {
        nome,
        descricao: descricao || '',
      };
      const docRef = await db.collection('tiposAndamento').add(newTipoAndamento);
      res.status(201).json({ id: docRef.id, ...newTipoAndamento });
    } catch (error) {
      // FIX: Adicionado console.error para usar a variável 'error'.
      console.error("Erro ao criar tipo de andamento:", error);
      res.status(500).json({ error: 'Falha ao criar tipo de andamento.' });
    }
  } else if (req.method === 'GET') {
    try {
      const snapshot = await db.collection('tiposAndamento').get();
      const tiposAndamento: TipoAndamento[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<TipoAndamento, 'id'>),
      }));
      res.status(200).json(tiposAndamento);
    } catch (error) {
      // FIX: Adicionado console.error para usar a variável 'error'.
      console.error("Erro ao buscar tipos de andamento:", error);
      res.status(500).json({ error: 'Falha ao buscar tipos de andamento.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Método ${req.method} não permitido.`);
  }
}