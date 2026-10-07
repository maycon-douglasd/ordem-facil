export type TipoNotificacao = "orcamento_aprovado" | "ordem_criada";

// Estrutura de uma Notificação, exatamente como existe no Firestore.
export type Notificacao = {
  id: string;
  donoId: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criadoEm: number;
};