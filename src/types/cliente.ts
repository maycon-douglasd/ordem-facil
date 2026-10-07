// Estrutura de um Cliente, exatamente como ele existe no Firestore.
// Sempre que mexer na coleção "clientes", esse é o "contrato" que
// todo o app segue.

export type Cliente = {
    id: string; // gerado automaticamente pelo Firestore
    donoId: string; // ID do profissional dono deste cliente (bate com as Security Rules)
    nome: string;
    telefone: string;
    whatsapp?: string; // opcional — nem todo cliente informa
    email?: string; // opcional
    cep?: string;
    rua?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    observacoes?: string; // opcional
    criadoEm: number; // timestamp de quando foi cadastrado
};

// Usado no formulário de cadastro/edição — ainda sem "id", "donoId" e
// "criadoEm", porque esses são preenchidos automaticamente pelo sistema,
// não digitados pelo usuário.
export type ClienteFormData = {
    nome: string;
    telefone: string;
    whatsapp: string;
    email: string;
    cep: string;
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    observacoes: string;
};