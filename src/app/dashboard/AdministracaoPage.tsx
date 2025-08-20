"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react'; // Adicionado useCallback
import { TipoDemanda, TipoAndamento } from '../../types';

// --- Ícones (sem alterações) ---
const EditIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>
);
const DeleteIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
);
const PlusIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
);

// --- Componente ColorPicker (sem alterações) ---
const ColorPicker = ({ onSelectColor, onClose }: { onSelectColor: (color: string) => void, onClose: () => void }) => {
  const colors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
    '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#78716C'
  ];
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerRef, onClose]);

  return (
    <div ref={pickerRef} className="absolute z-10 top-full mt-2 w-56 bg-white rounded-lg shadow-xl p-2 grid grid-cols-6 gap-2">
      {colors.map(color => (
        <button
          key={color}
          type="button"
          onClick={() => onSelectColor(color)}
          className="w-8 h-8 rounded-full border border-gray-200 transition transform hover:scale-110"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
};

// --- Componente de Gerenciamento para Tipos de Andamento ---
function AndamentoManager() {
  const [items, setItems] = useState<TipoAndamento[]>([]);
  const [editingItem, setEditingItem] = useState<TipoAndamento | null>(null);
  const [newItem, setNewItem] = useState({ nome: '', descricao: '', cor: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const apiPath = 'tiposAndamento';

  // *** CORREÇÃO APLICADA AQUI ***
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/${apiPath}`);
      if (!response.ok) throw new Error('Falha ao buscar dados da API');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error(`Erro ao buscar Tipos de Andamento:`, error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiPath]);

  // *** CORREÇÃO APLICADA AQUI ***
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.nome || !newItem.cor) {
      alert("Nome e cor são obrigatórios.");
      return;
    }
    const response = await fetch(`/api/${apiPath}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newItem) });
    
    if (response.status === 409) {
        const data = await response.json();
        alert(data.error);
    } else if (response.ok) {
        setNewItem({ nome: '', descricao: '', cor: '' });
        fetchItems();
    }
  };
  
  const handleUpdate = async (itemToUpdate: TipoAndamento) => {
    if (!itemToUpdate.nome || !itemToUpdate.cor) return;
    const response = await fetch(`/api/${apiPath}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(itemToUpdate) });

    if (response.status === 409) {
        const data = await response.json();
        alert(data.error);
    } else if (response.ok) {
        setEditingItem(null);
        fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja apagar este item?")) {
      await fetch(`/api/${apiPath}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      fetchItems();
    }
  };

  return (
    <div className="bg-white/80 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Gerenciar Tipos de Andamento</h3>
      
      <form onSubmit={handleCreate} className="mb-6 flex flex-col sm:flex-row items-center gap-4">
        <input type="text" placeholder="Nome" value={newItem.nome} onChange={(e) => setNewItem({ ...newItem, nome: e.target.value })} className="border border-gray-300 p-2 rounded-md w-full sm:flex-grow text-gray-800"/>
        <input type="text" placeholder="Descrição (opcional)" value={newItem.descricao} onChange={(e) => setNewItem({ ...newItem, descricao: e.target.value })} className="border border-gray-300 p-2 rounded-md w-full sm:flex-grow text-gray-800"/>
        <div className="relative">
          <button type="button" onClick={() => setShowColorPicker(showColorPicker === 'new' ? null : 'new')} className="border border-gray-300 p-2 rounded-md flex items-center gap-2 text-gray-700">
            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: newItem.cor || '#E5E7EB' }}></div>
            {newItem.cor ? 'Cor Selecionada' : 'Escolher Cor'}
          </button>
          {showColorPicker === 'new' && <ColorPicker onSelectColor={(color) => { setNewItem({...newItem, cor: color}); setShowColorPicker(null); }} onClose={() => setShowColorPicker(null)} />}
        </div>
        <button type="submit" className="bg-[#4B8A08] hover:bg-[#6fa139] text-white font-bold py-2 px-4 rounded-md flex items-center justify-center w-full sm:w-auto">
          <PlusIcon className="w-5 h-5 mr-1" /> Adicionar
        </button>
      </form>

      <div className="space-y-2">
        {isLoading ? <p className="text-gray-600">Carregando...</p> : items.map((item) => (
          <div key={item.id} className="border border-gray-200 p-3 rounded-md">
            {editingItem?.id === item.id && editingItem ? (
              <div className='space-y-3'>
                 <div className='flex flex-col sm:flex-row items-center gap-4'>
                  <input type="text" value={editingItem.nome} onChange={(e) => setEditingItem({ ...editingItem, nome: e.target.value })} className="border border-gray-300 p-2 rounded-md w-full sm:flex-grow text-gray-800"/>
                  <input type="text" value={editingItem.descricao || ''} onChange={(e) => setEditingItem({ ...editingItem, descricao: e.target.value })} className="border border-gray-300 p-2 rounded-md w-full sm:flex-grow text-gray-800"/>
                  <div className="relative">
                    <button type="button" onClick={() => setShowColorPicker(showColorPicker === item.id ? null : item.id!)} className="border border-gray-300 p-2 rounded-md flex items-center gap-2 text-gray-700">
                        <div className="w-5 h-5 rounded-full" style={{ backgroundColor: editingItem.cor || '#E5E7EB' }}></div>
                        Alterar Cor
                    </button>
                    {showColorPicker === item.id && <ColorPicker onSelectColor={(color) => { setEditingItem({...editingItem, cor: color}); setShowColorPicker(null); }} onClose={() => setShowColorPicker(null)} />}
                  </div>
                 </div>
                 <div className="flex justify-end gap-2 w-full">
                    <button onClick={() => handleUpdate(editingItem)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md">Salvar</button>
                    <button onClick={() => setEditingItem(null)} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md">Cancelar</button>
                 </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div 
                  className="rounded-md px-3 py-1 text-white shadow-sm flex-grow mr-4"
                  style={{ backgroundColor: item.cor }}
                >
                  <p className="font-semibold">{item.nome}</p>
                  {item.descricao && <p className="text-sm opacity-90">{item.descricao}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setEditingItem(item)} className="text-blue-500 hover:text-blue-700 p-2"><EditIcon className="w-5 h-5"/></button>
                  <button onClick={() => handleDelete(item.id!)} className="text-red-500 hover:text-red-700 p-2"><DeleteIcon className="w-5 h-5"/></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {!isLoading && items.length === 0 && <p className="text-gray-500 text-center py-4">Nenhum item encontrado.</p>}
      </div>
    </div>
  );
}

// --- Componente Genérico para Tipos de Demanda ---
function TiposManager<T extends { id?: string; nome: string; descricao?: string }>({ title, apiPath }: {title: string, apiPath: string}) {
  const [items, setItems] = useState<T[]>([]);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [newItem, setNewItem] = useState({ nome: '', descricao: '' });
  const [isLoading, setIsLoading] = useState(true);

  // *** CORREÇÃO APLICADA AQUI ***
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/${apiPath}`);
      if (!response.ok) throw new Error('Falha ao buscar dados da API');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error(`Erro ao buscar ${title}:`, error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiPath, title]);

  // *** CORREÇÃO APLICADA AQUI ***
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.nome) return;
    const response = await fetch(`/api/${apiPath}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newItem) });
    
    if (response.status === 409) {
        const data = await response.json();
        alert(data.error);
    } else if (response.ok) {
        setNewItem({ nome: '', descricao: '' });
        fetchItems();
    }
  };

  const handleUpdate = async (itemToUpdate: T) => {
    if (!itemToUpdate.nome) return;
    const response = await fetch(`/api/${apiPath}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(itemToUpdate) });

    if (response.status === 409) {
        const data = await response.json();
        alert(data.error);
    } else if (response.ok) {
        setEditingItem(null);
        fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja apagar este item?")) {
      await fetch(`/api/${apiPath}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      fetchItems();
    }
  };
  
  return (
    <div className="bg-white/80 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
      
      <form onSubmit={handleCreate} className="mb-6 flex flex-col sm:flex-row items-center gap-4">
        <input type="text" placeholder="Nome" value={newItem.nome} onChange={(e) => setNewItem({ ...newItem, nome: e.target.value })} className="border border-gray-300 p-2 rounded-md w-full sm:flex-grow text-gray-800"/>
        <input type="text" placeholder="Descrição (opcional)" value={newItem.descricao} onChange={(e) => setNewItem({ ...newItem, descricao: e.target.value })} className="border border-gray-300 p-2 rounded-md w-full sm:flex-grow text-gray-800"/>
        <button type="submit" className="bg-[#4B8A08] hover:bg-[#6fa139] text-white font-bold py-2 px-4 rounded-md flex items-center justify-center w-full sm:w-auto">
          <PlusIcon className="w-5 h-5 mr-1" /> Adicionar
        </button>
      </form>

      <div className="space-y-2">
        {isLoading ? <p className="text-gray-600">Carregando...</p> : items.map((item) => (
          <div key={item.id} className="border border-gray-200 p-3 rounded-md flex justify-between items-center">
            {editingItem?.id === item.id && editingItem ? (
              <div className='flex-grow flex flex-col sm:flex-row items-center gap-4'>
                 <input type="text" value={editingItem.nome} onChange={(e) => setEditingItem({ ...editingItem, nome: e.target.value })} className="border border-gray-300 p-2 rounded-md w-full sm:flex-grow text-gray-800"/>
                  <input type="text" value={editingItem.descricao || ''} onChange={(e) => setEditingItem({ ...editingItem, descricao: e.target.value })} className="border border-gray-300 p-2 rounded-md w-full sm:flex-grow text-gray-800"/>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => handleUpdate(editingItem)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md w-1/2 sm:w-auto">Salvar</button>
                    <button onClick={() => setEditingItem(null)} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md w-1/2 sm:w-auto">Cancelar</button>
                  </div>
              </div>
            ) : (
              <>
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800">{item.nome}</p>
                  {item.descricao && <p className="text-sm text-gray-600">{item.descricao}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setEditingItem(item)} className="text-blue-500 hover:text-blue-700 p-2"><EditIcon className="w-5 h-5"/></button>
                  <button onClick={() => handleDelete(item.id!)} className="text-red-500 hover:text-red-700 p-2"><DeleteIcon className="w-5 h-5"/></button>
                </div>
              </>
            )}
          </div>
        ))}
         {!isLoading && items.length === 0 && <p className="text-gray-500 text-center py-4">Nenhum item encontrado.</p>}
      </div>
    </div>
  );
}


// --- Componente Principal da Página de Administração com ABAS ---
export default function AdministracaoPage() {
  const [activeTab, setActiveTab] = useState('demandas');

  const getTabClass = (tabName: string) => {
    return activeTab === tabName
      ? 'border-green-600 text-green-700'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
  };

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('demandas')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${getTabClass('demandas')}`}
          >
            Tipos de Demanda
          </button>
          <button
            onClick={() => setActiveTab('andamentos')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${getTabClass('andamentos')}`}
          >
            Tipos de Andamento
          </button>
          <div className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent text-gray-400 font-medium text-sm cursor-not-allowed">
            Espécies (em breve)
          </div>
           <div className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent text-gray-400 font-medium text-sm cursor-not-allowed">
            Usuários (em breve)
          </div>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'demandas' && <TiposManager<TipoDemanda> title="Gerenciar Tipos de Demanda" apiPath="tiposDemanda" />}
        {activeTab === 'andamentos' && <AndamentoManager />}
      </div>
    </div>
  );
}