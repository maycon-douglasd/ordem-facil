import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Despesa, DespesaFormData } from "../types/despesa";

const COLECAO = "despesas";

function getFirestoreErrorMessage(): string {
    return "Não foi possível concluir. Verifique sua conexão e tente novamente.";
}

// Lista todas as despesas do usuário logado, mais recentes primeiro.
export async function listarDespesas(donoId: string): Promise<Despesa[]> {
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
        })) as Despesa[];
    } catch (error) {
        console.error("[despesasService] Erro ao listar despesas:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Cria uma nova despesa vinculada ao usuário logado.
export async function criarDespesa(donoId: string, dados: DespesaFormData): Promise<void> {
    try {
        await addDoc(collection(db, COLECAO), {
            donoId,
            descricao: dados.descricao.trim(),
            valor: Number(dados.valor.replace(",", ".")) || 0,
            data: dados.data.trim(),
            criadoEm: Date.now(),
        });
    } catch (error) {
        console.error("[despesasService] Erro ao criar despesa:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Exclui uma despesa definitivamente.
export async function excluirDespesa(despesaId: string): Promise<void> {
    try {
        const despesaRef = doc(db, COLECAO, despesaId);
        await deleteDoc(despesaRef);
    } catch (error) {
        console.error("[despesasService] Erro ao excluir despesa:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}