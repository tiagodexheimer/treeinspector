"use client";

import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { Solicitacao, TipoDemanda, TipoAndamento } from '../../types';

// --- Ícones ---
const PlusIcon = ({ className }: { className: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>;
const TableIcon = ({ className }: { className: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18M3 6h18M3 18h18"></path></svg>;
const CardIcon = ({ className }: { className: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
const EditIcon = ({ className }: { className: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>;
const DeleteIcon = ({ className }: { className: string }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;


// --- Componente do Formulário no Modal ---
const SolicitacaoForm = ({ solicitacao, tiposDemanda, tiposAndamento, onSave, onCancel }: {
    solicitacao: Partial<Solicitacao> | null;
    tiposDemanda: TipoDemanda[];
    tiposAndamento: TipoAndamento[];
    onSave: (solicitacao: Partial<Solicitacao>) => void;
    onCancel: () => void;
}) => {
    const [formData, setFormData] = useState<Partial<Solicitacao>>({
        numero_processo: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        cep: '',
        latitude: '',
        longitude: '',
        tipo_demanda_id: '',
        tipo_andamento_id: '',
        nome_solicitante: '',
        telefone_solicitante: '',
        descricao_demanda: '',
        ...solicitacao
    });
    const [isGeocoding, setIsGeocoding] = useState(false);

    const fetchCoordinates = async (address: string) => {
        setIsGeocoding(true);
        try {
            const response = await fetch('/api/geocode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address }),
            });
            if (response.ok) {
                const data = await response.json();
                setFormData(prev => ({ ...prev, latitude: data.lat, longitude: data.lng }));
            } else {
                 console.error("Geocoding falhou:", await response.json());
            }
        } catch (error) {
            console.error("Erro ao buscar coordenadas:", error);
        } finally {
            setIsGeocoding(false);
        }
    };

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        setFormData(prev => ({...prev, cep}));

        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    const newFormData = {
                        ...formData,
                        cep,
                        logradouro: data.logradouro,
                        bairro: data.bairro,
                        cidade: data.localidade,
                    };
                    setFormData(newFormData);
                    
                    if (newFormData.numero) {
                       fetchCoordinates(`${data.logradouro}, ${newFormData.numero}, ${data.bairro}, ${data.localidade}`);
                    }
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            }
        }
    };
    
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numero = e.target.value;
        setFormData(prev => ({...prev, numero}));
        
        if (formData.logradouro && numero) {
            fetchCoordinates(`${formData.logradouro}, ${numero}, ${formData.bairro}, ${formData.cidade}`);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!formData.tipo_demanda_id || !formData.tipo_andamento_id || !formData.latitude || !formData.longitude) {
            alert('Por favor, preencha todos os campos obrigatórios e aguarde a busca de coordenadas.');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{solicitacao?.id ? 'Editar' : 'Criar'} Solicitação</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="numero_processo" placeholder="Nº Processo (opcional)" value={formData.numero_processo} onChange={handleChange} className="p-2 border rounded-md text-gray-800" />
                        <select name="tipo_demanda_id" value={formData.tipo_demanda_id} onChange={handleChange} required className="p-2 border rounded-md bg-white text-gray-800">
                            <option value="">* Tipo de Demanda</option>
                            {tiposDemanda.map(td => <option key={td.id} value={td.id}>{td.nome}</option>)}
                        </select>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <select name="tipo_andamento_id" value={formData.tipo_andamento_id} onChange={handleChange} required className="p-2 border rounded-md bg-white text-gray-800">
                            <option value="">* Status de Andamento</option>
                            {tiposAndamento.map(ta => <option key={ta.id} value={ta.id}>{ta.nome}</option>)}
                        </select>
                         <input type="text" name="nome_solicitante" placeholder="Nome do Solicitante" value={formData.nome_solicitante} onChange={handleChange} className="p-2 border rounded-md text-gray-800" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <input type="text" name="telefone_solicitante" placeholder="Telefone do Solicitante" value={formData.telefone_solicitante} onChange={handleChange} className="p-2 border rounded-md text-gray-800" />
                       <input type="text" name="cep" placeholder="CEP" value={formData.cep} onChange={handleCepChange} className="p-2 border rounded-md text-gray-800" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" name="logradouro" placeholder="Logradouro" value={formData.logradouro} onChange={handleChange} className="p-2 border rounded-md text-gray-800" />
                        <input type="text" name="numero" placeholder="Número" value={formData.numero} onChange={handleNumberChange} className="p-2 border rounded-md text-gray-800" />
                        <input type="text" name="bairro" placeholder="Bairro" value={formData.bairro} onChange={handleChange} className="p-2 border rounded-md text-gray-800" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" name="cidade" placeholder="Cidade" value={formData.cidade} onChange={handleChange} className="p-2 border rounded-md text-gray-800" />
                        <input type="number" step="any" name="latitude" placeholder="* Latitude" value={formData.latitude} onChange={handleChange} required className="p-2 border rounded-md text-gray-800" />
                        <input type="number" step="any" name="longitude" placeholder="* Longitude" value={formData.longitude} onChange={handleChange} required className="p-2 border rounded-md text-gray-800" />
                    </div>
                    {isGeocoding && <p className="text-sm text-blue-600">Buscando coordenadas...</p>}

                    <textarea name="descricao_demanda" placeholder="Descrição da Demanda (opcional)" value={formData.descricao_demanda} onChange={handleChange} className="p-2 border rounded-md w-full text-gray-800" rows={3}></textarea>
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onCancel} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded">Cancelar</button>
                        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded" disabled={isGeocoding}>
                            {isGeocoding ? 'Aguarde...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Componente Card de Solicitação ---
const SolicitacaoCard = ({ solicitacao, tiposDemanda, tiposAndamento, onSelect, isSelected, onEdit, onDelete }: {
    solicitacao: Solicitacao;
    tiposDemanda: TipoDemanda[];
    tiposAndamento: TipoAndamento[];
    onSelect: (id: string, isCtrlKey: boolean) => void;
    isSelected: boolean;
    onEdit: (solicitacao: Solicitacao) => void;
    onDelete: (id: string) => void;
}) => {
    const demanda = tiposDemanda.find(d => d.id === solicitacao.tipo_demanda_id);
    const andamento = tiposAndamento.find(a => a.id === solicitacao.tipo_andamento_id);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    return (
        <div 
            onClick={(e) => onSelect(solicitacao.id!, e.ctrlKey)}
            className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:shadow-lg'}`}
        >
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500">{solicitacao.numero_processo || 'Sem processo'}</p>
                        <p className="text-xs text-gray-600">Tipo de Demanda:</p>
                        <p className="font-bold text-lg text-gray-800 -mt-1">{demanda?.nome || 'Não encontrada'}</p>
                    </div>
                    <div className="flex items-center">
                        {andamento && (
                            <span className="text-xs font-bold text-white px-3 py-1 rounded-full shadow-sm" style={{ backgroundColor: andamento.cor }}>
                                {andamento.nome}
                            </span>
                        )}
                        <div className="flex-shrink-0 ml-2">
                             <button onClick={(e) => { e.stopPropagation(); onEdit(solicitacao); }} className="text-blue-500 hover:text-blue-700 p-2"><EditIcon className="w-5 h-5"/></button>
                             <button onClick={(e) => { e.stopPropagation(); onDelete(solicitacao.id!); }} className="text-red-500 hover:text-red-700 p-2"><DeleteIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                </div>
                <p className="text-gray-700 mt-2">{solicitacao.logradouro}, {solicitacao.numero} - {solicitacao.bairro}</p>
                <p className="text-sm text-gray-600">{solicitacao.cidade}</p>
            </div>
            {apiKey && (
                 <iframe
                    width="100%"
                    height="150"
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${solicitacao.latitude},${solicitacao.longitude}`}>
                </iframe>
            )}
        </div>
    );
};


// --- Componente Principal ---
export default function SolicitacoesPage() {
    // Estados
    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [tiposDemanda, setTiposDemanda] = useState<TipoDemanda[]>([]);
    const [tiposAndamento, setTiposAndamento] = useState<TipoAndamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSolicitacao, setEditingSolicitacao] = useState<Partial<Solicitacao> | null>(null);
    const [filters, setFilters] = useState({ rua: '', bairro: '', tipo_demanda_id: '', tipo_andamento_id: '' });
    const [selectedSolicitacoes, setSelectedSolicitacoes] = useState<string[]>([]);
    
    // Funções de busca de dados
    const fetchData = async () => {
        setLoading(true);
        try {
            const [solicitacoesRes, demandasRes, andamentosRes] = await Promise.all([
                fetch('/api/solicitacoes'),
                fetch('/api/tiposDemanda'),
                fetch('/api/tiposAndamento')
            ]);

            if (solicitacoesRes.ok) {
                setSolicitacoes(await solicitacoesRes.json());
            } else {
                console.error("Falha ao buscar solicitações:", await solicitacoesRes.json());
                setSolicitacoes([]);
            }

            if (demandasRes.ok) {
                setTiposDemanda(await demandasRes.json());
            } else {
                 console.error("Falha ao buscar tipos de demanda:", await demandasRes.json());
                 setTiposDemanda([]);
            }

            if(andamentosRes.ok) {
                setTiposAndamento(await andamentosRes.json());
            } else {
                console.error("Falha ao buscar tipos de andamento:", await andamentosRes.json());
                setTiposAndamento([]);
            }

        } catch (error) {
            console.error("Falha ao carregar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Lógica de filtragem
    const filteredSolicitacoes = useMemo(() => {
        if (!Array.isArray(solicitacoes)) {
            return [];
        }
        return solicitacoes.filter(s => 
            (filters.rua ? s.logradouro.toLowerCase().includes(filters.rua.toLowerCase()) : true) &&
            (filters.bairro ? s.bairro.toLowerCase().includes(filters.bairro.toLowerCase()) : true) &&
            (filters.tipo_demanda_id ? s.tipo_demanda_id === filters.tipo_demanda_id : true) &&
            (filters.tipo_andamento_id ? s.tipo_andamento_id === filters.tipo_andamento_id : true)
        );
    }, [solicitacoes, filters]);
    
    // Funções CRUD
    const handleSaveSolicitacao = async (solicitacao: Partial<Solicitacao>) => {
        const method = solicitacao.id ? 'PUT' : 'POST';
        const response = await fetch('/api/solicitacoes', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(solicitacao)
        });

        if (response.ok) {
            setIsModalOpen(false);
            fetchData();
        } else {
            const data = await response.json();
            alert(`Erro: ${data.error || 'Não foi possível salvar a solicitação.'}`);
        }
    };

    const handleEdit = (solicitacao: Solicitacao) => {
        setEditingSolicitacao(solicitacao);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Tem certeza que deseja apagar esta solicitação?")) {
            const response = await fetch('/api/solicitacoes', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (response.ok) {
                fetchData();
            } else {
                const data = await response.json();
                alert(`Erro: ${data.error || 'Não foi possível apagar a solicitação.'}`);
            }
        }
    };
    
    // Lógica de seleção e rotas
    const handleSelectSolicitacao = (id: string, isCtrlKey: boolean) => {
        if (isCtrlKey) {
            setSelectedSolicitacoes(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
        } else {
            setSelectedSolicitacoes(prev => prev.length === 1 && prev[0] === id ? [] : [id]);
        }
    };
    
    const handleCreateRota = async () => {
        if (selectedSolicitacoes.length === 0) return;
        const nomeRota = prompt("Digite um nome para a nova rota:");
        if (nomeRota) {
            await fetch('/api/rotas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome_rota: nomeRota, solicitacoes_ids: selectedSolicitacoes })
            });
            alert("Rota criada com sucesso!");
            setSelectedSolicitacoes([]);
        }
    };


    if (loading) return <div className="text-center p-10">Carregando dados...</div>;

    return (
        <div>
            {/* Cabeçalho e Controles */}
            <div className="mb-6 p-4 bg-white/80 rounded-lg shadow-md flex flex-wrap items-center justify-between gap-4">
                 <div className="flex-grow flex items-center gap-4">
                    <button onClick={() => { setEditingSolicitacao(null); setIsModalOpen(true); }} className="bg-[#4B8A08] hover:bg-[#6fa139] text-white font-bold py-2 px-4 rounded-md flex items-center">
                        <PlusIcon className="w-5 h-5 mr-2" /> Criar Solicitação
                    </button>
                    {selectedSolicitacoes.length > 0 && (
                        <button onClick={handleCreateRota} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md">
                            Criar Rota ({selectedSolicitacoes.length})
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setViewMode('cards')} className={`p-2 rounded-md ${viewMode === 'cards' ? 'bg-gray-300' : 'hover:bg-gray-200'}`}><CardIcon className="w-5 h-5"/></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-300' : 'hover:bg-gray-200'}`}><TableIcon className="w-5 h-5"/></button>
                </div>
            </div>

            {/* Filtros */}
            <div className="mb-6 p-4 bg-white/80 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <input type="text" placeholder="Filtrar por rua..." value={filters.rua} onChange={e => setFilters({...filters, rua: e.target.value})} className="p-2 border rounded-md text-gray-800"/>
               <input type="text" placeholder="Filtrar por bairro..." value={filters.bairro} onChange={e => setFilters({...filters, bairro: e.target.value})} className="p-2 border rounded-md text-gray-800"/>
               <select value={filters.tipo_demanda_id} onChange={e => setFilters({...filters, tipo_demanda_id: e.target.value})} className="p-2 border rounded-md bg-white text-gray-800">
                  <option value="">Todos os Tipos de Demanda</option>
                  {tiposDemanda.map(td => <option key={td.id} value={td.id}>{td.nome}</option>)}
               </select>
               <select value={filters.tipo_andamento_id} onChange={e => setFilters({...filters, tipo_andamento_id: e.target.value})} className="p-2 border rounded-md bg-white text-gray-800">
                  <option value="">Todos os Status</option>
                  {tiposAndamento.map(ta => <option key={ta.id} value={ta.id}>{ta.nome}</option>)}
               </select>
            </div>
            
            {/* Conteúdo */}
            <div>
                {/* *** CORREÇÃO APLICADA AQUI *** */}
                <p className="text-sm text-gray-600 mb-2">Exibindo {filteredSolicitacoes.length} de {solicitacoes.length} solicitações. Segure &apos;Ctrl&apos; para selecionar várias.</p>
                {viewMode === 'cards' ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredSolicitacoes.map(s => <SolicitacaoCard key={s.id} solicitacao={s} tiposDemanda={tiposDemanda} tiposAndamento={tiposAndamento} onSelect={handleSelectSolicitacao} isSelected={selectedSolicitacoes.includes(s.id!)} onEdit={handleEdit} onDelete={handleDelete} />)}
                     </div>
                ) : (
                    <div className="bg-white/80 rounded-lg shadow-md overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-gray-800">Endereço</th>
                                    <th className="p-3 text-gray-800">Demanda</th>
                                    <th className="p-3 text-gray-800">Status</th>
                                    <th className="p-3 text-gray-800">Data</th>
                                    <th className="p-3 text-gray-800">Ações</th>
                                </tr>
                           </thead>
                           <tbody>
                                {filteredSolicitacoes.map(s => {
                                    const andamento = tiposAndamento.find(a => a.id === s.tipo_andamento_id);
                                    return (
                                    <tr key={s.id} onClick={(e) => handleSelectSolicitacao(s.id!, e.ctrlKey)} className={`border-t cursor-pointer ${selectedSolicitacoes.includes(s.id!) ? 'bg-blue-100' : 'hover:bg-gray-50'}`}>
                                        <td className="p-3 text-gray-800">{`${s.logradouro}, ${s.numero}`}</td>
                                        <td className="p-3 text-gray-800">{tiposDemanda.find(d => d.id === s.tipo_demanda_id)?.nome}</td>
                                        <td className="p-3 text-gray-800">
                                            <span className="text-xs font-bold text-white px-3 py-1 rounded-full shadow-sm" style={{ backgroundColor: andamento?.cor || '#6B7280' }}>
                                                {andamento?.nome || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-gray-800">{s.data_criacao ? new Date(s.data_criacao).toLocaleDateString() : '-'}</td>
                                        <td className="p-3 text-gray-800">
                                            <div className="flex gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); handleEdit(s); }} className="text-blue-500 hover:text-blue-700 p-2"><EditIcon className="w-5 h-5"/></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(s.id!); }} className="text-red-500 hover:text-red-700 p-2"><DeleteIcon className="w-5 h-5"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                           </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <SolicitacaoForm
                    solicitacao={editingSolicitacao}
                    tiposDemanda={tiposDemanda}
                    tiposAndamento={tiposAndamento}
                    onSave={handleSaveSolicitacao}
                    onCancel={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}