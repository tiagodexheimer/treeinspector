"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase'; // Reutilize a mesma configuração
import { signOut, onAuthStateChanged, User } from 'firebase/auth';

// --- Ícones (duplicados para exemplo, idealmente importe de um arquivo comum) ---
const LogoIconDashboard = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M50,10 A40,40 0 0,1 90,50 A40,40 0 0,1 50,90 A40,40 0 0,1 10,50 A40,40 0 0,1 50,10 Z M50,20 A30,30 0 0,0 20,50 A30,30 0 0,0 50,80 A30,30 0 0,0 80,50 A30,30 0 0,0 50,20 Z" /><path d="M50 35 L50 65 M35 50 L65 50" stroke="white" strokeWidth="5" /><circle cx="50" cy="50" r="5" fill="white" /></svg>
);
const LogoutIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
);

// --- Componente da UI do Dashboard ---
const DashboardLayout = ({ user, onSignOut }: { user: User, onSignOut: () => void }) => {
  const [activePage, setActivePage] = useState("Dashboard");
  const menuItems = ["Dashboard", "Solicitações", "Gerenciar Rotas", "Relatórios", "Administração"];

  return (
    <div className="bg-[#F0F5E4] min-h-screen font-sans">
      <header className="bg-[#4B8A08] text-white shadow-lg w-full">
        {/* Container Principal do Cabeçalho */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <LogoIconDashboard className="h-8 w-8" />
            <h1 className="text-xl font-bold">
              <span className="font-light">TreeInspector</span>
            </h1>
          </div>
          
          {/* Menu de Navegação Integrado */}
          <nav className="hidden md:flex items-center justify-center flex-grow">
            <div className="flex items-center space-x-2">
              {menuItems.map((item) => (
                <a 
                  key={item} 
                  href="#" 
                  onClick={() => setActivePage(item)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                      activePage === item 
                      ? 'bg-green-700' 
                      : 'hover:bg-green-600/50'
                  }`}
                >
                  {item}
                </a>
              ))}
            </div>
          </nav>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:block">Bem vindo, {user.displayName || 'Usuário'}</span>
            <button onClick={onSignOut} className="flex items-center space-x-2 border border-white/50 rounded-md py-1 px-3 hover:bg-white/10 transition-colors text-sm">
              <span>Sair</span>
              <LogoutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo do Dashboard */}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
         <h2 className="text-2xl font-bold text-gray-800 mb-6">{activePage}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 rounded-lg shadow-md p-6 h-64 hover:shadow-xl transition-shadow"><h3 className="font-semibold text-gray-700">Métrica 1</h3></div>
          <div className="bg-white/80 rounded-lg shadow-md p-6 h-64 hover:shadow-xl transition-shadow"><h3 className="font-semibold text-gray-700">Métrica 2</h3></div>
          <div className="bg-white/80 rounded-lg shadow-md p-6 h-64 hover:shadow-xl transition-shadow"><h3 className="font-semibold text-gray-700">Métrica 3</h3></div>
          <div className="bg-white/80 rounded-lg shadow-md p-6 h-64 hover:shadow-xl transition-shadow"><h3 className="font-semibold text-gray-700">Métrica 4</h3></div>
        </div>
      </main>
    </div>
  );
};

// --- Componente Principal da Página de Dashboard ---
export default function DashboardPageController() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                // Se não há usuário logado, redireciona para a página inicial
                router.push('/');
            } else {
                setUser(currentUser);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            // O listener onAuthStateChanged acima cuidará do redirecionamento para '/'
        } catch (error) {
            console.error("Erro ao fazer logout", error);
        }
    };

    if (loading || !user) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-100">Carregando Dashboard...</div>;
    }

    return <DashboardLayout user={user} onSignOut={handleSignOut} />;
}
