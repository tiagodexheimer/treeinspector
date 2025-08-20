"use client";

import React, { useState, useEffect } from 'react';
import { Solicitacao, Rota } from '../../types';

// --- Ícones ---
const ArrowRightIcon = ({ className }: { className: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>;
const ClipboardListIcon = ({ className }: { className: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>;
const MapIcon = ({ className }: { className: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 10h6"></path></svg>;

interface DashboardHomePageProps {
    setActivePage: (page: string) => void;
}

export default function DashboardHomePage({ setActivePage }: DashboardHomePageProps) {
    const [totalSolicitacoes, setTotalSolicitacoes] = useState(0);
    const [totalRotas, setTotalRotas] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [solicitacoesRes, rotasRes] = await Promise.all([
                    fetch('/api/solicitacoes'),
                    fetch('/api/rotas')
                ]);

                const solicitacoesData: Solicitacao[] = await solicitacoesRes.json();
                const rotasData: Rota[] = await rotasRes.json();
                
                setTotalSolicitacoes(solicitacoesData.length);
                setTotalRotas(rotasData.length);
            } catch (error) {
                console.error("Erro ao carregar dados do dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const StatCard = ({ title, value, icon, onClick }: { title: string; value: number; icon: React.ReactNode; onClick: () => void; }) => (
        <div 
            onClick={onClick}
            className="bg-white/80 rounded-lg shadow-md p-6 flex flex-col justify-between hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
        >
            <div>
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-700">{title}</h3>
                    {icon}
                </div>
                {loading ? (
                     <div className="h-12 w-16 bg-gray-200 rounded-md animate-pulse mt-2"></div>
                ) : (
                    <p className="text-4xl font-bold text-gray-800 mt-2">{value}</p>
                )}
            </div>
            <div className="flex items-center text-sm text-blue-600 mt-4">
                <span>Ver detalhes</span>
                <ArrowRightIcon className="w-4 h-4 ml-1" />
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                title="Total de Solicitações" 
                value={totalSolicitacoes} 
                icon={<ClipboardListIcon className="w-8 h-8 text-gray-400" />}
                onClick={() => setActivePage('Solicitações')}
            />
            <StatCard 
                title="Total de Rotas" 
                value={totalRotas} 
                icon={<MapIcon className="w-8 h-8 text-gray-400" />}
                onClick={() => setActivePage('Gerenciar Rotas')}
            />
            {/* Você pode adicionar mais cards aqui */}
        </div>
    );
}