import React, { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { excluirOrdemServico, listarOrdensServico } from "../services/ordensServicoService";
import { OrdemServico, StatusOrdem } from "../types/ordemServico";
import { colors, radius, spacing } from "../theme/colors";
import { BackButton } from "../components/BackButton";


export function OrdensServicoScreen({ navigation }: any) {
    const { user } = useAuth();

    const [ordens, setOrdens] = useState<OrdemServico[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function carregarOrdens(mostrarLoadingInicial: boolean) {
        if (!user) return;

        setError(null);
        if (mostrarLoadingInicial) {
            setLoading(true);
        }

        try {
            const lista = await listarOrdensServico(user.uid);
            setOrdens(lista);
        } catch (err: any) {
            setError(err?.message ?? "Não foi possível carregar as ordens de serviço.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarOrdens(true);
        }, [user])
    );

    function handleRefresh() {
        setRefreshing(true);
        carregarOrdens(false);
    }

    function handleExcluir(ordem: OrdemServico) {
        Alert.alert(
            "Excluir ordem de serviço",
            `Tem certeza que deseja excluir a OS #${ordem.numero.toString().padStart(3, "0")}? Essa ação não pode ser desfeita.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await excluirOrdemServico(ordem.id);
                            setOrdens((atual) => atual.filter((o) => o.id !== ordem.id));
                        } catch (err: any) {
                            Alert.alert("Erro", err?.message ?? "Não foi possível excluir a ordem.");
                        }
                    },
                },
            ]
        );
    }

    function getStatusInfo(status: StatusOrdem) {
        switch (status) {
            case "em_andamento":
                return { texto: "Em andamento", cor: colors.info, fundo: colors.infoBg };
            case "concluido":
                return { texto: "Concluído", cor: colors.success, fundo: colors.successBg };
            case "cancelado":
                return { texto: "Cancelado", cor: colors.danger, fundo: colors.dangerBg };
            default:
                return { texto: "Agendado", cor: colors.warning, fundo: colors.warningBg };
        }
    }


    if (loading) {
        return (
            <View style={styles.centered}>
                <Text style={styles.loadingText}>Carregando ordens de serviço...</Text>
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
                    <Text style={styles.headerTitle}>Ordens de Serviço</Text>
                </View>
            </View>

            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <FlatList
                data={ordens}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>
                            Nenhuma ordem de serviço ainda.{"\n"}Toque no botão abaixo para começar.
                        </Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const statusInfo = getStatusInfo(item.status);
                    const numeroFormatado = item.numero.toString().padStart(3, "0");
                    return (
                        <TouchableOpacity
                            style={styles.ordemCard}
                            onPress={() => navigation.navigate("DetalhesOrdem", { ordemId: item.id })}
                        >
                            <View style={styles.ordemTopRow}>
                                <Text style={styles.ordemNumero}>OS #{numeroFormatado}</Text>

                                <View style={[styles.statusBadge, { backgroundColor: statusInfo.fundo }]}>

                                    <Text style={[styles.statusText, { color: statusInfo.cor }]}>
                                        {statusInfo.texto}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.ordemCliente}>{item.clienteNome}</Text>
                            <View style={styles.ordemBottomRow}>
                                <Text style={styles.ordemData}>
                                    {item.dataAgendada} - {item.horaAgendada}
                                </Text>

                                <TouchableOpacity
                                    onPress={() => handleExcluir(item)}
                                    style={styles.deleteButton}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Text style={styles.deleteButtonText}>Excluir</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate("NovaOrdemServico")}
            >
                <Text style={styles.fabText}>+ Nova ordem de serviço</Text>
            </TouchableOpacity>
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
        fontSize: 20,
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
    ordemCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    ordemTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.xs,
    },
    ordemNumero: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.textPrimary,
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
    ordemCliente: {
        fontSize: 14,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    ordemBottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    ordemData: {
        fontSize: 13,
        color: colors.textSecondary,
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
        bottom: spacing.xl,
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
});