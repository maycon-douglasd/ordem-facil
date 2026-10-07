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
import { Orcamento, OrcamentoFormData } from "../types/orcamento";
import { buscarPlanoUsuario } from "./usuarioService";

const LIMITE_ORCAMENTOS_MES_GRATIS = 3;

export class LimitePlanoError extends Error {
    constructor(mensagem: string) {
        super(mensagem);
        this.name = "LimitePlanoError";
    }
}

const COLECAO = "orcamentos";

function getFirestoreErrorMessage(): string {
    return "Não foi possível concluir. Verifique sua conexão e tente novamente.";
}

// Soma o valor de todos os itens de um orçamento.
function calcularTotal(dados: OrcamentoFormData): number {
    return dados.itens.reduce((soma, item) => soma + item.valor, 0);
}

// Lista todos os orçamentos do usuário logado, mais recentes primeiro.
export async function listarOrcamentos(donoId: string): Promise<Orcamento[]> {
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
        })) as Orcamento[];
    } catch (error) {
        console.error("[orcamentosService] Erro ao listar orçamentos:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Cria um novo orçamento vinculado ao usuário logado.
export async function criarOrcamento(donoId: string, dados: OrcamentoFormData): Promise<void> {
    const plano = await buscarPlanoUsuario(donoId);

    if (plano === "gratis") {
        const todosOrcamentos = await listarOrcamentos(donoId);
        const agora = new Date();
        const orcamentosDoMes = todosOrcamentos.filter((orcamento) => {
            const dataOrcamento = new Date(orcamento.criadoEm);
            return (
                dataOrcamento.getMonth() === agora.getMonth() &&
                dataOrcamento.getFullYear() === agora.getFullYear()
            );
        });

        if (orcamentosDoMes.length >= LIMITE_ORCAMENTOS_MES_GRATIS) {
            throw new LimitePlanoError(
                `O plano gratuito permite até ${LIMITE_ORCAMENTOS_MES_GRATIS} orçamentos por mês. Assine o plano Profissional para orçamentos ilimitados.`
            );
        }
    }

    try {
        await addDoc(collection(db, COLECAO), {
            donoId,
            clienteId: dados.clienteId,
            clienteNome: dados.clienteNome,
            itens: dados.itens,
            total: calcularTotal(dados),
            status: "pendente",
            criadoEm: Date.now(),
        });
    } catch (error) {
        console.error("[orcamentosService] Erro ao criar orçamento:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Atualiza um orçamento já existente.
export async function atualizarOrcamento(
    orcamentoId: string,
    dados: OrcamentoFormData
): Promise<void> {
    try {
        const orcamentoRef = doc(db, COLECAO, orcamentoId);
        await updateDoc(orcamentoRef, {
            clienteId: dados.clienteId,
            clienteNome: dados.clienteNome,
            itens: dados.itens,
            total: calcularTotal(dados),
        });
    } catch (error) {
        console.error("[orcamentosService] Erro ao atualizar orçamento:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Muda o status do orçamento (usado ao aprovar/recusar).
export async function atualizarStatusOrcamento(
    orcamentoId: string,
    status: "pendente" | "aprovado" | "recusado"
): Promise<void> {
    try {
        const orcamentoRef = doc(db, COLECAO, orcamentoId);
        await updateDoc(orcamentoRef, { status });
    } catch (error) {
        console.error("[orcamentosService] Erro ao atualizar status:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Exclui um orçamento definitivamente.
export async function excluirOrcamento(orcamentoId: string): Promise<void> {
    try {
        const orcamentoRef = doc(db, COLECAO, orcamentoId);
        await deleteDoc(orcamentoRef);
    } catch (error) {
        console.error("[orcamentosService] Erro ao excluir orçamento:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}