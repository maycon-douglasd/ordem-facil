import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { buscarPlanoUsuario } from "../services/usuarioService";
import { Plano } from "../types/usuario";
import { colors, radius, spacing } from "../theme/colors";
import { BackButton } from "../components/BackButton";

export function MeuPlanoScreen({ navigation }: any) {
    const { user } = useAuth();
    const [plano, setPlano] = useState<Plano | null>(null);

    useEffect(() => {
        if (!user) return;

        async function carregarPlano() {
            const planoAtual = await buscarPlanoUsuario(user!.uid);
            setPlano(planoAtual);
        }

        carregarPlano();
    }, [user]);

    if (plano === null) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
            <View style={styles.header}>

                <View style={styles.headerRow}>

                    <View style={styles.backButtonWrapper}>
                        <BackButton onPress={() => navigation.goBack()} />
                    </View>

                    <Text style={styles.headerTitle}>Meu plano</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={[styles.planoCard, plano === "gratis" && styles.planoCardAtivo]}>

                    <View style={styles.planoHeaderRow}>

                        <Text style={styles.planoNome}>🆓 Gratuito</Text>

                        {plano === "gratis" && (
                            <View style={styles.badgeAtual}>
                                <Text style={styles.badgeAtualTexto}>Plano atual</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.planoItem}>• 5 clientes</Text>

                    <Text style={styles.planoItem}>• 3 ordens de serviço/mês</Text>

                    <Text style={styles.planoItem}>• 3 orçamentos/mês</Text>

                    <Text style={styles.planoItem}>• Histórico</Text>

                    <Text style={styles.planoItem}>• WhatsApp (orçamento)</Text>
                </View>

                <View style={[styles.planoCard, plano === "profissional" && styles.planoCardAtivo]}>

                    <View style={styles.planoHeaderRow}>
                        <Text style={styles.planoNome}>⭐ Profissional</Text>

                        {plano === "profissional" ? (

                            <View style={styles.badgeAtual}>
                                <Text style={styles.badgeAtualTexto}>Plano atual</Text>
                            </View>
                        ) : (
                            <Text style={styles.planoPreco}>R$ 19,90/mês</Text>
                        )}
                    </View>

                    <Text style={styles.planoItem}>• Tudo do gratuito, ilimitado</Text>

                    <Text style={styles.planoItem}>• Financeiro completo</Text>

                    <Text style={styles.planoItem}>• WhatsApp na Ordem de Serviço</Text>

                    <Text style={styles.planoItem}>• Fotos e PDF (em breve)</Text>

                    {plano === "gratis" && (
                        <TouchableOpacity style={styles.upgradeButton}>
                            <Text style={styles.upgradeButtonText}>Assinar Profissional</Text>
                        </TouchableOpacity>
                    )}
                </View>
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
    planoCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 2,
        borderColor: colors.border,
    },
    planoCardAtivo: {
        borderColor: colors.primary,
    },
    planoHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.sm,
    },
    planoNome: {
        fontSize: 17,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    planoPreco: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.primary,
    },
    badgeAtual: {
        backgroundColor: colors.successBg,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs / 2,
        borderRadius: radius.full,
    },
    badgeAtualTexto: {
        fontSize: 11,
        fontWeight: "700",
        color: colors.success,
    },
    planoItem: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    upgradeButton: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: spacing.sm,
        alignItems: "center",
        marginTop: spacing.md,
    },
    upgradeButtonText: {
        color: colors.textInverse,
        fontSize: 14,
        fontWeight: "700",
    },
});