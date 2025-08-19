import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/firebaseAdmin';
import { Rota } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { nome_rota, solicitacoes_ids } = req.body;
      if (!nome_rota) {
        return res.status(400).json({ error: 'O campo "nome_rota" é obrigatório.' });
      }

      const novaRota: Omit<Rota, 'id'> = {
        nome_rota,
        solicitacoes: solicitacoes_ids || [],
      };

      const docRef = await db.collection('rotas').add(novaRota);
      res.status(201).json({ id: docRef.id, ...novaRota });

    } catch (error) {
      // FIX: Adicionado console.error para usar a variável 'error'.
      console.error("Erro ao criar rota:", error);
      res.status(500).json({ error: 'Falha ao criar rota.' });
    }
  } else if (req.method === 'GET') {
    try {
      const snapshot = await db.collection('rotas').get();
      const rotas: Rota[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Rota, 'id'>),
      }));
      res.status(200).json(rotas);
    } catch (error) {
      // FIX: Adicionado console.error para usar a variável 'error'.
      console.error("Erro ao buscar rotas:", error);
      res.status(500).json({ error: 'Falha ao buscar rotas.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Método ${req.method} não permitido.`);
  }
}
