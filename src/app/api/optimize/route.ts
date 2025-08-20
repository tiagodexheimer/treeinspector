// src/app/api/optimize/route.ts

import { NextResponse } from 'next/server';
import db from '@/lib/firebaseAdmin';
import { Rota, Solicitacao } from '@/types';

async function geocodeAddress(cep: string, number: string, apiKey: string): Promise<string | null> {
    const address = `${cep}, ${number}, Brazil`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 'OK' && data.results[0]) {
            const loc = data.results[0].geometry.location;
            return `${loc.lat},${loc.lng}`;
        }
        return null;
    } catch (error) {
        console.error("Erro na geocodificação:", error);
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const { rotaId, startAddress, endAddress } = await req.json();
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!rotaId || !apiKey) {
            return NextResponse.json({ error: 'Dados insuficientes ou chave de API em falta.' }, { status: 400 });
        }

        const rotaRef = db.collection('rotas').doc(rotaId);
        const rotaDoc = await rotaRef.get();
        if (!rotaDoc.exists) {
            return NextResponse.json({ error: 'Rota não encontrada.' }, { status: 404 });
        }

        const rotaData = rotaDoc.data() as Rota;
        const solicitacoesIds = rotaData.solicitacoes;
        if (!solicitacoesIds || solicitacoesIds.length === 0) {
            return NextResponse.json({ error: 'A rota não tem solicitações para otimizar.' }, { status: 400 });
        }

        const solicitacoesPromises = solicitacoesIds.map(id => db.collection('solicitacoes').doc(id).get());
        const solicitacoesSnapshots = await Promise.all(solicitacoesPromises);
        const solicitacoesDaRota = solicitacoesSnapshots.map(doc => ({ id: doc.id, ...doc.data() } as Solicitacao));

        let origin: string;
        let destination: string;
        let waypoints: Solicitacao[];
        let finalFixedPoint: Solicitacao | null = null;

        const startCoords = startAddress ? await geocodeAddress(startAddress.cep, startAddress.number, apiKey) : null;
        const endCoords = endAddress ? await geocodeAddress(endAddress.cep, endAddress.number, apiKey) : null;

        if (startCoords && endCoords) {
            origin = startCoords;
            destination = endCoords;
            waypoints = solicitacoesDaRota;
        } else if (startCoords) {
            origin = startCoords;
            destination = `${solicitacoesDaRota[solicitacoesDaRota.length - 1].latitude},${solicitacoesDaRota[solicitacoesDaRota.length - 1].longitude}`;
            waypoints = solicitacoesDaRota.slice(0, -1);
            finalFixedPoint = solicitacoesDaRota[solicitacoesDaRota.length - 1];
        } else {
            if (solicitacoesDaRota.length < 2) return NextResponse.json({ error: 'Otimização padrão requer pelo menos 2 pontos.' }, { status: 400 });
            origin = `${solicitacoesDaRota[0].latitude},${solicitacoesDaRota[0].longitude}`;
            destination = origin;
            waypoints = solicitacoesDaRota.slice(1);
        }

        const waypointsString = waypoints.map(s => `${s.latitude},${s.longitude}`).join('|');
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=optimize:true|${waypointsString}&key=${apiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();
        if (data.status !== 'OK' || !data.routes[0]) {
            return NextResponse.json({ error: 'Falha ao otimizar com a API do Google.', details: data.error_message || data.status }, { status: 500 });
        }

        const optimizedOrder = data.routes[0].waypoint_order;
        const orderedWaypoints: Solicitacao[] = optimizedOrder.map((index: number) => waypoints[index]);

        let finalOptimizedIds: string[];
        
        // --- CORREÇÃO APLICADA AQUI ---
        // Adicionando o tipo (s: Solicitacao) para o parâmetro do map
        if (startCoords && endCoords) {
            finalOptimizedIds = orderedWaypoints.map((s: Solicitacao) => s.id!);
        } else if (startCoords) {
            finalOptimizedIds = [...orderedWaypoints.map((s: Solicitacao) => s.id!), finalFixedPoint!.id!];
        } else {
            finalOptimizedIds = [solicitacoesDaRota[0].id!, ...orderedWaypoints.map((s: Solicitacao) => s.id!)];
        }
        
        await rotaRef.update({ solicitacoes: finalOptimizedIds });
        
        const finalWaypointsCoords = finalOptimizedIds
            .map(id => solicitacoesDaRota.find(s => s.id === id))
            .filter(Boolean)
            .map(s => `${s?.latitude},${s?.longitude}`);

        return NextResponse.json({
            message: 'Rota otimizada com sucesso!',
            mapData: {
                origin: origin,
                destination: destination,
                waypoints: finalWaypointsCoords,
            }
        });

    } catch (error) {
        console.error("Erro interno na otimização:", error);
        return NextResponse.json({ error: 'Falha interna do servidor.' }, { status: 500 });
    }
}