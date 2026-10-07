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
import { Cliente, ClienteFormData } from "../types/cliente";
import { buscarPlanoUsuario } from "./usuarioService";

const LIMITE_CLIENTES_GRATIS = 5;

// Erro específico para quando o limite do plano é atingido — permite
// que a tela identifique esse caso e mostre uma mensagem/modal diferente
// de um erro comum de rede.
export class LimitePlanoError extends Error {
    constructor(mensagem: string) {
        super(mensagem);
        this.name = "LimitePlanoError";
    }
}

const COLECAO = "clientes";

// Mensagem amigável reaproveitada em qualquer erro de Firestore aqui,
// já que os códigos de erro do Firestore são bem técnicos
// (ex: "permission-denied", "unavailable").
function getFirestoreErrorMessage(): string {
    return "Não foi possível concluir. Verifique sua conexão e tente novamente.";
}

// Lista todos os clientes do usuário logado, mais recentes primeiro.
export async function listarClientes(donoId: string): Promise<Cliente[]> {
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
        })) as Cliente[];
    } catch (error) {
        console.error("[clientesService] Erro ao listar clientes:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Cria um novo cliente vinculado ao usuário logado.
export async function criarCliente(donoId: string, dados: ClienteFormData): Promise<void> {
    const plano = await buscarPlanoUsuario(donoId);

    if (plano === "gratis") {
        const clientesAtuais = await listarClientes(donoId);
        if (clientesAtuais.length >= LIMITE_CLIENTES_GRATIS) {
            throw new LimitePlanoError(
                `O plano gratuito permite até ${LIMITE_CLIENTES_GRATIS} clientes. Assine o plano Profissional para cadastrar clientes ilimitados.`
            );
        }
    }

    try {
        await addDoc(collection(db, COLECAO), {
            donoId,
            nome: dados.nome.trim(),
            telefone: dados.telefone.trim(),
            whatsapp: dados.whatsapp.trim(),
            email: dados.email.trim(),
            cep: dados.cep.trim(),
            rua: dados.rua.trim(),
            numero: dados.numero.trim(),
            bairro: dados.bairro.trim(),
            cidade: dados.cidade.trim(),
            estado: dados.estado.trim(),
            observacoes: dados.observacoes.trim(),
            criadoEm: Date.now(),
        });
    } catch (error) {
        console.error("[clientesService] Erro ao criar cliente:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Atualiza um cliente já existente.
export async function atualizarCliente(
    clienteId: string,
    dados: ClienteFormData
): Promise<void> {
    try {
        const clienteRef = doc(db, COLECAO, clienteId);
        await updateDoc(clienteRef, {
            nome: dados.nome.trim(),
            telefone: dados.telefone.trim(),
            whatsapp: dados.whatsapp.trim(),
            email: dados.email.trim(),
            cep: dados.cep.trim(),
            rua: dados.rua.trim(),
            numero: dados.numero.trim(),
            bairro: dados.bairro.trim(),
            cidade: dados.cidade.trim(),
            estado: dados.estado.trim(),
            observacoes: dados.observacoes.trim(),
        });
    } catch (error) {
        console.error("[clientesService] Erro ao atualizar cliente:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Exclui um cliente definitivamente.
export async function excluirCliente(clienteId: string): Promise<void> {
    try {
        const clienteRef = doc(db, COLECAO, clienteId);
        await deleteDoc(clienteRef);
    } catch (error) {
        console.error("[clientesService] Erro ao excluir cliente:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}