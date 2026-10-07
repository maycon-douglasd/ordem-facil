import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Notificacao, TipoNotificacao } from "../types/notificacao";

const COLECAO = "notificacoes";

function getFirestoreErrorMessage(): string {
    return "Não foi possível concluir. Verifique sua conexão e tente novamente.";
}

// Cria uma nova notificação para o usuário. Chamada internamente por
// outras partes do app (ex: ao aprovar um orçamento), não diretamente
// pelo usuário.
export async function criarNotificacao(
    donoId: string,
    tipo: TipoNotificacao,
    titulo: string,
    mensagem: string
): Promise<void> {
    try {
        await addDoc(collection(db, COLECAO), {
            donoId,
            tipo,
            titulo,
            mensagem,
            lida: false,
            criadoEm: Date.now(),
        });
    } catch (error) {
        // Não lançamos erro aqui de propósito: uma notificação que falha ao
        // ser criada não deve travar a ação principal (ex: aprovar orçamento
        // deve funcionar mesmo que a notificação falhe).
        console.error("[notificacoesService] Erro ao criar notificação:", error);
    }
}

// Lista todas as notificações do usuário, mais recentes primeiro.
export async function listarNotificacoes(donoId: string): Promise<Notificacao[]> {
    try {
        const q = query(
            collection(db, COLECAO),
            where("donoId", "==", donoId),
            orderBy("criadoEm", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
        })) as Notificacao[];
    } catch (error) {
        console.error("[notificacoesService] Erro ao listar notificações:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Marca uma notificação específica como lida.
export async function marcarComoLida(notificacaoId: string): Promise<void> {
    try {
        const notificacaoRef = doc(db, COLECAO, notificacaoId);
        await updateDoc(notificacaoRef, { lida: true });
    } catch (error) {
        console.error("[notificacoesService] Erro ao marcar como lida:", error);
    }
}

// Marca todas as notificações não lidas do usuário como lidas.
export async function marcarTodasComoLidas(donoId: string): Promise<void> {
    try {
        const notificacoes = await listarNotificacoes(donoId);
        const naoLidas = notificacoes.filter((n) => !n.lida);
        await Promise.all(naoLidas.map((n) => marcarComoLida(n.id)));
    } catch (error) {
        console.error("[notificacoesService] Erro ao marcar todas como lidas:", error);
    }
}


// Exclui uma notificação específica.
export async function excluirNotificacao(notificacaoId: string): Promise<void> {
    try {
        const notificacaoRef = doc(db, COLECAO, notificacaoId);
        await deleteDoc(notificacaoRef);
    } catch (error) {
        console.error("[notificacoesService] Erro ao excluir notificação:", error);
    }
}

// Exclui todas as notificações do usuário.
export async function excluirTodasNotificacoes(donoId: string): Promise<void> {
    try {
        const notificacoes = await listarNotificacoes(donoId);
        await Promise.all(notificacoes.map((n) => excluirNotificacao(n.id)));
    } catch (error) {
        console.error("[notificacoesService] Erro ao excluir todas:", error);
    }
}