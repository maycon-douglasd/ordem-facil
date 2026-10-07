import React, { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import {
    atualizarStatusOrcamento,
    excluirOrcamento,
    listarOrcamentos,
} from "../services/orcamentosService";
import { criarOrdemServico } from "../services/ordensServicoService";
import { criarNotificacao } from "../services/notificacoesService";
import { Orcamento } from "../types/orcamento";
import { colors, radius, spacing } from "../theme/colors";
import { BackButton } from "../components/BackButton";
import { Button } from "../components/Button";

export function OrcamentosScreen({ navigation }: any) {
    const { user } = useAuth();

    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [orcamentoParaAprovar, setOrcamentoParaAprovar] = useState<Orcamento | null>(null);
    const [dataAgendada, setDataAgendada] = useState("");
    const [horaAgendada, setHoraAgendada] = useState("");
    const [aprovando, setAprovando] = useState(false);

    async function carregarOrcamentos(mostrarLoadingInicial: boolean) {
        if (!user) return;

        setError(null);
        if (mostrarLoadingInicial) {
            setLoading(true);
        }

        try {
            const lista = await listarOrcamentos(user.uid);
            setOrcamentos(lista);
        } catch (err: any) {
            setError(err?.message ?? "Não foi possível carregar os orçamentos.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarOrcamentos(true);
        }, [user])
    );

    function handleRefresh() {
        setRefreshing(true);
        carregarOrcamentos(false);
    }

    function handleExcluir(orcamento: Orcamento) {
        Alert.alert(
            "Excluir orçamento",
            `Tem certeza que deseja excluir o orçamento de "${orcamento.clienteNome}"? Essa ação não pode ser desfeita.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await excluirOrcamento(orcamento.id);
                            setOrcamentos((atual) => atual.filter((o) => o.id !== orcamento.id));
                        } catch (err: any) {
                            Alert.alert("Erro", err?.message ?? "Não foi possível excluir o orçamento.");
                        }
                    },
                },
            ]
        );
    }

    function abrirModalAprovacao(orcamento: Orcamento) {
        setOrcamentoParaAprovar(orcamento);
        setDataAgendada("");
        setHoraAgendada("");
    }

    async function confirmarAprovacao() {
        if (!user || !orcamentoParaAprovar) return;

        if (!dataAgendada.trim() || !horaAgendada.trim()) {
            Alert.alert("Dados incompletos", "Informe a data e a hora do serviço.");
            return;
        }

        setAprovando(true);
        try {
            // 1. Muda o status do orçamento para "aprovado"
            await atualizarStatusOrcamento(orcamentoParaAprovar.id, "aprovado");

            // 2. Cria a Ordem de Serviço a partir dos mesmos dados do orçamento
            await criarOrdemServico(
                user.uid,
                {
                    clienteId: orcamentoParaAprovar.clienteId,
                    clienteNome: orcamentoParaAprovar.clienteNome,
                    itens: orcamentoParaAprovar.itens,
                    dataAgendada,
                    horaAgendada,
                },
                orcamentoParaAprovar.id
            );

            // 3. Atualiza a lista local, sem precisar buscar tudo de novo
            setOrcamentos((atual) =>
                atual.map((o) =>
                    o.id === orcamentoParaAprovar.id ? { ...o, status: "aprovado" } : o
                )
            );

            setOrcamentoParaAprovar(null);
            Alert.alert("Sucesso", "Orçamento aprovado! A ordem de serviço foi criada.");

            await criarNotificacao(
                user.uid,
                "orcamento_aprovado",
                "Orçamento aprovado",
                `O orçamento de ${orcamentoParaAprovar.clienteNome} foi aprovado e uma ordem de serviço foi criada.`
            );

            setOrcamentoParaAprovar(null);
            Alert.alert("Sucesso", "Orçamento aprovado! A ordem de serviço foi criada.");
        } catch (err: any) {
            Alert.alert("Erro", err?.message ?? "Não foi possível aprovar o orçamento.");
        } finally {
            setAprovando(false);
        }
    }

    function getStatusInfo(status: Orcamento["status"]) {
        switch (status) {
            case "aprovado":
                return { texto: "Aprovado", cor: colors.success, fundo: colors.successBg };
            case "recusado":
                return { texto: "Recusado", cor: colors.danger, fundo: colors.dangerBg };
            default:
                return { texto: "Pendente", cor: colors.warning, fundo: colors.warningBg };
        }
    }


    if (loading) {
        return (
            <View style={styles.centered}>
                <Text style={styles.loadingText}>Carregando orçamentos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.flex}>
            <View style={styles.header}>
                <View style={styles.headerRow}>

                    <View style={styles.backButtonWrapper}>
                        <BackButton onPress={() => navigation.goBack()} />
                    </View>

                    <Text style={styles.headerTitle}>Orçamentos</Text>
                </View>
            </View>

            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <FlatList
                data={orcamentos}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>
                            Nenhum orçamento cadastrado ainda.{"\n"}Toque no botão abaixo para começar.
                        </Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const statusInfo = getStatusInfo(item.status);
                    return (
                        <TouchableOpacity
                            style={styles.orcamentoCard}
                            onPress={() => navigation.navigate("DetalhesOrcamento", { orcamentoId: item.id })}
                        >
                            <View style={styles.orcamentoTopRow}>
                                <Text style={styles.orcamentoCliente}>{item.clienteNome}</Text>

                                <View style={[styles.statusBadge, { backgroundColor: statusInfo.fundo }]}>

                                    <Text style={[styles.statusText, { color: statusInfo.cor }]}>
                                        {statusInfo.texto}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.orcamentoBottomRow}>
                                <Text style={styles.orcamentoTotal}>
                                    R$ {item.total.toFixed(2).replace(".", ",")}
                                </Text>

                                <View style={styles.orcamentoActions}>
                                    {item.status === "pendente" && (
                                        <TouchableOpacity
                                            onPress={() => abrirModalAprovacao(item)}
                                            style={styles.approveButton}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <Text style={styles.approveButtonText}>Aprovar</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        onPress={() => handleExcluir(item)}
                                        style={styles.deleteButton}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Text style={styles.deleteButtonText}>Excluir</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate("NovoOrcamento")}
            >
                <Text style={styles.fabText}>+ Novo orçamento</Text>
            </TouchableOpacity>

            <Modal
                visible={!!orcamentoParaAprovar}
                animationType="slide"
                transparent
                onRequestClose={() => setOrcamentoParaAprovar(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Aprovar orçamento</Text>
                        <Text style={styles.modalSubtitle}>
                            Informe quando o serviço será realizado. Isso vai gerar uma nova Ordem de Serviço.
                        </Text>

                        <Text style={styles.modalLabel}>Data</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="DD/MM/AAAA"
                            placeholderTextColor={colors.textSecondary}
                            value={dataAgendada}
                            onChangeText={setDataAgendada}
                        />

                        <Text style={styles.modalLabel}>Hora</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="HH:MM"
                            placeholderTextColor={colors.textSecondary}
                            value={horaAgendada}
                            onChangeText={setHoraAgendada}
                        />

                        <Button
                            label="Confirmar aprovação"
                            onPress={confirmarAprovacao}
                            loading={aprovando}
                        />

                        <Button
                            label="Cancelar"
                            variant="secondary"
                            onPress={() => setOrcamentoParaAprovar(null)}
                            disabled={aprovando}
                            style={styles.modalCancelButton}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}


const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
    },
    loadingText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    header: {
        backgroundColor: colors.primary,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    headerRow: {
        alignItems: "center",
        justifyContent: "center",
    },
    backButtonWrapper: {
        position: "absolute",
        left: 0,
        zIndex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: colors.textInverse,
    },
    errorBanner: {
        backgroundColor: colors.dangerBg,
        padding: spacing.sm,
        marginHorizontal: spacing.lg,
        marginTop: spacing.sm,
        borderRadius: radius.sm,
    },
    errorText: {
        color: colors.danger,
        fontSize: 13,
        textAlign: "center",
    },
    listContent: {
        padding: spacing.lg,
        flexGrow: 1,
    },
    emptyText: {
        textAlign: "center",
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 22,
    },
    orcamentoCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    orcamentoTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.sm,
    },
    orcamentoCliente: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textPrimary,
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs / 2,
        borderRadius: radius.full,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "600",
    },
    orcamentoBottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    orcamentoTotal: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.success,
    },
    orcamentoActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
    },
    approveButton: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        backgroundColor: colors.successBg,
        borderRadius: radius.sm,
    },
    approveButtonText: {
        color: colors.success,
        fontSize: 13,
        fontWeight: "600",
    },
    deleteButton: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
    deleteButtonText: {
        color: colors.danger,
        fontSize: 13,
        fontWeight: "600",
    },
    fab: {
        position: "absolute",
        bottom: spacing.lg,
        left: spacing.lg,
        right: spacing.lg,
        height: 52,
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
    },
    fabText: {
        color: colors.textInverse,
        fontSize: 16,
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        padding: spacing.lg,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    modalSubtitle: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: spacing.md,
        lineHeight: 18,
    },
    modalLabel: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    modalInput: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.md,
        fontSize: 15,
        color: colors.textPrimary,
        backgroundColor: colors.background,
        marginBottom: spacing.sm,
    },
    modalCancelButton: {
        marginTop: spacing.sm,
    },
});