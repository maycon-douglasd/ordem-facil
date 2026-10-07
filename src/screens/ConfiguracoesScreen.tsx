import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import {
    buscarNotificacoesAtivas,
    definirNotificacoesAtivas,
} from "../services/usuarioService";
import { colors, radius, spacing } from "../theme/colors";
import { BackButton } from "../components/BackButton";

export function ConfiguracoesScreen({ navigation }: any) {
    const { user } = useAuth();
    const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        async function carregar() {
            const ativas = await buscarNotificacoesAtivas(user!.uid);
            setNotificacoesAtivas(ativas);
            setLoading(false);
        }

        carregar();
    }, [user]);

    async function handleToggle(valor: boolean) {
        if (!user) return;
        setNotificacoesAtivas(valor);
        try {
            await definirNotificacoesAtivas(user.uid, valor);
        } catch (error) {
            // Se der erro ao salvar, reverte o toggle visualmente, para não
            // mostrar um estado que não foi realmente salvo no servidor.
            setNotificacoesAtivas(!valor);
        }
    }

    return (
        <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
            <View style={styles.header}>

                <View style={styles.headerRow}>
                    <View style={styles.backButtonWrapper}>
                        <BackButton onPress={() => navigation.goBack()} />
                    </View>

                    <Text style={styles.headerTitle}>Configurações</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.optionRow}>

                    <View style={styles.optionTextContainer}>
                        <Text style={styles.optionTitle}>Notificações</Text>

                        <Text style={styles.optionDescricao}>
                            Receber avisos sobre orçamentos, ordens e lembretes.
                        </Text>
                    </View>

                    <Switch
                        value={notificacoesAtivas}
                        onValueChange={handleToggle}
                        disabled={loading}
                        trackColor={{ false: colors.border, true: colors.primary }}
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    container: { flexGrow: 1 },
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
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
    },
    optionTextContainer: {
        flex: 1,
        marginRight: spacing.md,
    },
    optionTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    optionDescricao: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
});