import { ItemOrcamento } from "./orcamento";

export type StatusOrdem = "agendado" | "em_andamento" | "concluido" | "cancelado";

// Estrutura de uma Ordem de Serviço, exatamente como existe no Firestore.
export type OrdemServico = {
  id: string;
  donoId: string;
  numero: number; // número sequencial de exibição (ex: OS #001)
  clienteId: string;
  clienteNome: string;
  itens: ItemOrcamento[]; // reaproveita o mesmo formato de item do orçamento
  total: number;
  status: StatusOrdem;
  dataAgendada: string; // ex: "26/05/2026"
  horaAgendada: string; // ex: "09:00"
  orcamentoOrigemId?: string; // se veio de um orçamento aprovado, guarda a referência
  pago: boolean;
  criadoEm: number;
};

// Usado no formulário de cadastro/edição.
export type OrdemServicoFormData = {
  clienteId: string;
  clienteNome: string;
  itens: ItemOrcamento[];
  dataAgendada: string;
  horaAgendada: string;
};