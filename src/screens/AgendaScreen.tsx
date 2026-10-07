import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { listarOrdensServico } from "../services/ordensServicoService";
import { OrdemServico } from "../types/ordemServico";
import { colors, radius, spacing } from "../theme/colors";
import { BackButton } from "../components/BackButton";

// Mesma lógica de conversão que já usamos no Dashboard — repetida aqui
// porque essa tela é independente. Poderíamos mover para um arquivo
// utilitário compartilhado no futuro, se quisermos evitar duplicação.
function converterParaData(dataAgendada: string, horaAgendada: string): Date {
    const [dia, mes, ano] = dataAgendada.split("/").map(Number);
    const [hora, minuto] = horaAgendada.split(":").map(Number);
    return new Date(ano || 0, (mes || 1) - 1, dia || 1, hora || 0, minuto || 0);
}

// Decide o rótulo de cada grupo de data: "Hoje", "Amanhã", ou a data normal.
function getRotuloData(dataAgendada: string): string {
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);

    const hojeTexto = `${hoje.getDate().toString().padStart(2, "0")}/${(hoje.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${hoje.getFullYear()}`;
    const amanhaTexto = `${amanha.getDate().toString().padStart(2, "0")}/${(amanha.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${amanha.getFullYear()}`;

    if (dataAgendada === hojeTexto) return "Hoje";
    if (dataAgendada === amanhaTexto) return "Amanhã";
    return dataAgendada;
}

export function AgendaScreen({ navigation }: any) {
    const { user } = useAuth();

    const [ordens, setOrdens] = useState<OrdemServico[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function carregarAgenda(mostrarLoadingInicial: boolean) {
        if (!user) return;

        setError(null);
        if (mostrarLoadingInicial) {
            setLoading(true);
        }

        try {
            const lista = await listarOrdensServico(user.uid);
            const agendadas = lista
                .filter((ordem) => ordem.status === "agendado")
                .sort((a, b) => {
                    const dataA = converterParaData(a.dataAgendada, a.horaAgendada);
                    const dataB = converterParaData(b.dataAgendada, b.horaAgendada);
                    return dataA.getTime() - dataB.getTime();
                });
            setOrdens(agendadas);
        } catch (err: any) {
            setError(err?.message ?? "Não foi possível carregar a agenda.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarAgenda(true);
        }, [user])
    );

    function handleRefresh() {
        setRefreshing(true);
        carregarAgenda(false);
    }

    if (loading) {
        return (
            <View style={styles.centered}>
                <Text style={styles.loadingText}>Carregando agenda...</Text>
            </View>
        );
    }

    // Agrupa as ordens por rótulo de data (ex: todas as ordens de "Hoje"
    // ficam juntas num mesmo grupo, sem repetir o cabeçalho de data).
    const grupos: { rotulo: string; ordens: OrdemServico[] }[] = [];
    ordens.forEach((ordem) => {
        const rotulo = getRotuloData(ordem.dataAgendada);
        const grupoExistente = grupos.find((g) => g.rotulo === rotulo);
        if (grupoExistente) {
            grupoExistente.ordens.push(ordem);
        } else {
            grupos.push({ rotulo, ordens: [ordem] });
        }
    });

    return (
        <View style={styles.flex}>

            <View style={styles.header}>
                <View style={styles.headerRow}>

                    <View style={styles.backButtonWrapper}>

                        <BackButton onPress={() => navigation.goBack()} />
                    </View>
                    <Text style={styles.headerTitle}>Agenda</Text>
                </View>
            </View>

            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <ScrollView
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            >
                {grupos.length === 0 ? (
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>Nenhum serviço agendado no momento.</Text>
                    </View>
                ) : (
                    grupos.map((grupo) => (
                        <View key={grupo.rotulo} style={styles.grupo}>
                            <Text style={styles.grupoTitulo}>{grupo.rotulo}</Text>
                            {grupo.ordens.map((ordem) => (
                                <TouchableOpacity
                                    key={ordem.id}
                                    style={styles.ordemCard}
                                    onPress={() => navigation.navigate("DetalhesOrdem", { ordemId: ordem.id })}
                                >
                                    <Text style={styles.ordemHora}>{ordem.horaAgendada}</Text>

                                    <View style={styles.ordemInfo}>
                                        <Text style={styles.ordemCliente}>{ordem.clienteNome}</Text>

                                        <Text style={styles.ordemServico}>
                                            {ordem.itens[0]?.descricao ?? "Serviço"}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))
                )}
            </ScrollView>
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
    grupo: {
        marginBottom: spacing.lg,
    },
    grupoTitulo: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    ordemCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    ordemHora: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.primary,
        marginRight: spacing.md,
        minWidth: 50,
    },
    ordemInfo: {
        flex: 1,
    },
    ordemCliente: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    ordemServico: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: spacing.xs / 2,
    },
});