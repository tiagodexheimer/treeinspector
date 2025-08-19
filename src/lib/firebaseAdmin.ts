// Arquivo: lib/firebaseAdmin.ts
import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// Verifica se o app do Firebase já foi inicializado para evitar erros.
if (!admin.apps.length) {
  try {
    // Define a estrutura do objeto de credenciais para o TypeScript
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // A chave privada pode precisar de uma formatação para remover escapes.
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };

    // Inicializa o SDK do Firebase Admin usando as variáveis de ambiente.
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

// Exporta a instância do Firestore para ser usada nas API routes.
const db: admin.firestore.Firestore = admin.firestore();
export default db;
