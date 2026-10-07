// Validação no cliente: evita chamada desnecessária ao Firebase quando o
// próprio campo já está claramente errado, e dá feedback mais rápido ao usuário.
// Isso NÃO substitui a validação no backend (Firestore Security Rules) —
// é só a primeira camada.

export function isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
}

export function isValidPassword(password: string): boolean {
    return password.length >= 6;
}

export function validateLoginForm(email: string, password: string): string | null {
    if (!email.trim()) return "Informe seu e-mail.";
    if (!isValidEmail(email)) return "Informe um e-mail válido.";
    if (!password) return "Informe sua senha.";
    return null;
}

export function validateRegisterForm(
    nome: string,
    email: string,
    password: string,
    confirmarSenha: string
): string | null {
    if (!nome.trim()) return "Informe seu nome.";
    if (!email.trim()) return "Informe seu e-mail.";
    if (!isValidEmail(email)) return "Informe um e-mail válido.";
    if (!isValidPassword(password)) return "A senha precisa ter pelo menos 6 caracteres.";
    if (password !== confirmarSenha) return "As senhas não coincidem.";
    return null;
}

// Valida se o texto está no formato DD/MM/AAAA, com dia/mês/ano dentro
// de intervalos plausíveis (não valida se a data "existe de verdade",
// tipo 31/02, mas evita erros grosseiros de digitação).
export function isValidData(data: string): boolean {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(data)) return false;

    const [dia, mes, ano] = data.split("/").map(Number);
    if (mes < 1 || mes > 12) return false;
    if (dia < 1 || dia > 31) return false;
    if (ano < 2000 || ano > 2100) return false;

    return true;
}

// Valida se o texto está no formato HH:MM, com hora de 00-23 e
// minuto de 00-59.
export function isValidHora(hora: string): boolean {
    const regex = /^\d{2}:\d{2}$/;
    if (!regex.test(hora)) return false;

    const [h, m] = hora.split(":").map(Number);
    if (h < 0 || h > 23) return false;
    if (m < 0 || m > 59) return false;

    return true;
}