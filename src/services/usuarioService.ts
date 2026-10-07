import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { EmpresaFormData, Plano, UsuarioConfig } from "../types/usuario";

const COLECAO = "usuarios";

function getFirestoreErrorMessage(): string {
    return "Não foi possível concluir. Verifique sua conexão e tente novamente.";
}

// Cria o documento de configuração do usuário, com plano "gratis" por
// padrão. Chamado uma vez, logo após o cadastro.
export async function criarConfigUsuario(usuarioId: string): Promise<void> {
    try {
        const usuarioRef = doc(db, COLECAO, usuarioId);
        await setDoc(usuarioRef, {
            plano: "gratis" as Plano,
            criadoEm: Date.now(),
        });
    } catch (error) {
        console.error("[usuarioService] Erro ao criar configuração do usuário:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Garante que o documento de configuração existe, sem sobrescrever dados
// já salvos. Usado no login, para "consertar" contas antigas (criadas
// antes dessa funcionalidade existir) que ainda não têm esse documento.
export async function garantirConfigUsuario(usuarioId: string): Promise<void> {
    try {
        const usuarioRef = doc(db, COLECAO, usuarioId);
        const snapshot = await getDoc(usuarioRef);

        if (!snapshot.exists()) {
            await setDoc(usuarioRef, {
                plano: "gratis" as Plano,
                criadoEm: Date.now(),
            });
        }
    } catch (error) {
        // Não lançamos erro aqui de propósito: se isso falhar, não deve
        // impedir o login de acontecer — o app continua funcionando com
        // os valores padrão seguros que já implementamos em cada busca.
        console.error("[usuarioService] Erro ao garantir configuração do usuário:", error);
    }
}

// Busca os dados de empresa do usuário. Se não existir nada ainda,
// retorna campos vazios (não é erro, é só a primeira vez preenchendo).
export async function buscarDadosEmpresa(usuarioId: string): Promise<EmpresaFormData> {
    try {
        const usuarioRef = doc(db, COLECAO, usuarioId);
        const snapshot = await getDoc(usuarioRef);

        if (!snapshot.exists()) {
            return { nomeEmpresa: "", cnpj: "", endereco: "" };
        }

        const dados = snapshot.data() as UsuarioConfig;
        return {
            nomeEmpresa: dados.nomeEmpresa ?? "",
            cnpj: dados.cnpj ?? "",
            endereco: dados.endereco ?? "",
        };
    } catch (error) {
        console.error("[usuarioService] Erro ao buscar dados da empresa:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Salva os dados de empresa do usuário.
export async function salvarDadosEmpresa(
    usuarioId: string,
    dados: EmpresaFormData
): Promise<void> {
    try {
        const usuarioRef = doc(db, COLECAO, usuarioId);
        await updateDoc(usuarioRef, {
            nomeEmpresa: dados.nomeEmpresa.trim(),
            cnpj: dados.cnpj.trim(),
            endereco: dados.endereco.trim(),
        });
    } catch (error) {
        console.error("[usuarioService] Erro ao salvar dados da empresa:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Busca se as notificações estão ativas. Por padrão, consideramos
// ativas (true) se o campo ainda não foi definido — é o comportamento
// mais comum em apps (notificações ligadas por padrão, usuário desliga
// se quiser).
export async function buscarNotificacoesAtivas(usuarioId: string): Promise<boolean> {
    try {
        const usuarioRef = doc(db, COLECAO, usuarioId);
        const snapshot = await getDoc(usuarioRef);

        if (!snapshot.exists()) {
            return true;
        }

        const dados = snapshot.data() as UsuarioConfig;
        return dados.notificacoesAtivas ?? true;
    } catch (error) {
        console.error("[usuarioService] Erro ao buscar notificações:", error);
        return true;
    }
}

// Ativa ou desativa as notificações. Usa setDoc com merge (em vez de
// updateDoc) para funcionar mesmo se o documento do usuário ainda não
// existir por algum motivo — nesse caso, ele é criado na hora, com só
// esse campo, sem apagar nada que já existisse.
export async function definirNotificacoesAtivas(
    usuarioId: string,
    ativas: boolean
): Promise<void> {
    try {
        const usuarioRef = doc(db, COLECAO, usuarioId);
        await setDoc(usuarioRef, { notificacoesAtivas: ativas }, { merge: true });
    } catch (error) {
        console.error("[usuarioService] Erro ao atualizar notificações:", error);
        throw new Error(getFirestoreErrorMessage());
    }
}

// Busca o plano atual do usuário. Se o documento ainda não existir
// (ex: contas criadas antes dessa funcionalidade existir), assume "gratis"
// como padrão seguro, em vez de travar o app com um erro.
export async function buscarPlanoUsuario(usuarioId: string): Promise<Plano> {
    try {
        const usuarioRef = doc(db, COLECAO, usuarioId);
        const snapshot = await getDoc(usuarioRef);

        if (!snapshot.exists()) {
            return "gratis";
        }

        const dados = snapshot.data() as UsuarioConfig;
        return dados.plano ?? "gratis";
    } catch (error) {
        console.error("[usuarioService] Erro ao buscar plano do usuário:", error);
        // Em caso de erro, assumimos "gratis" por segurança — nunca liberamos
        // acesso ilimitado por causa de uma falha de rede, por exemplo.
        return "gratis";
    }
}