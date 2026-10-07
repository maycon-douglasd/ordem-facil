import { initializeApp, getApps, getApp } from "firebase/app";
// @ts-ignore -- getReactNativePersistence existe e funciona no runtime,
// mas a declaração de tipos do pacote não a reconhece corretamente
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// @ts-ignore -- getReactNativePersistence exige este import específico do RN
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Todas as chaves vêm do .env — NUNCA coloque valores diretamente aqui.
// Se alguma variável estiver faltando, o app avisa no console em vez de
// falhar silenciosamente com um erro difícil de rastrear depois.
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
    console.warn(
        "[Firebase] Chaves não configuradas. Copie .env.example para .env e preencha com as chaves do seu projeto."
    );
}

// Evita inicializar o Firebase mais de uma vez (ex: durante hot reload)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Persistência com AsyncStorage: mantém o usuário logado entre sessões do app
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
export default app;