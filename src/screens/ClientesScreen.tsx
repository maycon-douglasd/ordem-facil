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
import { excluirCliente, listarClientes } from "../services/clientesService";
import { Cliente } from "../types/cliente";
import { colors, radius, spacing } from "../theme/colors";
import { BackButton } from "../components/BackButton";


export function ClientesScreen({ navigation }: any) {
    const { user } = useAuth();

    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function carregarClientes(mostrarLoadingInicial: boolean) {
        if (!user) return;

        setError(null);
        if (mostrarLoadingInicial) {
            setLoading(true);
        }

        try {
            const lista = await listarClientes(user.uid);
            setClientes(lista);
        } catch (err: any) {
            setError(err?.message ?? "Não foi possível carregar os clientes.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    // Roda toda vez que essa tela fica visível — seja na primeira vez que
    // abre, ou quando o usuário volta pra ela depois de cadastrar um cliente
    // novo em outra tela. Assim a lista está sempre atualizada.
    useFocusEffect(
        useCallback(() => {
            carregarClientes(true);
        }, [user])
    );

    function handleRefresh() {
        setRefreshing(true);
        carregarClientes(false);
    }


    function handleExcluir(cliente: Cliente) {
        Alert.alert(
            "Excluir cliente",
            `Tem certeza que deseja excluir "${cliente.nome}"? Essa ação não pode ser desfeita.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await excluirCliente(cliente.id);
                            setClientes((atual) => atual.filter((c) => c.id !== cliente.id));
                        } catch (err: any) {
                            Alert.alert("Erro", err?.message ?? "Não foi possível excluir o cliente.");
                        }
                    },
                },
            ]
        );
    }


    if (loading) {
        return (
            <View style={styles.centered}>
                <Text style={styles.loadingText}>Carregando clientes...</Text>
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

                    <Text style={styles.headerTitle}>Clientes</Text>
                </View>
            </View>

            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            <FlatList
                data={clientes}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>
                            Nenhum cliente cadastrado ainda.{"\n"}Toque no botão abaixo para começar.
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.clienteCard}
                        onPress={() => navigation.navigate("EditarCliente", { clienteId: item.id })}
                    >
                        <View style={styles.clienteInfo}>
                            <Text style={styles.clienteNome}>{item.nome}</Text>

                            <Text style={styles.clienteTelefone}>{item.whatsapp || item.telefone}</Text>
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
                onPress={() => navigation.navigate("NovoCliente")}
            >
                <Text style={styles.fabText}>+ Novo cliente</Text>
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
    clienteCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    clienteInfo: {
        flex: 1,
    },
    clienteNome: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    clienteTelefone: {
        fontSize: 13,
        color: colors.textSecondary,
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