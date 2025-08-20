// src/app/rotas/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Rota, Solicitacao } from '../../types';

// --- Ícones ---
const EditIcon = ({ className }: { className: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>;
const DeleteIcon = ({ className }: { className: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const OptimizeIcon = ({ className }: { className: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

type RotaPopulada = Omit<Rota, 'solicitacoes'> & {
    solicitacoes: Solicitacao[];
}

export default function RotasPage() {
    const [rotas, setRotas] = useState<Rota[]>([]);
    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [optimizing, setOptimizing] = useState<string | null>(null);
    const [mapUrl, setMapUrl] = useState<string | null>(null);
    const [activeRotaId, setActiveRotaId] = useState<string | null>(null);
    const [startCep, setStartCep] = useState('');
    const [startNumero, setStartNumero] = useState('');
    const [startAddressInfo, setStartAddressInfo] = useState('');
    const [endCep, setEndCep] = useState('');
    const [endNumero, setEndNumero] = useState('');
    const [endAddressInfo, setEndAddressInfo] = useState('');
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    const solicitacoesPorRota: RotaPopulada[] = useMemo(() => {
        if (!Array.isArray(rotas) || !Array.isArray(solicitacoes)) return [];
        return rotas.map(rota => ({
            ...rota,
            solicitacoes: rota.solicitacoes.map(id => solicitacoes.find(s => s.id === id)).filter(Boolean) as Solicitacao[]
        }));
    }, [rotas, solicitacoes]);

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

    const getAddressFromCep = async (cep: string, type: 'start' | 'end') => {
        const cepOnlyNumbers = cep.replace(/\D/g, '');
        if (cepOnlyNumbers.length !== 8) {
            if (type === 'start') {
                setStartAddressInfo('');
            } else {
                setEndAddressInfo('');
            }
            return;
        }
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepOnlyNumbers}/json/`);
            const data = await response.json();
            if (!data.erro) {
                const address = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
                if (type === 'start') {
                    setStartAddressInfo(address);
                } else {
                    setEndAddressInfo(address);
                }
            } else {
                if (type === 'start') {
                    setStartAddressInfo('CEP não encontrado.');
                } else {
                    setEndAddressInfo('CEP não encontrado.');
                }
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            if (type === 'start') {
                setStartAddressInfo('Erro ao buscar CEP.');
            } else {
                setEndAddressInfo('Erro ao buscar CEP.');
            }
        }
    };

    const handleEdit = (e: React.MouseEvent, rota: RotaPopulada) => {
        e.stopPropagation();
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

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm("Tem certeza que deseja apagar esta rota?")) {
            await fetch('/api/rotas', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (activeRotaId === id) {
                setMapUrl(null);
                setActiveRotaId(null);
            }
            fetchData();
        }
    };
    
    const generateEmbedUrl = (origin: string, destination: string, waypoints: string[]) => {
        if (!apiKey) {
            return null;
        }
        const base = "https://www.google.com/maps/embed/v1/directions";
        const waypointsString = waypoints.join('|');
        return `${base}?key=${apiKey}&origin=${origin}&destination=${destination}&waypoints=${waypointsString}`;
    };

    const handleOptimize = async (e: React.MouseEvent, rotaId: string) => {
        e.stopPropagation();
        setOptimizing(rotaId);
        
        const optimizationData = {
            rotaId,
            startAddress: (startCep && startNumero) ? { cep: startCep, number: startNumero } : null,
            endAddress: (endCep && endNumero) ? { cep: endCep, number: endNumero } : null,
        };
        
        try {
            const response = await fetch('/api/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(optimizationData)
            });

            const result = await response.json();
            if (response.ok) {
                alert("Rota otimizada com sucesso!");
                await fetchData();
                if (result.mapData) {
                    const { origin, destination, waypoints } = result.mapData;
                    const filteredWaypoints = waypoints.filter((wp: string) => wp !== origin && wp !== destination);
                    setMapUrl(generateEmbedUrl(origin, destination, filteredWaypoints));
                    setActiveRotaId(rotaId);
                }
            } else {
                throw new Error(result.details || result.error || 'Falha ao otimizar a rota.');
            }
        } catch (error) {
            console.error("Erro ao otimizar rota:", error);
            alert((error as Error).message);
        } finally {
            setOptimizing(null);
        }
    };

    const handleCardClick = (rota: RotaPopulada) => {
        setActiveRotaId(rota.id!);
        if (rota.solicitacoes.length >= 2) {
            const origin = `${rota.solicitacoes[0].latitude},${rota.solicitacoes[0].longitude}`;
            const destination = `${rota.solicitacoes[rota.solicitacoes.length - 1].latitude},${rota.solicitacoes[rota.solicitacoes.length - 1].longitude}`;
            const waypoints = rota.solicitacoes.slice(1, -1).map(s => `${s.latitude},${s.longitude}`);
            setMapUrl(generateEmbedUrl(origin, destination, waypoints));
        } else {
            setMapUrl(null);
        }
    };
    
    if (loading) return <div>Carregando rotas...</div>;

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-10rem)]">
            <div className="w-full md:w-1/3 lg:w-2/5 overflow-y-auto pr-2 space-y-4">
                <div className="bg-white/80 rounded-lg shadow-md p-4 sticky top-0 z-10">
                    <h3 className="font-semibold text-gray-800 mb-3">Otimização Personalizada (Opcional)</h3>
                    <div className="space-y-3 text-sm">
                        <div>
                            <label className="block text-gray-600 font-medium">Início da Rota</label>
                            <div className="flex gap-2">
                                <input type="text" placeholder="CEP de Partida" value={startCep} onChange={(e) => { setStartCep(e.target.value); getAddressFromCep(e.target.value, 'start'); }} className="border border-gray-300 p-2 rounded-md w-2/3 text-gray-800"/>
                                <input type="text" placeholder="Nº" value={startNumero} onChange={(e) => setStartNumero(e.target.value)} className="border border-gray-300 p-2 rounded-md w-1/3 text-gray-800"/>
                            </div>
                            {startAddressInfo && <p className="text-xs text-gray-600 mt-1 bg-gray-100 p-1 rounded">{startAddressInfo}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-600 font-medium">Fim da Rota</label>
                            <div className="flex gap-2">
                                <input type="text" placeholder="CEP de Chegada" value={endCep} onChange={(e) => { setEndCep(e.target.value); getAddressFromCep(e.target.value, 'end'); }} className="border border-gray-300 p-2 rounded-md w-2/3 text-gray-800"/>
                                <input type="text" placeholder="Nº" value={endNumero} onChange={(e) => setEndNumero(e.target.value)} className="border border-gray-300 p-2 rounded-md w-1/3 text-gray-800"/>
                            </div>
                            {endAddressInfo && <p className="text-xs text-gray-600 mt-1 bg-gray-100 p-1 rounded">{endAddressInfo}</p>}
                        </div>
                         <p className="text-xs text-gray-500 pt-2">Se preencher apenas o Início, a rota terminará no último ponto de serviço. Se deixar em branco, a rota será de ida e volta a partir do primeiro ponto.</p>
                    </div>
                </div>

                {solicitacoesPorRota.map(rota => (
                    <div 
                        key={rota.id} 
                        onClick={() => handleCardClick(rota)}
                        className={`bg-white/80 rounded-lg shadow-md p-4 cursor-pointer transition-all duration-200 ${activeRotaId === rota.id ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:shadow-lg'}`}
                    >
                        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">{rota.nome_rota}</h3>
                            <div className="flex items-center gap-1">
                                <button onClick={(e) => handleOptimize(e, rota.id!)} title="Otimizar Rota" disabled={optimizing === rota.id || rota.solicitacoes.length === 0} className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md disabled:bg-blue-300 disabled:cursor-not-allowed">
                                    <OptimizeIcon className="w-5 h-5" />
                                </button>
                                <button onClick={(e) => handleEdit(e, rota)} title="Editar Rota" className="p-2 text-gray-600 hover:text-blue-600"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={(e) => handleDelete(e, rota.id!)} title="Deletar Rota" className="p-2 text-gray-600 hover:text-red-600"><DeleteIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                            <h4 className="font-semibold mb-2 text-gray-700">Pontos de Parada ({rota.solicitacoes.length}):</h4>
                            {rota.solicitacoes.length > 0 ? (
                                <ol className="list-decimal list-inside space-y-2 text-sm">
                                    {rota.solicitacoes.map((s) => (<li key={s.id} className="text-gray-600">{s.logradouro}, {s.numero}</li>))}
                                </ol>
                            ) : (<p className="text-sm text-gray-500">Nenhuma solicitação nesta rota.</p>)}
                        </div>
                    </div>
                ))}
                {!loading && solicitacoesPorRota.length === 0 && (
                    <div className="text-center py-10 bg-white/80 rounded-lg shadow-md"><p className="text-gray-500">Nenhuma rota encontrada.</p></div>
                )}
            </div>
            
            <div className="w-full md:w-2/3 lg:w-3/5 h-full">
                <div className="bg-white/80 rounded-lg shadow-md h-full w-full p-2">
                    {mapUrl ? (
                        <iframe key={mapUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src={mapUrl}></iframe>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gray-100 rounded-md"><p className="text-gray-500 text-center px-4">Clique num card de rota para visualizar o trajeto aqui.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
}