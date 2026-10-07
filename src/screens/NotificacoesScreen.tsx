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
import {
    listarNotificacoes,
    marcarComoLida,
    marcarTodasComoLidas,
    excluirTodasNotificacoes,
} from "../services/notificacoesService";
import { Notificacao } from "../types/notificacao";
import { colors, radius, spacing } from "../theme/colors";
import { BackButton } from "../components/BackButton";

export function NotificacoesScreen({ navigation }: any) {
    const { user } = useAuth();

    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    async function carregarNotificacoes(mostrarLoadingInicial: boolean) {
        if (!user) return;
        if (mostrarLoadingInicial) {
            setLoading(true);
        }
        try {
            const lista = await listarNotificacoes(user.uid);
            setNotificacoes(lista);
        } catch (err) {
            console.error("[Notificacoes] Erro ao carregar:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarNotificacoes(true);
        }, [user])
    );

    function handleRefresh() {
        setRefreshing(true);
        carregarNotificacoes(false);
    }

    async function handleTocarNotificacao(notificacao: Notificacao) {
        if (!notificacao.lida) {
            await marcarComoLida(notificacao.id);
            setNotificacoes((atual) =>
                atual.map((n) => (n.id === notificacao.id ? { ...n, lida: true } : n))
            );
        }
    }

    async function handleMarcarTodasLidas() {
        if (!user) return;
        await marcarTodasComoLidas(user.uid);
        setNotificacoes((atual) => atual.map((n) => ({ ...n, lida: true })));
    }

    function handleLimparTudo() {
        Alert.alert(
            "Limpar notificações",
            "Tem certeza que deseja excluir todas as notificações? Essa ação não pode ser desfeita.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Limpar tudo",
                    style: "destructive",
                    onPress: async () => {
                        if (!user) return;
                        await excluirTodasNotificacoes(user.uid);
                        setNotificacoes([]);
                    },
                },
            ]
        );
    }

    if (loading) {
        return (
            <View style={styles.centered}>
                <Text style={styles.loadingText}>Carregando notificações...</Text>
            </View>
        );
    }

    const temNaoLidas = notificacoes.some((n) => !n.lida);

    return (
        <View style={styles.flex}>
            <View style={styles.header}>

                <View style={styles.headerRow}>

                    <View style={styles.backButtonWrapper}>
                        <BackButton onPress={() => navigation.goBack()} />
                    </View>

                    <Text style={styles.headerTitle}>Notificações</Text>
                </View>
            </View>

            <FlatList
                data={notificacoes}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>Nenhuma notificação ainda.</Text>
                    </View>
                }
                ListFooterComponent={
                    notificacoes.length > 0 ? (
                        <View>
                            {temNaoLidas && (
                                <TouchableOpacity style={styles.marcarTodasButton} onPress={handleMarcarTodasLidas}>

                                    <Text style={styles.marcarTodasText}>Marcar todas como lidas</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.limparTudoButton} onPress={handleLimparTudo}>

                                <Text style={styles.limparTudoText}>Limpar tudo</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.notificacaoCard, !item.lida && styles.notificacaoNaoLida]}
                        onPress={() => handleTocarNotificacao(item)}
                    >
                        {!item.lida && <View style={styles.dotNaoLida} />}
                        <View style={styles.notificacaoInfo}>
                            <Text style={styles.notificacaoTitulo}>{item.titulo}</Text>

                            <Text style={styles.notificacaoMensagem}>{item.mensagem}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
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
    listContent: {
        padding: spacing.lg,
        flexGrow: 1,
    },
    emptyText: {
        textAlign: "center",
        color: colors.textSecondary,
        fontSize: 14,
    },
    notificacaoCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    notificacaoNaoLida: {
        backgroundColor: colors.infoBg,
    },
    dotNaoLida: {
        width: 8,
        height: 8,
        borderRadius: radius.full,
        backgroundColor: colors.info,
        marginRight: spacing.sm,
        marginTop: spacing.xs,
    },
    notificacaoInfo: {
        flex: 1,
    },
    notificacaoTitulo: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    notificacaoMensagem: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        lineHeight: 18,
    },
    marcarTodasButton: {
        paddingVertical: spacing.md,
        alignItems: "center",
    },
    marcarTodasText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: "600",
    },
    limparTudoButton: {
        paddingVertical: spacing.sm,
        alignItems: "center",
    },
    limparTudoText: {
        color: colors.danger,
        fontSize: 13,
        fontWeight: "600",
    },
});