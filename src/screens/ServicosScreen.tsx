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
import { excluirServico, listarServicos } from "../services/servicosService";
import { Servico } from "../types/servico";
import { colors, radius, spacing } from "../theme/colors";
import { BackButton } from "../components/BackButton";


export function ServicosScreen({ navigation }: any) {
    const { user } = useAuth();

    const [servicos, setServicos] = useState<Servico[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function carregarServicos(mostrarLoadingInicial: boolean) {
        if (!user) return;

        setError(null);
        if (mostrarLoadingInicial) {
            setLoading(true);
        }

        try {
            const lista = await listarServicos(user.uid);
            setServicos(lista);
        } catch (err: any) {
            setError(err?.message ?? "Não foi possível carregar os serviços.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarServicos(true);
        }, [user])
    );

    function handleRefresh() {
        setRefreshing(true);
        carregarServicos(false);
    }

    function handleExcluir(servico: Servico) {
        Alert.alert(
            "Excluir serviço",
            `Tem certeza que deseja excluir "${servico.nome}"? Essa ação não pode ser desfeita.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await excluirServico(servico.id);
                            setServicos((atual) => atual.filter((s) => s.id !== servico.id));
                        } catch (err: any) {
                            Alert.alert("Erro", err?.message ?? "Não foi possível excluir o serviço.");
                        }
                    },
                },
            ]
        );
    }


    if (loading) {
        return (
            <View style={styles.centered}>
                <Text style={styles.loadingText}>Carregando serviços...</Text>
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

                    <Text style={styles.headerTitle}>Serviços</Text>
                </View>
            </View>

            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <FlatList
                data={servicos}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>
                            Nenhum serviço cadastrado ainda.{"\n"}Toque no botão abaixo para começar.
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.servicoCard}
                        onPress={() => navigation.navigate("EditarServico", { servicoId: item.id })}
                    >
                        <View style={styles.servicoInfo}>
                            <Text style={styles.servicoNome}>{item.nome}</Text>

                            <Text style={styles.servicoValor}>
                                R$ {item.valorPadrao.toFixed(2).replace(".", ",")}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => handleExcluir(item)}
                            style={styles.deleteButton}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Text style={styles.deleteButtonText}>Excluir</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate("NovoServico")}
            >
                <Text style={styles.fabText}>+ Novo serviço</Text>
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
    servicoCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    servicoInfo: {
        flex: 1,
    },
    servicoNome: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    servicoValor: {
        fontSize: 13,
        color: colors.success,
        fontWeight: "600",
        marginTop: spacing.xs,
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
});