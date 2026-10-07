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
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { colors, spacing } from "../theme/colors";
import {
    atualizarServico,
    criarServico,
    listarServicos,
} from "../services/servicosService";
import { ServicoFormData } from "../types/servico";
import { temConexaoComInternet, MENSAGEM_SEM_CONEXAO } from "../utils/conexao";


export function ServicoFormScreen({ navigation, route }: any) {
    const { user } = useAuth();

    const servicoId: string | undefined = route.params?.servicoId;
    const modoEdicao = !!servicoId;

    const [nome, setNome] = useState("");
    const [valorPadrao, setValorPadrao] = useState("");
    const [descricao, setDescricao] = useState("");

    const [loadingDados, setLoadingDados] = useState(modoEdicao);
    const [salvando, setSalvando] = useState(false);
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [generalError, setGeneralError] = useState<string | null>(null);

    useEffect(() => {
        if (!modoEdicao || !user) return;
        const usuarioLogado = user;

        async function carregarServico() {
            try {
                const lista = await listarServicos(usuarioLogado.uid);
                const servico = lista.find((s) => s.id === servicoId);

                if (!servico) {
                    setGeneralError("Serviço não encontrado.");
                    return;
                }

                setNome(servico.nome);
                setValorPadrao(servico.valorPadrao.toString().replace(".", ","));
                setDescricao(servico.descricao ?? "");
            } catch (err: any) {
                setGeneralError(err?.message ?? "Não foi possível carregar o serviço.");
            } finally {
                setLoadingDados(false);
            }
        }

        carregarServico();
    }, [modoEdicao, user]);


    function validarFormulario(): string | null {
        if (!nome.trim()) return "Informe o nome do serviço.";
        if (!valorPadrao.trim()) return "Informe o valor padrão do serviço.";
        const valorNumerico = Number(valorPadrao.replace(",", "."));
        if (isNaN(valorNumerico) || valorNumerico < 0) {
            return "Informe um valor válido.";
        }
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

        const conectado = await temConexaoComInternet();
        if (!conectado) {
            setGeneralError(MENSAGEM_SEM_CONEXAO);
            return;
        }

        const dados: ServicoFormData = {
            nome,
            valorPadrao,
            descricao,
        };

        setSalvando(true);
        try {
            if (modoEdicao && servicoId) {
                await atualizarServico(servicoId, dados);
            } else {
                await criarServico(user.uid, dados);
            }
            navigation.goBack();
        } catch (err: any) {
            setGeneralError(err?.message ?? "Não foi possível salvar o serviço.");
        } finally {
            setSalvando(false);
        }
    }


    if (loadingDados) {
        return (
            <View style={styles.centered}>
                <Text style={styles.loadingText}>Carregando dados do serviço...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>
                    {modoEdicao ? "Editar serviço" : "Novo serviço"}
                </Text>

                <TextField
                    label="Nome *"
                    placeholder="Ex: Instalação de ar-condicionado"
                    value={nome}
                    onChangeText={setNome}
                    editable={!salvando}
                />
                <TextField
                    label="Valor padrão (R$) *"
                    placeholder="0,00"
                    keyboardType="decimal-pad"
                    value={valorPadrao}
                    onChangeText={setValorPadrao}
                    editable={!salvando}
                />
                <TextField
                    label="Descrição"
                    placeholder="Alguma informação extra sobre o serviço"
                    value={descricao}
                    onChangeText={setDescricao}
                    editable={!salvando}
                />

                {fieldError && <Text style={styles.errorBanner}>{fieldError}</Text>}
                {generalError && <Text style={styles.errorBanner}>{generalError}</Text>}

                <Button
                    label={modoEdicao ? "Salvar alterações" : "Cadastrar serviço"}
                    onPress={handleSalvar}
                    loading={salvando}
                />

                <Button
                    label="Cancelar"
                    variant="secondary"
                    onPress={() => navigation.goBack()}
                    disabled={salvando}
                    style={styles.cancelButton}
                />
            </ScrollView>
        </KeyboardAvoidingView>
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
    container: {
        flexGrow: 1,
        padding: spacing.lg,
        paddingTop: spacing.xl * 1.5,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: spacing.lg,
    },
    errorBanner: {
        color: colors.danger,
        fontSize: 13,
        marginBottom: spacing.sm,
        textAlign: "center",
    },
    cancelButton: {
        marginTop: spacing.sm,
    },
});