import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius, spacing } from "../theme/colors";
import { BackButton } from "../components/BackButton";

// Tela mostrada para usuários do plano Gratuito ao acessar a aba
// Financeiro — em vez de simplesmente esconder o recurso, mostramos
// uma prévia desfocada dos dados que teriam, com uma chamada para
// upgrade por cima. Isso costuma converter melhor do que uma mensagem
// de bloqueio simples, porque dá um "gostinho" concreto do valor.
export function FinanceiroBloqueadoScreen({ navigation }: any) {
    return (
        <View style={styles.flex}>
            <View style={styles.header}>

                <View style={styles.headerRow}>

                    <View style={styles.backButtonWrapper}>
                        <BackButton onPress={() => navigation.goBack()} />
                    </View>

                    <Text style={styles.headerTitle}>Financeiro</Text>
                </View>
            </View>

            <View style={styles.previewContainer}>
                <View style={styles.previewContent}>

                    <Text style={styles.previewTitle}>Resumo financeiro</Text>

                    <View style={styles.previewGrid}>
                        <View style={styles.previewCard}>

                            <Text style={styles.previewLabel}>Recebido</Text>

                            <Text style={[styles.previewValue, { color: colors.success }]}>R$ 3.250</Text>
                        </View>

                        <View style={styles.previewCard}>
                            <Text style={styles.previewLabel}>A receber</Text>

                            <Text style={[styles.previewValue, { color: colors.warning }]}>R$ 1.450</Text>
                        </View>

                        <View style={styles.previewCard}>
                            <Text style={styles.previewLabel}>Despesas</Text>

                            <Text style={[styles.previewValue, { color: colors.danger }]}>R$ 850</Text>
                        </View>

                        <View style={styles.previewCard}>
                            <Text style={styles.previewLabel}>Lucro</Text>

                            <Text style={[styles.previewValue, { color: colors.info }]}>R$ 2.400</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.overlay}>
                    <Text style={styles.overlayIcone}>🔒</Text>

                    <View style={styles.overlayBadge}>

                        <Text style={styles.overlayBadgeText}>Disponível no Profissional</Text>
                    </View>

                    <Text style={styles.overlayDescricao}>
                        Acompanhe recebidos, a receber, despesas e lucro em um só lugar.
                    </Text>

                    <TouchableOpacity style={styles.upgradeButton}>
                        <Text style={styles.upgradeButtonText}>⭐ Assinar Profissional</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
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
    previewContainer: {
        flex: 1,
        padding: spacing.lg,
    },
    previewContent: {
        opacity: 0.18,
    },
    previewTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    previewGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
    },
    previewCard: {
        width: "47%",
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
    },
    previewLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    previewValue: {
        fontSize: 18,
        fontWeight: "700",
    },
    overlay: {
        position: "absolute",
        top: spacing.lg,
        left: spacing.lg,
        right: spacing.lg,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: spacing.xl,
    },
    overlayIcone: {
        fontSize: 32,
        marginBottom: spacing.sm,
    },
    overlayBadge: {
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.sm,
        marginBottom: spacing.sm,
    },
    overlayBadgeText: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    overlayDescricao: {
        fontSize: 14,
        fontWeight: "400",
        color: colors.textPrimary,
        textAlign: "center",
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    upgradeButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
    },
    upgradeButtonText: {
        color: colors.textInverse,
        fontSize: 14,
        fontWeight: "700",
    },
});