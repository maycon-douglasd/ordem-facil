// Um item dentro do orçamento — pode ter vindo do catálogo de Serviços,
// ou ter sido digitado avulso, direto no orçamento.
export type ItemOrcamento = {
    descricao: string;
    valor: number;
};

// Estrutura de um Orçamento, exatamente como existe no Firestore.
export type Orcamento = {
    id: string;
    donoId: string;
    clienteId: string;
    clienteNome: string; // guardamos uma cópia do nome, para não precisar buscar o cliente toda vez que listamos orçamentos
    itens: ItemOrcamento[];
    total: number; // soma calculada dos itens
    status: "pendente" | "aprovado" | "recusado";
    criadoEm: number;
};

// Usado no formulário de cadastro/edição.
export type OrcamentoFormData = {
    clienteId: string;
    clienteNome: string;
    itens: ItemOrcamento[];
};