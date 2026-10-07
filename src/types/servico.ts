// Estrutura de um Serviço no catálogo do profissional, exatamente
// como existe no Firestore. É o "modelo" reaproveitável na hora de
// montar um orçamento (ex: "Instalação de ar-condicionado — R$ 250").

export type Servico = {
    id: string; // gerado automaticamente pelo Firestore
    donoId: string; // ID do profissional dono deste serviço
    nome: string;
    valorPadrao: number; // valor sugerido, em reais (pode ser ajustado depois, no orçamento)
    descricao?: string; // opcional
    criadoEm: number; // timestamp de quando foi cadastrado
};

// Usado no formulário de cadastro/edição — sem os campos que o
// sistema preenche sozinho.
export type ServicoFormData = {
    nome: string;
    valorPadrao: string; // string no formulário (o usuário digita texto), convertido pra número ao salvar
    descricao: string;
};