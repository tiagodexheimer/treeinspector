import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/firebaseAdmin';
import { TipoDemanda } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { nome, descricao } = req.body as TipoDemanda;
      if (!nome) {
        return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });
      }

      const newTipoDemanda: Omit<TipoDemanda, 'id'> = {
        nome,
        descricao: descricao || '',
      };

      const docRef = await db.collection('tiposDemanda').add(newTipoDemanda);
      res.status(201).json({ id: docRef.id, ...newTipoDemanda });

    } catch (error) {
      // FIX: Adicionado console.error para usar a variável 'error'.
      console.error("Erro ao criar tipo de demanda:", error);
      res.status(500).json({ error: 'Falha ao criar tipo de demanda.' });
    }
  } else if (req.method === 'GET') {
    try {
      const snapshot = await db.collection('tiposDemanda').get();
      const tiposDemanda: TipoDemanda[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<TipoDemanda, 'id'>),
      }));
      res.status(200).json(tiposDemanda);
    } catch (error) {
      // FIX: Adicionado console.error para usar a variável 'error'.
      console.error("Erro ao buscar tipos de demanda:", error);
      res.status(500).json({ error: 'Falha ao buscar tipos de demanda.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Método ${req.method} não permitido.`);
  }
}