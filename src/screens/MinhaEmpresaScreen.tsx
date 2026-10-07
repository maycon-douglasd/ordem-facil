import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { buscarDadosEmpresa, salvarDadosEmpresa } from "../services/usuarioService";
import { temConexaoComInternet, MENSAGEM_SEM_CONEXAO } from "../utils/conexao";
import { colors, spacing } from "../theme/colors";
import { BackButton } from "../components/BackButton";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";

export function MinhaEmpresaScreen({ navigation }: any) {
    const { user } = useAuth();

    const [nomeEmpresa, setNomeEmpresa] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [endereco, setEndereco] = useState("");

    const [loadingDados, setLoadingDados] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        const usuarioLogado = user;

        async function carregarDados() {
            try {
                const dados = await buscarDadosEmpresa(usuarioLogado.uid);
                setNomeEmpresa(dados.nomeEmpresa);
                setCnpj(dados.cnpj);
                setEndereco(dados.endereco);
            } catch (err: any) {
                setError(err?.message ?? "Não foi possível carregar os dados.");
            } finally {
                setLoadingDados(false);
            }
        }

        carregarDados();
    }, [user]);

    async function handleSalvar() {
        if (!user) return;

        setError(null);

        if (!nomeEmpresa.trim()) {
            setError("Informe pelo menos o nome da empresa ou marca.");
            return;
        }

        const conectado = await temConexaoComInternet();
        if (!conectado) {
            setError(MENSAGEM_SEM_CONEXAO);
            return;
        }

        setSalvando(true);
        try {
            await salvarDadosEmpresa(user.uid, { nomeEmpresa, cnpj, endereco });
            navigation.goBack();
        } catch (err: any) {
            setError(err?.message ?? "Não foi possível salvar os dados.");
        } finally {
            setSalvando(false);
        }
    }

    if (loadingDados) {
        return (
            <View style={styles.centered}>
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <View style={styles.headerRow}>

                        <View style={styles.backButtonWrapper}>
                            <BackButton onPress={() => navigation.goBack()} />
                        </View>

                        <Text style={styles.headerTitle}>Minha empresa</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={styles.helperText}>
                        Esses dados aparecerão futuramente nos PDFs de orçamento, identificando quem está
                        prestando o serviço.
                    </Text>

                    <TextField
                        label="Nome da empresa ou marca"
                        placeholder="Ex: João Refrigeração"
                        value={nomeEmpresa}
                        onChangeText={setNomeEmpresa}
                        editable={!salvando}
                    />
                    <TextField
                        label="CNPJ (opcional)"
                        placeholder="00.000.000/0000-00"
                        value={cnpj}
                        onChangeText={setCnpj}
                        editable={!salvando}
                    />
                    <TextField
                        label="Endereço"
                        placeholder="Cidade, estado"
                        value={endereco}
                        onChangeText={setEndereco}
                        editable={!salvando}
                    />

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <Button label="Salvar" onPress={handleSalvar} loading={salvando} />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
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
    content: {
        padding: spacing.lg,
    },
    helperText: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
        lineHeight: 18,
    },
    errorText: {
        color: colors.danger,
        fontSize: 13,
        marginBottom: spacing.sm,
        textAlign: "center",
    },
});