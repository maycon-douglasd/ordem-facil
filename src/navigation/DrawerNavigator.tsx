import React from "react";
import {
    createDrawerNavigator,
    DrawerContentScrollView,
    DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { colors, radius, spacing } from "../theme/colors";
import { BottomTabNavigator } from "./BottomTabNavigator";

// Componente que desenha o CONTEÚDO do menu lateral — a lista de opções
// que aparece quando ele é aberto. O React Navigation cuida da parte de
// abrir/fechar/deslizar; a gente só desenha o que vai dentro.
function ConteudoMenu(props: DrawerContentComponentProps) {
    const { user, logout } = useAuth();

    const opcoes = [
        { label: "Meu perfil", icone: "person-outline" as const, rota: "Perfil" },
        { label: "Meu plano", icone: "star-outline" as const, rota: "MeuPlano" },
        { label: "Minha empresa", icone: "business-outline" as const, rota: "MinhaEmpresa" },
        { label: "Configurações", icone: "settings-outline" as const, rota: "Configuracoes" },
        { label: "Central de ajuda", icone: "help-circle-outline" as const, rota: "CentralAjuda" },
    ];

    async function handleSair() {
        try {
            await logout();
        } catch (error) {
            console.error("[DrawerNavigator] Erro ao sair:", error);
        }
    }

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
            <View style={styles.perfilHeader}>
                <View style={styles.avatarCircle}>

                    <Text style={styles.avatarLetra}>
                        {user?.displayName?.charAt(0).toUpperCase() ?? "?"}
                    </Text>
                </View>

                <Text style={styles.nomeUsuario}>{user?.displayName ?? "Profissional"}</Text>
            </View>

            {opcoes.map((opcao) => (
                <TouchableOpacity
                    key={opcao.rota}
                    style={styles.opcaoItem}
                    onPress={() => props.navigation.navigate(opcao.rota)}
                >
                    <Ionicons name={opcao.icone} size={22} color={colors.textPrimary} />

                    <Text style={styles.opcaoTexto}>{opcao.label}</Text>
                </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.sairItem} onPress={handleSair}>
                <Ionicons name="log-out-outline" size={22} color={colors.danger} />

                <Text style={styles.sairTexto}>Sair</Text>
            </TouchableOpacity>
        </DrawerContentScrollView>
    );
}

const Drawer = createDrawerNavigator();

export function DrawerNavigator() {
    return (
        <Drawer.Navigator
            screenOptions={{ headerShown: false }}
            drawerContent={(props) => <ConteudoMenu {...props} />}
        >
            <Drawer.Screen name="MainTabsInternal" component={BottomTabNavigator} />
        </Drawer.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: spacing.lg,
    },
    perfilHeader: {
        alignItems: "center",
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginBottom: spacing.sm,
    },
    avatarCircle: {
        width: 56,
        height: 56,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.sm,
    },
    avatarLetra: {
        fontSize: 22,
        fontWeight: "700",
        color: colors.textInverse,
    },
    nomeUsuario: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    opcaoItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    opcaoTexto: {
        fontSize: 15,
        color: colors.textPrimary,
    },
    sairItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
        marginTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    sairTexto: {
        fontSize: 15,
        color: colors.danger,
        fontWeight: "600",
    },
});