// src/app/dashboard/DashboardLayout.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';

// --- Ícones ---
const LogoIconDashboard = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w.org/2000/svg" fill="currentColor"><path d="M50,10 A40,40 0 0,1 90,50 A40,40 0 0,1 50,90 A40,40 0 0,1 10,50 A40,40 0 0,1 50,10 Z M50,20 A30,30 0 0,0 20,50 A30,30 0 0,0 50,80 A30,30 0 0,0 80,50 A30,30 0 0,0 50,20 Z" /><path d="M50 35 L50 65 M35 50 L65 50" stroke="white" strokeWidth="5" /><circle cx="50" cy="50" r="5" fill="white" /></svg>
);
const LogoutIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
);

// --- Componente de Layout ---
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

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
      // O router.push('/') será acionado pelo onAuthStateChanged
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    }
  };

const menuItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Solicitações", href: "/solicitacao" },
    { name: "Gerenciar Rotas", href: "/rota" },
    { name: "Administração", href: "/administracao" } // <- Linha alterada
  ];

  const getActivePageTitle = () => {
    const activeItem = menuItems.find(item => pathname === item.href);
    return activeItem ? activeItem.name : "Página não encontrada";
  };
  
  if (loading || !user) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-100">Carregando Dashboard...</div>;
  }

  return (
    <div className="bg-[#F0F5E4] min-h-screen font-sans">
      <header className="bg-[#4B8A08] text-white shadow-lg w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <LogoIconDashboard className="h-8 w-8" />
            <h1 className="text-xl font-bold"><span className="font-light">TreeInspector</span></h1>
          </div>
          <div className="hidden md:flex flex-grow justify-center">
             <h2 className="text-xl font-semibold">{getActivePageTitle()}</h2>
          </div>
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex items-center">
              <div className="flex items-center space-x-2">
                {menuItems.map((item) => (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={`relative overflow-hidden px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                        pathname === item.href ? 'border border-white' : 'hover:bg-[#6fa139]/50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block">Bem vindo, {user.displayName || 'Usuário'}</span>
              <button onClick={handleSignOut} className="flex items-center space-x-2 border border-white/50 rounded-md py-1 px-3 hover:bg-white/10 transition-colors text-sm">
                <span>Sair</span>
                <LogoutIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
         <h2 className="text-2xl font-bold text-gray-800 mb-6 md:hidden">{getActivePageTitle()}</h2>
         {children} {/* A mágica acontece aqui! O conteúdo da página será inserido aqui. */}
      </main>
    </div>
  );
}