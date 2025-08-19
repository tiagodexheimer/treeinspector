import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// Adicionando logs para depuração
console.log('--- Verificando Variáveis de Ambiente do Firebase Admin ---');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Carregado' : 'NÃO ENCONTRADO');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'Carregado' : 'NÃO ENCONTRADO');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'Carregado' : 'NÃO ENCONTRADO');
console.log('---------------------------------------------------------');


if (!admin.apps.length) {
  try {
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error("As credenciais do Firebase Admin não foram encontradas nas variáveis de ambiente. Verifique seu arquivo .env.local e reinicie o servidor.");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK inicializado com sucesso.");

  } catch (error) {
    console.error('ERRO na inicialização do Firebase Admin:', error);
  }
}

const db: admin.firestore.Firestore = admin.firestore();
export default db;