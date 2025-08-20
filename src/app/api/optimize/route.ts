// src/app/api/rotas/optimize/route.ts

import { NextResponse } from 'next/server';
import db from '@/lib/firebaseAdmin';
import { Rota, Solicitacao } from '@/types';

export async function POST(req: Request) {
  try {
    const { rotaId } = await req.json();
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!rotaId) {
      return NextResponse.json({ error: 'O ID da rota é obrigatório.' }, { status: 400 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: 'A chave da API do Google Maps não está configurada.' }, { status: 500 });
    }

    // 1. Buscar a rota e suas solicitações
    const rotaRef = db.collection('rotas').doc(rotaId);
    const rotaDoc = await rotaRef.get();

    if (!rotaDoc.exists) {
      return NextResponse.json({ error: 'Rota não encontrada.' }, { status: 404 });
    }

    const rotaData = rotaDoc.data() as Rota;
    const solicitacoesIds = rotaData.solicitacoes;

    if (!solicitacoesIds || solicitacoesIds.length < 2) {
      return NextResponse.json({ error: 'A rota precisa ter pelo menos 2 solicitações para ser otimizada.' }, { status: 400 });
    }
    
    // 2. Buscar os dados completos das solicitações para obter as coordenadas
    const solicitacoesPromises = solicitacoesIds.map(id => db.collection('solicitacoes').doc(id).get());
    const solicitacoesSnapshots = await Promise.all(solicitacoesPromises);
    const solicitacoesDaRota = solicitacoesSnapshots.map(doc => ({ id: doc.id, ...doc.data() } as Solicitacao));

    // 3. Montar a URL para a API do Google Maps Directions
    const origin = `${solicitacoesDaRota[0].latitude},${solicitacoesDaRota[0].longitude}`;
    const destination = `${solicitacoesDaRota[solicitacoesDaRota.length - 1].latitude},${solicitacoesDaRota[solicitacoesDaRota.length - 1].longitude}`;
    const waypoints = solicitacoesDaRota
        .slice(1, -1)
        .map(s => `${s.latitude},${s.longitude}`)
        .join('|');
    
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=optimize:true|${waypoints}&key=${apiKey}`;

    // 4. Chamar a API externa
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error("Google Maps API Error:", data.error_message || data.status);
      return NextResponse.json({ error: 'Falha ao otimizar a rota com a API do Google.', details: data.error_message || data.status }, { status: 500 });
    }

    // 5. Reordenar os IDs com base na resposta
    const optimizedOrder = data.routes[0].waypoint_order;
    const originalWaypoints = solicitacoesDaRota.slice(1, -1);
    
    const finalOptimizedIds = [
        solicitacoesDaRota[0].id!,
        ...optimizedOrder.map((index: number) => originalWaypoints[index].id!),
        solicitacoesDaRota[solicitacoesDaRota.length - 1].id!
    ];

    // 6. Atualizar o documento da rota no Firestore
    await rotaRef.update({ solicitacoes: finalOptimizedIds });

    return NextResponse.json({ message: 'Rota otimizada com sucesso.', optimizedIds: finalOptimizedIds });

  } catch (error) {
    console.error("Erro interno ao otimizar rota:", error);
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
    return NextResponse.json({ error: 'Falha interna do servidor.', details: errorMessage }, { status: 500 });
  }
}