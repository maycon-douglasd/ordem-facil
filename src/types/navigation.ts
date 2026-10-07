// Define quais telas existem em cada "pilha" de navegação e quais parâmetros elas recebem.
// Isso evita erros bobos como navigation.navigate("Diashboard") — o TypeScript acusa na hora.

export type AuthStackParamList = {
  Login: undefined;
  Cadastro: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  NovoCliente: undefined;
  EditarCliente: { clienteId: string };
  NovoServico: undefined;
  EditarServico: { servicoId: string };
  Orcamentos: undefined;
  NovoOrcamento: undefined;
  EditarOrcamento: { orcamentoId: string };
  DetalhesOrcamento: { orcamentoId: string };
  OrdensServico: undefined;
  NovaOrdemServico: undefined;
  EditarOrdemServico: { ordemId: string };
  DetalhesOrdem: { ordemId: string };
  Perfil: undefined;
  MeuPlano: undefined;
  MinhaEmpresa: undefined;
  Configuracoes: undefined;
  CentralAjuda: undefined;
  Notificacoes: undefined;
  NovaDespesa: undefined;
  FinanceiroCompleto: undefined;
};


// Rotas dentro da barra de abas inferior.
export type TabParamList = {
  Inicio: undefined;
  ClientesTab: undefined;
  ServicosTab: undefined;
  AgendaTab: { titulo: string };
  FinanceiroTab: { titulo: string };
};