import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/lib/firebaseAdmin';
import { Solicitacao } from '@/types';
import admin from 'firebase-admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { latitude, longitude, ...solicitacaoData } = req.body;

      if (!solicitacaoData.tipo_demanda_id || !solicitacaoData.tipo_andamento_id || !latitude || !longitude) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
      }

      const localizacao = new admin.firestore.GeoPoint(Number(latitude), Number(longitude));

      const novaSolicitacao: Omit<Solicitacao, 'id'> = {
        ...solicitacaoData,
        localizacao,
        data_criacao: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
      };

      const docRef = await db.collection('solicitacoes').add(novaSolicitacao);
      res.status(201).json({ id: docRef.id, ...novaSolicitacao });

    } catch (error) {
      console.error("Erro ao criar solicitação:", error);
      res.status(500).json({ error: 'Falha ao criar solicitação.' });
    }
  } else if (req.method === 'GET') {
    try {
      const snapshot = await db.collection('solicitacoes').get();
      const solicitacoes = snapshot.docs.map(doc => {
        const data = doc.data() as Solicitacao;
        return {
          id: doc.id,
          ...data,
          latitude: data.localizacao.latitude,
          longitude: data.localizacao.longitude,
        };
      });
      res.status(200).json(solicitacoes);
    } catch (error) {
      // FIX: Adicionado console.error para usar a variável 'error'.
      console.error("Erro ao buscar solicitações:", error);
      res.status(500).json({ error: 'Falha ao buscar solicitações.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Método ${req.method} não permitido.`);
  }
}