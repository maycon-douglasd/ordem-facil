// O Firebase retorna códigos técnicos como "auth/invalid-credential".
// Essa função converte isso em algo que o profissional (nosso usuário final)
// realmente entende. Regra do projeto: nunca mostrar erro técnico cru na tela.

export function getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
        case "auth/invalid-email":
            return "E-mail inválido. Confira e tente novamente.";
        case "auth/user-not-found":
        case "auth/invalid-credential":
        case "auth/wrong-password":
            return "E-mail ou senha incorretos.";
        case "auth/email-already-in-use":
            return "Já existe uma conta com esse e-mail.";
        case "auth/weak-password":
            return "A senha precisa ter pelo menos 6 caracteres.";
        case "auth/too-many-requests":
            return "Muitas tentativas seguidas. Aguarde um pouco e tente de novo.";
        case "auth/network-request-failed":
            return "Sem conexão com a internet. Verifique sua rede.";
        default:
            return "Não foi possível concluir. Tente novamente em instantes.";
    }
}