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
import { OrdemServico, OrdemServicoFormData, StatusOrdem } from "../types/ordemServico";
import { buscarPlanoUsuario } from "./usuarioService";

const COLECAO = "ordens_servico";
const LIMITE_ORDENS_MES_GRATIS = 3;

// Erro específico para quando o limite do plano é atingido — permite
// que a tela identifique esse caso e mostre uma mensagem/modal diferente
// de um erro comum de rede.
export class LimitePlanoError extends Error {
    constructor(mensagem: string) {
        super(mensagem);
        this.name = "LimitePlanoError";
    }
}

function getFirestoreErrorMessage(): string {
    return "Não foi possível concluir. Verifique sua conexão e tente novamente.";
}

function calcularTotal(dados: OrdemServicoFormData): number {
    return dados.itens.reduce((soma, item) => soma + item.valor, 0);
}

// Lista todas as ordens de serviço do usuário logado, mais recentes primeiro.
export async function listarOrdensServico(donoId: string): Promise<OrdemServico[]> {
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
        })) as OrdemServico[];
    } catch (error) {
        console.error("[ordensServicoService] Erro ao listar ordens:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Descobre qual seria o próximo número sequencial (ex: se a última foi
// OS #005, a próxima é #006). Busca todas as ordens e pega o maior número.
async function proximoNumero(donoId: string): Promise<number> {
    const lista = await listarOrdensServico(donoId);
    if (lista.length === 0) return 1;
    const maiorNumero = Math.max(...lista.map((o) => o.numero));
    return maiorNumero + 1;
}

// Cria uma nova ordem de serviço vinculada ao usuário logado.
export async function criarOrdemServico(
    donoId: string,
    dados: OrdemServicoFormData,
    orcamentoOrigemId?: string
): Promise<void> {
    const plano = await buscarPlanoUsuario(donoId);

    if (plano === "gratis") {
        const todasAsOrdens = await listarOrdensServico(donoId);
        const agora = new Date();
        const ordensDoMes = todasAsOrdens.filter((ordem) => {
            const dataOrdem = new Date(ordem.criadoEm);
            return (
                dataOrdem.getMonth() === agora.getMonth() &&
                dataOrdem.getFullYear() === agora.getFullYear()
            );
        });

        if (ordensDoMes.length >= LIMITE_ORDENS_MES_GRATIS) {
            throw new LimitePlanoError(
                `O plano gratuito permite até ${LIMITE_ORDENS_MES_GRATIS} ordens de serviço por mês. Assine o plano Profissional para ordens ilimitadas.`
            );
        }
    }

    try {
        const numero = await proximoNumero(donoId);
        await addDoc(collection(db, COLECAO), {
            donoId,
            numero,
            clienteId: dados.clienteId,
            clienteNome: dados.clienteNome,
            itens: dados.itens,
            total: calcularTotal(dados),
            status: "agendado" as StatusOrdem,
            dataAgendada: dados.dataAgendada,
            horaAgendada: dados.horaAgendada,
            orcamentoOrigemId: orcamentoOrigemId ?? null,
            pago: false,
            criadoEm: Date.now(),
        });
    } catch (error) {
        console.error("[ordensServicoService] Erro ao criar ordem:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Atualiza os dados de uma ordem de serviço já existente (cliente, itens,
// data, hora) — diferente de atualizarStatusOrdem, que só muda o status.
export async function atualizarOrdemServico(
    ordemId: string,
    dados: OrdemServicoFormData
): Promise<void> {
    try {
        const ordemRef = doc(db, COLECAO, ordemId);
        await updateDoc(ordemRef, {
            clienteId: dados.clienteId,
            clienteNome: dados.clienteNome,
            itens: dados.itens,
            total: calcularTotal(dados),
            dataAgendada: dados.dataAgendada,
            horaAgendada: dados.horaAgendada,
        });
    } catch (error) {
        console.error("[ordensServicoService] Erro ao atualizar ordem:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Atualiza só o status da ordem (usado nos botões de mudança de status).
export async function atualizarStatusOrdem(
    ordemId: string,
    status: StatusOrdem
): Promise<void> {
    try {
        const ordemRef = doc(db, COLECAO, ordemId);
        await updateDoc(ordemRef, { status });
    } catch (error) {
        console.error("[ordensServicoService] Erro ao atualizar status:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Marca (ou desmarca) uma ordem de serviço como paga.
export async function definirOrdemPaga(ordemId: string, pago: boolean): Promise<void> {
    try {
        const ordemRef = doc(db, COLECAO, ordemId);
        await updateDoc(ordemRef, { pago });
    } catch (error) {
        console.error("[ordensServicoService] Erro ao atualizar pagamento:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Exclui uma ordem de serviço definitivamente.
export async function excluirOrdemServico(ordemId: string): Promise<void> {
    try {
        const ordemRef = doc(db, COLECAO, ordemId);
        await deleteDoc(ordemRef);
    } catch (error) {
        console.error("[ordensServicoService] Erro ao excluir ordem:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}