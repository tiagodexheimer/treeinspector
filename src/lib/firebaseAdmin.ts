import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// Função para inicializar o Firebase Admin
function initializeFirebaseAdmin() {
  // Verifica se o app já foi inicializado para evitar erros
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Adicionando logs para depuração
  console.log('--- Verificando Variáveis de Ambiente do Firebase Admin ---');
  console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Carregado' : 'NÃO ENCONTRADO');
  console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'Carregado' : 'NÃO ENCONTRADO');
  console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'Carregado' : 'NÃO ENCONTRADO');
  console.log('---------------------------------------------------------');

  try {
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // A chave privada precisa ser parseada corretamente
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };

    // Validação robusta das credenciais
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error("As credenciais do Firebase Admin não foram encontradas ou estão incompletas nas variáveis de ambiente.");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK inicializado com sucesso.");

  } catch (error) {
    console.error('ERRO na inicialização do Firebase Admin:', error);
    // Lançar o erro pode ajudar a identificar o problema mais claramente nos logs
    throw error;
  }

  return admin.app();
}

// Função para obter a instância do Firestore
function getFirestoreInstance() {
  initializeFirebaseAdmin();
  return admin.firestore();
}

// Exporte a instância do DB para ser usada em outros lugares
const db = getFirestoreInstance();

export default db;
