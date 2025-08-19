// Arquivo: types/index.ts
// É uma boa prática definir tipos e interfaces em um arquivo separado.
import { firestore } from 'firebase-admin';

export interface TipoDemanda {
  id?: string;
  nome: string;
  descricao?: string;
}

export interface TipoAndamento {
  id?: string;
  nome: string;
  cor: string; // Adiciona o campo de cor
  descricao?: string;
}

export interface Solicitacao {
  id?: string;
  tipo_demanda_id: string;
  tipo_andamento_id: string;
  numero_processo?: string;
  logradouro: string;
  numero: string;
  cep: string;
  bairro: string;
  cidade: string;
  localizacao: firestore.GeoPoint;
  descricao_demanda?: string;
  nome_solicitante: string;
  telefone_solicitante: string;
  data_criacao?: firestore.Timestamp;
}

export interface Rota {
    id?: string;
    nome_rota: string;
    solicitacoes: string[]; // Array com os IDs das solicitações
}