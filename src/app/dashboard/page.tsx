"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebase';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import AdministracaoPage from './AdministracaoPage'; // Importe a nova página
import SolicitacoesPage from './SolicitacoesPage';
// --- Ícones ---
const LogoIconDashboard = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M50,10 A40,40 0 0,1 90,50 A40,40 0 0,1 50,90 A40,40 0 0,1 10,50 A40,40 0 0,1 50,10 Z M50,20 A30,30 0 0,0 20,50 A30,30 0 0,0 50,80 A30,30 0 0,0 80,50 A30,30 0 0,0 50,20 Z" /><path d="M50 35 L50 65 M35 50 L65 50" stroke="white" strokeWidth="5" /><circle cx="50" cy="50" r="5" fill="white" /></svg>
);
const LogoutIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
);

// --- Conteúdo Padrão do Dashboard ---
const DashboardContent = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 rounded-lg shadow-md p-6 h-64 hover:shadow-xl transition-shadow"><h3 className="font-semibold text-gray-700">Métrica 1</h3></div>
        <div className="bg-white/80 rounded-lg shadow-md p-6 h-64 hover:shadow-xl transition-shadow"><h3 className="font-semibold text-gray-700">Métrica 2</h3></div>
        <div className="bg-white/80 rounded-lg shadow-md p-6 h-64 hover:shadow-xl transition-shadow"><h3 className="font-semibold text-gray-700">Métrica 3</h3></div>
        <div className="bg-white/80 rounded-lg shadow-md p-6 h-64 hover:shadow-xl transition-shadow"><h3 className="font-semibold text-gray-700">Métrica 4</h3></div>
    </div>
);

// --- Layout Principal ---
const DashboardLayout = ({ user, onSignOut }: { user: User, onSignOut: () => void }) => {
  const [activePage, setActivePage] = useState("Dashboard");
  const menuItems = ["Dashboard", "Solicitações", "Gerenciar Rotas", "Relatórios", "Administração"];

  const createRipple = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    const link = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(link.clientWidth, link.clientHeight);
    const radius = diameter / 2;

    const rect = link.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    const ripple = link.getElementsByClassName("ripple")[0];
    if (ripple) {
      ripple.remove();
    }

    link.appendChild(circle);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'Administração':
        return <AdministracaoPage />;
      case 'Solicitações': // Adicione este caso
        return <SolicitacoesPage />;
      case 'Dashboard':
        return <DashboardContent />;
      // Adicione outros casos para outras páginas aqui
      default:
        return <div className="bg-white/80 p-6 rounded-lg shadow-md">Conteúdo para <strong>{activePage}</strong> em desenvolvimento.</div>;
    }
};

  return (
    <div className="bg-[#F0F5E4] min-h-screen font-sans">
      <header className="bg-[#4B8A08] text-white shadow-lg w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <LogoIconDashboard className="h-8 w-8" />
            <h1 className="text-xl font-bold"><span className="font-light">TreeInspector</span></h1>
          </div>
          <div className="hidden md:flex flex-grow justify-center">
             <h2 className="text-xl font-semibold">{activePage}</h2>
          </div>
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center">
              <div className="flex items-center space-x-2">
                {menuItems.map((item) => (
                  <a 
                    key={item} 
                    href="#" 
                    onClick={(e) => { setActivePage(item); createRipple(e); }}
                    className={`relative overflow-hidden px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                        activePage === item ? 'border border-white' : 'hover:bg-[#6fa139]/50'
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
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
         <h2 className="text-2xl font-bold text-gray-800 mb-6 md:hidden">{activePage}</h2>
         {renderContent()}
      </main>
    </div>
  );
};

// --- Controlador Principal da Página ---
export default function DashboardPageController() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
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
        } catch (error) {
            console.error("Erro ao fazer logout", error);
        }
    };

    if (loading || !user) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-100">Carregando Dashboard...</div>;
    }

    return <DashboardLayout user={user} onSignOut={handleSignOut} />;
}