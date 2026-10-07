import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { colors, radius, spacing } from "../theme/colors";
import { BackButton } from "../components/BackButton";

export function PerfilScreen({ navigation }: any) {
    const { user } = useAuth();

    return (
        <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
            <View style={styles.header}>

                <View style={styles.headerRow}>
                    <View style={styles.backButtonWrapper}>

                        <BackButton onPress={() => navigation.goBack()} />
                    </View>

                    <Text style={styles.headerTitle}>Meu perfil</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.avatarCircle}>

                    <Text style={styles.avatarLetra}>
                        {user?.displayName?.charAt(0).toUpperCase() ?? "?"}
                    </Text>
                </View>

                <Text style={styles.label}>Nome</Text>

                <Text style={styles.valor}>{user?.displayName ?? "Não informado"}</Text>

                <Text style={styles.label}>E-mail</Text>

                <Text style={styles.valor}>{user?.email ?? "Não informado"}</Text>
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
        alignItems: "center",
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.lg,
    },
    avatarLetra: {
        fontSize: 32,
        fontWeight: "700",
        color: colors.textInverse,
    },
    label: {
        fontSize: 13,
        color: colors.textSecondary,
        alignSelf: "flex-start",
        marginTop: spacing.md,
    },
    valor: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textPrimary,
        alignSelf: "flex-start",
    },
});