"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Importe de 'next/navigation'
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';

// --- Ícones SVG ---
const GoogleIcon = ({ className }: { className: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" /><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" /><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" /><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.901,35.636,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z" /></svg>
);
const LogoIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M50,10 A40,40 0 0,1 90,50 A40,40 0 0,1 50,90 A40,40 0 0,1 10,50 A40,40 0 0,1 50,10 Z M50,20 A30,30 0 0,0 20,50 A30,30 0 0,0 50,80 A30,30 0 0,0 80,50 A30,30 0 0,0 50,20 Z" /><path d="M50 35 L50 65 M35 50 L65 50" stroke="white" strokeWidth="5" /><circle cx="50" cy="50" r="5" fill="white" /></svg>
);

// --- Componente da UI da Página de Login ---
const LoginPageUI = ({ onGoogleSignIn }: { onGoogleSignIn: () => void }) => {
  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <header className="bg-[#4B8A08] text-white shadow-md w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <LogoIcon className="h-8 w-8 text-white mr-2" />
              <span className="text-xl font-bold">TreeInspector</span>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-2">
          <div className="bg-[#8A6D5A] text-white p-8 md:p-12 lg:p-16 flex flex-col items-center text-center justify-center">
            <div className="max-w-md">
                <div className="bg-white p-4 inline-block rounded-lg shadow-lg mb-6">
                    <div className="flex items-center text-[#4B8A08]">
                        <LogoIcon className="h-12 w-12 mr-3"/>
                        <div>
                            <h1 className="text-2xl font-bold tracking-wider">TREE</h1>
                            <p className="text-sm font-semibold">INSPECTOR</p>
                        </div>
                    </div>
                </div>
              <h2 className="text-3xl font-bold mb-4">Bem vindo a plataforma Web</h2>
              <p className="text-base mb-8 leading-relaxed">
                A Nexus Ambiental é uma startup de tecnologia que desenvolve soluções SaaS para otimizar a gestão de ativos ambientais. Através de plataformas web e mobile integradas, a empresa substitui processos manuais por fluxos de trabalho digitais, fornecendo dados precisos para decisões estratégicas. Seu produto pioneiro, o TreeInspector, é focado na gestão inteligente de árvores urbanas. O objetivo principal é conectar a sustentabilidade com a inovação, tornando o gerenciamento ambiental mais eficiente e confiável.
              </p>
               <div className="text-left w-full">
                <h3 className="text-2xl font-semibold mb-4 border-b-2 border-lime-300 pb-2">
                  Principais Recursos
                </h3>
                <ul className="space-y-3 text-base">
                  <li><strong>Gerenciamento de Solicitações:</strong> Cadastro e importação em lote de pedidos de vistoria.</li>
                  <li><strong>Planejamento e Roteirização:</strong> Criação de rotas de trabalho otimizadas para as equipes.</li>
                  <li><strong>Execução de Vistoria Offline:</strong> Preenchimento de laudos em campo, sem necessidade de internet.</li>
                  <li><strong>Administração e Gestão:</strong> Painel web para gerenciar formulários e visualizar dashboards.</li>
                  <li><strong>Geração de Relatórios:</strong> Criação automática de laudos técnicos padronizados.</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-[#F0F5E4] p-8 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg max-w-sm w-full text-center">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Acesse a Plataforma</h3>
              <p className="text-gray-600 mb-8">Utilize sua conta Google para entrar de forma rápida e segura.</p>
              <button onClick={onGoogleSignIn} className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-sm w-full flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105">
                <GoogleIcon className="w-6 h-6 mr-3" />
                Entrar com o Google
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Componente Principal da Página de Login ---
export default function LoginPageController() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Se o usuário já está logado, redireciona para o dashboard
        router.push('/dashboard');
      } else {
        // Se não há usuário, para de carregar e permite a exibição da página de login
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // O listener onAuthStateChanged acima cuidará do redirecionamento
    } catch (error) {
      console.error("Erro ao fazer login com o Google", error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-100">Verificando autenticação...</div>;
  }

  return <LoginPageUI onGoogleSignIn={handleGoogleSignIn} />;
}