import React, { useCallback, useState } from "react";
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { listarOrdensServico } from "../services/ordensServicoService";
import { listarDespesas, excluirDespesa } from "../services/despesasService";
import { Despesa } from "../types/despesa";
import { colors, radius, spacing } from "../theme/colors";
import { BackButton } from "../components/BackButton";

export function FinanceiroCompletoScreen({ navigation }: any) {
    const { user } = useAuth();

    const [recebido, setRecebido] = useState(0);
    const [aReceber, setAReceber] = useState(0);
    const [totalDespesas, setTotalDespesas] = useState(0);
    const [despesas, setDespesas] = useState<Despesa[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    async function carregarDados(mostrarLoadingInicial: boolean) {
        if (!user) return;
        if (mostrarLoadingInicial) {
            setLoading(true);
        }

        try {
            const [listaOrdens, listaDespesas] = await Promise.all([
                listarOrdensServico(user.uid),
                listarDespesas(user.uid),
            ]);

            const ordensRecebidas = listaOrdens.filter((o) => o.pago);
            const somaRecebido = ordensRecebidas.reduce((soma, o) => soma + o.total, 0);
            setRecebido(somaRecebido);

            const ordensAReceber = listaOrdens.filter(
                (o) => o.status === "concluido" && !o.pago
            );
            const somaAReceber = ordensAReceber.reduce((soma, o) => soma + o.total, 0);
            setAReceber(somaAReceber);

            const somaDespesas = listaDespesas.reduce((soma, d) => soma + d.valor, 0);
            setTotalDespesas(somaDespesas);
            setDespesas(listaDespesas);
        } catch (err) {
            console.error("[Financeiro] Erro ao carregar dados:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarDados(true);
        }, [user])
    );

    function handleRefresh() {
        setRefreshing(true);
        carregarDados(false);
    }

    function handleExcluirDespesa(despesa: Despesa) {
        Alert.alert(
            "Excluir despesa",
            `Tem certeza que deseja excluir "${despesa.descricao}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        await excluirDespesa(despesa.id);
                        carregarDados(false);
                    },
                },
            ]
        );
    }

    if (loading) {
        return (
            <View style={styles.centered}>
                <Text style={styles.loadingText}>Carregando financeiro...</Text>
            </View>
        );
    }

    const lucro = recebido - totalDespesas;

    return (
        <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
            <View style={styles.header}>
                <View style={styles.headerRow}>

                    <View style={styles.backButtonWrapper}>
                        <BackButton onPress={() => navigation.goBack()} />
                    </View>

                    <Text style={styles.headerTitle}>Financeiro</Text>

                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.resumoGrid}>

                    <View style={styles.resumoCard}>

                        <Text style={[styles.resumoValor, { color: colors.success }]}>

                            R$ {recebido.toFixed(2).replace(".", ",")}
                        </Text>

                        <Text style={styles.resumoLabel}>Recebido</Text>
                    </View>

                    <View style={styles.resumoCard}>
                        <Text style={[styles.resumoValor, { color: colors.warning }]}>
                            R$ {aReceber.toFixed(2).replace(".", ",")}
                        </Text>

                        <Text style={styles.resumoLabel}>A receber</Text>
                    </View>

                    <View style={styles.resumoCard}>
                        <Text style={[styles.resumoValor, { color: colors.danger }]}>
                            R$ {totalDespesas.toFixed(2).replace(".", ",")}
                        </Text>

                        <Text style={styles.resumoLabel}>Despesas</Text>
                    </View>

                    <View style={styles.resumoCard}>
                        <Text style={[styles.resumoValor, { color: colors.info }]}>
                            R$ {lucro.toFixed(2).replace(".", ",")}
                        </Text>

                        <Text style={styles.resumoLabel}>Lucro</Text>
                    </View>
                </View>

                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Despesas</Text>

                    <TouchableOpacity onPress={() => navigation.navigate("NovaDespesa")}>
                        <Text style={styles.sectionLink}>+ Nova despesa</Text>
                    </TouchableOpacity>
                </View>

                {despesas.length === 0 ? (
                    <View style={styles.emptyStateBox}>
                        <Text style={styles.emptyStateText}>Nenhuma despesa registrada ainda.</Text>
                    </View>
                ) : (
                    despesas.map((despesa) => (
                        <View key={despesa.id} style={styles.despesaCard}>
                            <View style={styles.despesaInfo}>

                                <Text style={styles.despesaDescricao}>{despesa.descricao}</Text>

                                <Text style={styles.despesaData}>{despesa.data}</Text>

                            </View>

                            <Text style={styles.despesaValor}>
                                R$ {despesa.valor.toFixed(2).replace(".", ",")}
                            </Text>

                            <TouchableOpacity
                                onPress={() => handleExcluirDespesa(despesa)}
                                style={styles.deleteButton}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Text style={styles.deleteButtonText}>×</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    container: { flexGrow: 1 },
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
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
        fontSize: 20,
        fontWeight: "700",
        color: colors.textInverse,
    },
    content: {
        padding: spacing.lg,
    },
    resumoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    resumoCard: {
        width: "47%",
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
    },
    resumoValor: {
        fontSize: 18,
        fontWeight: "700",
    },
    resumoLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: spacing.xs,
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
    despesaCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    despesaInfo: {
        flex: 1,
    },
    despesaDescricao: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    despesaData: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    despesaValor: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.danger,
        marginRight: spacing.sm,
    },
    deleteButton: {
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    deleteButtonText: {
        fontSize: 18,
        color: colors.danger,
        fontWeight: "700",
    },
});