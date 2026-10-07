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
import { Servico, ServicoFormData } from "../types/servico";

const COLECAO = "servicos";

function getFirestoreErrorMessage(): string {
    return "Não foi possível concluir. Verifique sua conexão e tente novamente.";
}

// Lista todos os serviços do usuário logado, mais recentes primeiro.
export async function listarServicos(donoId: string): Promise<Servico[]> {
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
        })) as Servico[];
    } catch (error) {
        console.error("[servicosService] Erro ao listar serviços:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Cria um novo serviço no catálogo do usuário logado.
export async function criarServico(donoId: string, dados: ServicoFormData): Promise<void> {
    try {
        await addDoc(collection(db, COLECAO), {
            donoId,
            nome: dados.nome.trim(),
            valorPadrao: Number(dados.valorPadrao.replace(",", ".")) || 0,
            descricao: dados.descricao.trim(),
            criadoEm: Date.now(),
        });
    } catch (error) {
        console.error("[servicosService] Erro ao criar serviço:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Atualiza um serviço já existente.
export async function atualizarServico(
    servicoId: string,
    dados: ServicoFormData
): Promise<void> {
    try {
        const servicoRef = doc(db, COLECAO, servicoId);
        await updateDoc(servicoRef, {
            nome: dados.nome.trim(),
            valorPadrao: Number(dados.valorPadrao.replace(",", ".")) || 0,
            descricao: dados.descricao.trim(),
        });
    } catch (error) {
        console.error("[servicosService] Erro ao atualizar serviço:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Exclui um serviço definitivamente.
export async function excluirServico(servicoId: string): Promise<void> {
    try {
        const servicoRef = doc(db, COLECAO, servicoId);
        await deleteDoc(servicoRef);
    } catch (error) {
        console.error("[servicosService] Erro ao excluir serviço:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}