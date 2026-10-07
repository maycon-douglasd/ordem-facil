import NetInfo from "@react-native-community/netinfo";

// Verifica se o dispositivo está conectado à internet, antes de tentar
// qualquer operação no Firestore. Isso evita que o app fique "preso"
// esperando o Firebase desistir sozinho (o que pode demorar bastante),
// mostrando um erro amigável imediatamente quando não há conexão.
export async function temConexaoComInternet(): Promise<boolean> {
    try {
        const estado = await NetInfo.fetch();
        return !!estado.isConnected && !!estado.isInternetReachable;
    } catch (error) {
        // Se a própria checagem falhar, assumimos que não tem conexão,
        // por segurança — evita tentar uma operação que provavelmente
        // vai falhar de qualquer forma.
        console.error("[conexao] Erro ao verificar conexão:", error);
        return false;
    }
}

export const MENSAGEM_SEM_CONEXAO =
    "Sem conexão com a internet. Verifique sua rede e tente novamente.";