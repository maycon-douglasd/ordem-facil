import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { colors, spacing } from "../theme/colors";
import { criarDespesa } from "../services/despesasService";
import { temConexaoComInternet, MENSAGEM_SEM_CONEXAO } from "../utils/conexao";
import { isValidData } from "../utils/validators";
import { DespesaFormData } from "../types/despesa";
import { BackButton } from "../components/BackButton";

export function DespesaFormScreen({ navigation }: any) {
    const { user } = useAuth();

    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");
    const [data, setData] = useState("");

    const [salvando, setSalvando] = useState(false);
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [generalError, setGeneralError] = useState<string | null>(null);

    function validarFormulario(): string | null {
        if (!descricao.trim()) return "Informe a descrição da despesa.";
        const valorNumerico = Number(valor.replace(",", "."));
        if (!valor.trim() || isNaN(valorNumerico) || valorNumerico <= 0) {
            return "Informe um valor válido.";
        }
        if (!data.trim()) return "Informe a data da despesa.";
        if (!isValidData(data)) return "Informe uma data válida (DD/MM/AAAA).";
        return null;
    }

    async function handleSalvar() {
        if (!user) return;

        setGeneralError(null);

        const erroValidacao = validarFormulario();
        if (erroValidacao) {
            setFieldError(erroValidacao);
            return;
        }
        setFieldError(null);

        const dados: DespesaFormData = { descricao, valor, data };

        const conectado = await temConexaoComInternet();
        if (!conectado) {
            setGeneralError(MENSAGEM_SEM_CONEXAO);
            return;
        }

        setSalvando(true);
        try {
            await criarDespesa(user.uid, dados);
            navigation.goBack();
        } catch (err: any) {
            setGeneralError(err?.message ?? "Não foi possível salvar a despesa.");
        } finally {
            setSalvando(false);
        }
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

                        <Text style={styles.headerTitle}>Nova despesa</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <TextField
                        label="Descrição *"
                        placeholder="Ex: Material elétrico"
                        value={descricao}
                        onChangeText={setDescricao}
                        editable={!salvando}
                    />
                    <TextField
                        label="Valor (R$) *"
                        placeholder="0,00"
                        keyboardType="decimal-pad"
                        value={valor}
                        onChangeText={setValor}
                        editable={!salvando}
                    />
                    <TextField
                        label="Data *"
                        placeholder="DD/MM/AAAA"
                        value={data}
                        onChangeText={setData}
                        editable={!salvando}
                    />

                    {fieldError && <Text style={styles.errorBanner}>{fieldError}</Text>}

                    {generalError && <Text style={styles.errorBanner}>{generalError}</Text>}

                    <Button label="Salvar despesa" onPress={handleSalvar} loading={salvando} />

                    <Button
                        label="Cancelar"
                        variant="secondary"
                        onPress={() => navigation.goBack()}
                        disabled={salvando}
                        style={styles.cancelButton}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
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
    errorBanner: {
        color: colors.danger,
        fontSize: 13,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        textAlign: "center",
    },
    cancelButton: {
        marginTop: spacing.sm,
    },
});