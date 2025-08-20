// src/app/dashboard/page.tsx
"use client";

import AdministracaoPage from '../administracao/page';
import SolicitacoesPage from '../solicitacao/page';
import DashboardHomePage from './DashboardHomePage';
import React, { useState } from 'react';

// Este componente agora apenas decide o que mostrar na PÁGINA /dashboard
// A navegação real para /rotas é tratada pelos Links no Layout.
export default function DashboardPage() {
    const [activePage, setActivePage] = useState('Dashboard');

    // Você pode manter esta lógica se quiser ter "sub-páginas" dentro de /dashboard
    // Ou simplesmente renderizar o DashboardHomePage diretamente.
    const renderContent = () => {
        switch (activePage) {
            case 'Solicitações':
                return <SolicitacoesPage />;
            case 'Administração':
                return <AdministracaoPage />;
            case 'Dashboard':
            default:
                return <DashboardHomePage setActivePage={setActivePage} />;
        }
    };
    
    // A chamada para <DashboardLayout> foi movida para o arquivo de layout.
    // Agora esta página apenas retorna o seu conteúdo específico.
    return (
        <div>
            {/* A lógica para renderizar o conteúdo pode ser mantida ou removida
                dependendo se você quer abas dentro da página /dashboard */}
            {renderContent()}
        </div>
    );
}