import React, { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    User,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { getAuthErrorMessage } from "../utils/errorMessages";
import { criarConfigUsuario, garantirConfigUsuario } from "../services/usuarioService";

type AuthContextType = {
    user: User | null;
    loadingAuthState: boolean;
    login: (email: string, senha: string) => Promise<void>;
    cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    // Enquanto o Firebase ainda não respondeu se há um usuário salvo,
    // mostramos loading em vez de "chutar" que ninguém está logado.
    const [loadingAuthState, setLoadingAuthState] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (firebaseUser) => {
                setUser(firebaseUser);
                setLoadingAuthState(false);
            },
            (error) => {
                // Mesmo um erro aqui (raro, mas possível) não pode travar o app
                console.error("[Auth] Erro ao observar estado de login:", error);
                setLoadingAuthState(false);
            }
        );
        return unsubscribe;
    }, []);

    async function login(email: string, senha: string) {
        try {
            const credential = await signInWithEmailAndPassword(auth, email.trim(), senha);
            // Garante que contas criadas antes da funcionalidade de planos
            // existir também tenham o documento de configuração no Firestore.
            await garantirConfigUsuario(credential.user.uid);
        } catch (error: any) {
            throw new Error(getAuthErrorMessage(error?.code ?? ""));
        }
    }

    async function cadastrar(nome: string, email: string, senha: string) {
        try {
            const credential = await createUserWithEmailAndPassword(auth, email.trim(), senha);
            await updateProfile(credential.user, { displayName: nome.trim() });
            await criarConfigUsuario(credential.user.uid);
            // Força a tela a perceber a mudança do nome: criamos uma cópia do
            // usuário (novo objeto) em vez de reaproveitar a mesma referência,
            // porque o React só re-renderiza quando detecta um objeto "novo".
            setUser({ ...credential.user } as User);
        } catch (error: any) {
            throw new Error(getAuthErrorMessage(error?.code ?? ""));
        }
    }

    async function logout() {
        try {
            await signOut(auth);
        } catch (error: any) {
            throw new Error(getAuthErrorMessage(error?.code ?? ""));
        }
    }

    return (
        <AuthContext.Provider value={{ user, loadingAuthState, login, cadastrar, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook de conveniência: usar useAuth() em vez de useContext(AuthContext) direto.
// Se alguém esquecer de envolver o app no <AuthProvider>, o erro aparece
// aqui, de forma clara, em vez de um "undefined" confuso mais tarde.
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth precisa ser usado dentro de um <AuthProvider>.");
    }
    return context;
}