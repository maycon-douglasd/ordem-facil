import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { listarClientes } from "../services/clientesService";
import { listarOrdensServico } from "../services/ordensServicoService";
import { listarOrcamentos } from "../services/orcamentosService";
import { listarNotificacoes } from "../services/notificacoesService";
import { OrdemServico } from "../types/ordemServico";
import { colors, radius, spacing } from "../theme/colors";

// Converte "26/05/2026" + "09:00" em um objeto Date de verdade,
// para podermos comparar e ordenar corretamente por data/hora real
// (comparar como texto puro daria resultado errado).
function converterParaData(dataAgendada: string, horaAgendada: string): Date {
    const [dia, mes, ano] = dataAgendada.split("/").map(Number);
    const [hora, minuto] = horaAgendada.split(":").map(Number);
    return new Date(ano || 0, (mes || 1) - 1, dia || 1, hora || 0, minuto || 0);
}

// Formata a data de hoje por extenso, em português, tipo "Segunda-feira, 26 de maio".
function formatarDataHoje(): string {
    const hoje = new Date();
    const diasSemana = [
        "Domingo",
        "Segunda-feira",
        "Terça-feira",
        "Quarta-feira",
        "Quinta-feira",
        "Sexta-feira",
        "Sábado",
    ];
    const meses = [
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro",
    ];
    const diaSemana = diasSemana[hoje.getDay()];
    const dia = hoje.getDate();
    const mes = meses[hoje.getMonth()];
    return `${diaSemana}, ${dia} de ${mes}`;
}

