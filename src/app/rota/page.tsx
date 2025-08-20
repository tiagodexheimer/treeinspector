// src/app/rotas/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Rota, Solicitacao } from '../../types';

// --- Ícones ---
const EditIcon = ({ className }: { className: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>;
const DeleteIcon = ({ className }: { className: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const MapIcon = ({ className }: { className: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10h6"></path></svg>;
const OptimizeIcon = ({ className }: { className: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;


type RotaPopulada = Omit<Rota, 'solicitacoes'> & {
    solicitacoes: Solicitacao[];
}

export default function RotasPage() {
    const [rotas, setRotas] = useState<Rota[]>([]);
    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [optimizing, setOptimizing] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rotasRes, solicitacoesRes] = await Promise.all([
                fetch('/api/rotas'),
                fetch('/api/solicitacoes')
            ]);
            setRotas(await rotasRes.json());
            setSolicitacoes(await solicitacoesRes.json());
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    const handleEdit = (rota: RotaPopulada) => {
        const newName = prompt("Editar nome da rota:", rota.nome_rota);
        if (newName && newName.trim() !== "") {
            const solicitacoesIds = rota.solicitacoes.map(s => s.id!);
            const updatedRota = { ...rota, nome_rota: newName.trim(), solicitacoes: solicitacoesIds };
            
            fetch('/api/rotas', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedRota)
            }).then(res => {
                if (res.ok) {
                    fetchData();
                }
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Tem certeza que deseja apagar esta rota?")) {
            await fetch('/api/rotas', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            fetchData();
        }
    };
    
    const handleOptimize = async (rotaId: string) => {
        setOptimizing(rotaId);
        try {
            const response = await fetch('/api/optimize', { // Corrigido para a rota de otimização
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rotaId })
            });

            const result = await response.json();

            if (response.ok) {
                alert("Rota otimizada com sucesso!");
                fetchData(); 
            } else {
                throw new Error(result.error || 'Falha ao otimizar a rota.');
            }
        } catch (error) {
            console.error("Erro ao otimizar rota:", error);
            alert((error as Error).message);
        } finally {
            setOptimizing(null);
        }
    };

    // CORREÇÃO NA GERAÇÃO DA URL DO GOOGLE MAPS
    const generateMapsUrl = (rota: { solicitacoes: Solicitacao[] }) => {
        if (rota.solicitacoes.length < 1) return "#";

        const base = "https://www.google.com/maps/dir/?api=1";
        const origin = `&origin=${rota.solicitacoes[0].latitude},${rota.solicitacoes[0].longitude}`;
        const destination = `&destination=${rota.solicitacoes[rota.solicitacoes.length - 1].latitude},${rota.solicitacoes[rota.solicitacoes.length - 1].longitude}`;
        
        const waypoints = rota.solicitacoes
            .slice(1, -1)
            .map(s => `${s.latitude},${s.longitude}`)
            .join('|');
        
        return `${base}${origin}${destination}&waypoints=${waypoints}`;
    };

    const solicitacoesPorRota: RotaPopulada[] = useMemo(() => {
        if (!Array.isArray(rotas) || !Array.isArray(solicitacoes)) return [];
        return rotas.map(rota => ({
            ...rota,
            solicitacoes: rota.solicitacoes.map(id => solicitacoes.find(s => s.id === id)).filter(Boolean) as Solicitacao[]
        }));
    }, [rotas, solicitacoes]);

    if (loading) return <div>Carregando rotas...</div>;

    return (
        <div className="space-y-6">
            {solicitacoesPorRota.map(rota => (
                <div key={rota.id} className="bg-white/80 rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">{rota.nome_rota}</h3>
                        <div className="flex items-center gap-2">
                             <button onClick={() => handleOptimize(rota.id!)} disabled={optimizing === rota.id || rota.solicitacoes.length < 2} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md flex items-center disabled:bg-blue-300 disabled:cursor-not-allowed">
                                <OptimizeIcon className="w-5 h-5 mr-2" />
                                {optimizing === rota.id ? 'Otimizando...' : 'Otimizar Trajeto'}
                            </button>
                             <a 
                                href={generateMapsUrl(rota)} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md flex items-center ${rota.solicitacoes.length < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={(e) => rota.solicitacoes.length < 2 && e.preventDefault()}
                             >
                                <MapIcon className="w-5 h-5 mr-2" />
                                Ver no Mapa
                            </a>
                            <button onClick={() => handleEdit(rota)} className="p-2 text-gray-600 hover:text-blue-600"><EditIcon className="w-5 h-5" /></button>
                            <button onClick={() => handleDelete(rota.id!)} className="p-2 text-gray-600 hover:text-red-600"><DeleteIcon className="w-5 h-5" /></button>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-semibold mb-2 text-gray-700">Pontos de Parada ({rota.solicitacoes.length}):</h4>
                        {rota.solicitacoes.length > 0 ? (
                            <ol className="list-decimal list-inside space-y-2"> 
                                {rota.solicitacoes.map((s) => (
                                    <li key={s.id} className="text-gray-600">
                                        {s.logradouro}, {s.numero} - {s.bairro}
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className="text-gray-500">Nenhuma solicitação nesta rota.</p>
                        )}
                    </div>
                </div>
            ))}
             {solicitacoesPorRota.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-gray-500">Nenhuma rota encontrada.</p>
                </div>
            )}
        </div>
    );
}