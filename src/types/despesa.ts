export type Despesa = {
    id: string;
    donoId: string;
    descricao: string;
    valor: number;
    data: string; // ex: "26/05/2026"
    criadoEm: number;
};

export type DespesaFormData = {
    descricao: string;
    valor: string;
    data: string;
};