export function DashboardScreen({ navigation }: any) {
    const { user, logout } = useAuth();
    const [loggingOut, setLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState<string | null>(null);

    const [quantidadeClientes, setQuantidadeClientes] = useState(0);
    const [quantidadeServicosAtivos, setQuantidadeServicosAtivos] = useState(0);
    const [quantidadeOrcamentos, setQuantidadeOrcamentos] = useState(0);
    const [quantidadeOrdensMes, setQuantidadeOrdensMes] = useState(0);
    const [proximosCompromissos, setProximosCompromissos] = useState<OrdemServico[]>([]);
    const [proximoPasso, setProximoPasso] = useState<string | null>(null);
    const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);

    useFocusEffect(
        useCallback(() => {
            if (!user) return;
            const usuarioLogado = user;

            async function buscarContagens() {
                try {
                    const [listaClientes, listaOrdens, listaOrcamentos, listaNotificacoes] = await Promise.all([
                        listarClientes(usuarioLogado.uid),
                        listarOrdensServico(usuarioLogado.uid),
                        listarOrcamentos(usuarioLogado.uid),
                        listarNotificacoes(usuarioLogado.uid),
                    ]);

                    setNotificacoesNaoLidas(listaNotificacoes.filter((n) => !n.lida).length);

                    setQuantidadeClientes(listaClientes.length);

                    const ordensAtivas = listaOrdens.filter(
                        (ordem) => ordem.status === "agendado" || ordem.status === "em_andamento"
                    );
                    setQuantidadeServicosAtivos(ordensAtivas.length);

                    setQuantidadeOrcamentos(listaOrcamentos.length);

                    const agora = new Date();
                    const ordensDoMes = listaOrdens.filter((ordem) => {
                        const dataOrdem = new Date(ordem.criadoEm);
                        return (
                            dataOrdem.getMonth() === agora.getMonth() &&
                            dataOrdem.getFullYear() === agora.getFullYear()
                        );
                    });
                    setQuantidadeOrdensMes(ordensDoMes.length);

                    const agendadas = listaOrdens
                        .filter((ordem) => ordem.status === "agendado")
                        .sort((a, b) => {
                            const dataA = converterParaData(a.dataAgendada, a.horaAgendada);
                            const dataB = converterParaData(b.dataAgendada, b.horaAgendada);
                            return dataA.getTime() - dataB.getTime();
                        })
                        .slice(0, 3);
                    setProximosCompromissos(agendadas);

                    const DOIS_DIAS_EM_MS = 2 * 24 * 60 * 60 * 1000;
                    const orcamentosParados = listaOrcamentos.filter((orcamento) => {
                        if (orcamento.status !== "pendente") return false;
                        return agora.getTime() - orcamento.criadoEm >= DOIS_DIAS_EM_MS;
                    });

                    const hojeTexto = `${agora.getDate().toString().padStart(2, "0")}/${(agora.getMonth() + 1)
                        .toString()
                        .padStart(2, "0")}/${agora.getFullYear()}`;
                    const ordensHoje = agendadas.filter((ordem) => ordem.dataAgendada === hojeTexto);

                    const ordensAtrasadas = listaOrdens.filter((ordem) => {
                        if (ordem.status !== "agendado") return false;
                        const dataOrdem = converterParaData(ordem.dataAgendada, ordem.horaAgendada);
                        return dataOrdem.getTime() < agora.getTime();
                    });

                    if (ordensAtrasadas.length > 0) {
                        setProximoPasso(
                            `⚠️ Você tem ${ordensAtrasadas.length} atendimento${ordensAtrasadas.length > 1 ? "s" : ""
                            } atrasado${ordensAtrasadas.length > 1 ? "s" : ""}. Atualize o status ou reagende.`
                        );
                    } else if (orcamentosParados.length > 0) {
                        setProximoPasso(
                            `Você tem ${orcamentosParados.length} orçamento${orcamentosParados.length > 1 ? "s" : ""
                            } aguardando resposta há mais de 2 dias. Considere enviar um lembrete.`
                        );
                    } else if (ordensHoje.length > 0) {
                        setProximoPasso(
                            `Você tem ${ordensHoje.length} atendimento${ordensHoje.length > 1 ? "s" : ""
                            } agendado${ordensHoje.length > 1 ? "s" : ""} para hoje.`
                        );
                    } else {
                        setProximoPasso("Tudo em dia!");
                    }
                } catch (err) {
                    console.error("[Dashboard] Erro ao buscar contagens:", err);
                }
            }

            buscarContagens();
        }, [user])
    );

    async function handleLogout() {
        setLogoutError(null);
        setLoggingOut(true);
        try {
            await logout();
        } catch (error: any) {
            setLogoutError(error?.message ?? "Não foi possível sair. Tente novamente.");
        } finally {
            setLoggingOut(false);
        }
    }

    const primeiroNome = user?.displayName?.split(" ")[0] ?? "Profissional";
    const dataHoje = formatarDataHoje();

    return (
        <View style={styles.flex}>
            {/* Header e Próximo passo ficam FIXOS, fora do ScrollView */}
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity onPress={() => navigation.openDrawer()}>

                        <Ionicons name="menu" size={26} color={colors.textInverse} />
                    </TouchableOpacity>

                    <Text style={styles.headerAppName}>Dashboard</Text>

                    <TouchableOpacity onPress={() => navigation.navigate("Notificacoes")} style={styles.sinoWrapper}>

                        <Ionicons name="notifications-outline" size={24} color={colors.textInverse} />
                        {notificacoesNaoLidas > 0 && (
                            <View style={styles.sinoBadge}>
                                <Text style={styles.sinoBadgeTexto}>
                                    {notificacoesNaoLidas > 9 ? "9+" : notificacoesNaoLidas}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                </View>

                <Text style={styles.greeting}>Olá, {primeiroNome}!</Text>

                <Text style={styles.headerSubtitle}>{dataHoje}</Text>
            </View>

            {proximoPasso && (
                <View style={styles.proximoPassoBox}>
                    <Text style={styles.proximoPassoIcone}>💡</Text>

                    <Text style={styles.proximoPassoTexto}>{proximoPasso}</Text>
                </View>
            )}

            {/* A partir daqui, tudo rola dentro do ScrollView */}
            <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
                <View style={styles.cardsGrid}>
                    <View style={styles.card}>
                        <Text style={[styles.cardValue, { color: colors.info }]}>{quantidadeServicosAtivos}</Text>

                        <View style={styles.cardBottomRow}>
                            <Text style={styles.cardLabel}>Serviços ativos</Text>

                            <Ionicons name="clipboard-outline" size={22} color={colors.info} />
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={[styles.cardValue, { color: colors.success }]}>{quantidadeOrdensMes}</Text>

                        <View style={styles.cardBottomRow}>
                            <Text style={styles.cardLabel}>Ordens este mês</Text>

                            <Ionicons name="calendar-outline" size={22} color={colors.success} />
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={[styles.cardValue, { color: colors.info }]}>{quantidadeClientes}</Text>
                        <View style={styles.cardBottomRow}>

                            <Text style={styles.cardLabel}>Clientes</Text>

                            <Ionicons name="people-outline" size={18} color={colors.info} />
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={[styles.cardValue, { color: colors.warning }]}>{quantidadeOrcamentos}</Text>

                        <View style={styles.cardBottomRow}>
                            <Text style={styles.cardLabel}>Orçamentos</Text>

                            <Ionicons name="document-text-outline" size={22} color={colors.warning} />
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.novoServicoButton}
                    onPress={() => navigation.navigate("NovaOrdemServico")}
                >
                    <Ionicons name="add" size={20} color={colors.textInverse} />

                    <Text style={styles.novoServicoText}>Novo serviço</Text>
                </TouchableOpacity>

                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Próximos compromissos</Text>

                        <TouchableOpacity onPress={() => navigation.navigate("OrdensServico")}>

                            <Text style={styles.sectionLink}>Ver todos</Text>
                        </TouchableOpacity>
                    </View>

                    {proximosCompromissos.length === 0 ? (
                        <View style={styles.emptyStateBox}>
                            <Text style={styles.emptyStateText}>Nenhum compromisso agendado ainda.</Text>
                        </View>
                    ) : (
                        proximosCompromissos.map((ordem) => (
                            <TouchableOpacity
                                key={ordem.id}
                                style={styles.compromissoCard}
                                onPress={() => navigation.navigate("DetalhesOrdem", { ordemId: ordem.id })}
                            >
                                <View style={styles.compromissoDot} />
                                <View style={styles.compromissoInfo}>
                                    <Text style={styles.compromissoCliente}>{ordem.clienteNome}</Text>

                                    <Text style={styles.compromissoServico}>
                                        {ordem.itens[0]?.descricao ?? "Serviço"}
                                        {ordem.itens.length > 1 ? ` +${ordem.itens.length - 1}` : ""}
                                    </Text>
                                </View>
                                <Text style={styles.compromissoData}>
                                    {ordem.dataAgendada} - {ordem.horaAgendada}
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Atalhos rápidos</Text>
                    <View style={styles.shortcutsGrid}>
                        <TouchableOpacity style={styles.shortcutCard} onPress={() => navigation.navigate("ClientesTab")}>

                            <Ionicons name="people-outline" size={22} color={colors.info} />

                            <Text style={styles.shortcutLabel}>Clientes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.shortcutCard} onPress={() => navigation.navigate("Orcamentos")}>
                            <Ionicons name="document-text-outline" size={22} color={colors.success} />

                            <Text style={styles.shortcutLabel}>Orçamentos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.shortcutCard} onPress={() => navigation.navigate("OrdensServico")}>

                            <Ionicons name="build-outline" size={22} color={colors.warning} />

                            <Text style={styles.shortcutLabel}>Ordens de Serviço</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.shortcutCard} onPress={() => navigation.navigate("AgendaTab")}>

                            <Ionicons name="calendar-outline" size={22} color={colors.primary} />

                            <Text style={styles.shortcutLabel}>Agenda</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {logoutError && <Text style={styles.errorText}>{logoutError}</Text>}

                <TouchableOpacity
                    onPress={handleLogout}
                    disabled={loggingOut}
                    style={[styles.logoutButton, loggingOut && styles.disabled]}
                >
                    <Text style={styles.logoutText}>{loggingOut ? "Saindo..." : "Sair"}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    scrollArea: { flex: 1 },
    scrollContent: { padding: spacing.lg, paddingBottom: spacing.xl },
    header: {
        backgroundColor: colors.primary,
        minHeight: 150,
        paddingTop: spacing.lg,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
        borderBottomLeftRadius: radius.lg * 1.5,
        borderBottomRightRadius: radius.lg * 1.5,
    },
    headerTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.lg,
    },
    headerAppName: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textInverse,
    },
    greeting: {
        fontSize: 22,
        fontWeight: "700",
        color: colors.textInverse,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.textInverse,
        opacity: 0.85,
        marginTop: spacing.xs,
    },
    sinoWrapper: {
        position: "relative",
    },
    sinoBadge: {
        position: "absolute",
        top: -4,
        right: -4,
        backgroundColor: colors.danger,
        borderRadius: radius.full,
        minWidth: 16,
        height: 16,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 3,
    },
    sinoBadgeTexto: {
        color: colors.textInverse,
        fontSize: 9,
        fontWeight: "700",
    },
    proximoPassoBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.infoBg,
        borderRadius: radius.md,
        padding: spacing.md,
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    proximoPassoIcone: {
        fontSize: 20,
    },
    proximoPassoTexto: {
        flex: 1,
        fontSize: 13,
        fontWeight: "500",
        color: colors.textPrimary,
        lineHeight: 18,
    },
    cardsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
        gap: spacing.sm,
    },
    card: {
        width: "47%",
        minHeight: 100,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        justifyContent: "space-between",
    },
    cardValue: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    cardBottomRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: spacing.sm,
    },
    cardLabel: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    novoServicoButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        height: 52,
        marginTop: spacing.lg,
    },
    novoServicoText: {
        color: colors.textInverse,
        fontSize: 15,
        fontWeight: "600",
    },
    section: {
        marginTop: spacing.lg,
    },
    sectionHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.sm,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    sectionLink: {
        fontSize: 13,
        color: colors.primary,
        fontWeight: "500",
    },
    emptyStateBox: {
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: "dashed",
        borderRadius: radius.md,
        padding: spacing.lg,
        alignItems: "center",
    },
    emptyStateText: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: "center",
    },
    compromissoCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    compromissoDot: {
        width: 8,
        height: 8,
        borderRadius: radius.full,
        backgroundColor: colors.info,
        marginRight: spacing.sm,
    },
    compromissoInfo: {
        flex: 1,
    },
    compromissoCliente: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    compromissoServico: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: spacing.xs / 2,
    },
    compromissoData: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: "right",
    },
    shortcutsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
    },
    shortcutCard: {
        width: "47%",
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        alignItems: "center",
        gap: spacing.xs,
    },
    shortcutLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textPrimary,
        textAlign: "center",
    },
    errorText: {
        color: colors.danger,
        textAlign: "center",
        marginTop: spacing.md,
        fontSize: 13,
    },
    logoutButton: {
        marginTop: spacing.lg,
        height: 48,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
    },
    disabled: { opacity: 0.6 },
    logoutText: {
        color: colors.danger,
        fontWeight: "600",
    },
});