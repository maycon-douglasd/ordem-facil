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
    atualizarCliente,
    criarCliente,
    listarClientes,
    LimitePlanoError,
} from "../services/clientesService";
import { ClienteFormData } from "../types/cliente";
import { buscarEnderecoPorCep } from "../utils/cep";
import { LimiteModal } from "../components/LimiteModal";
import { temConexaoComInternet, MENSAGEM_SEM_CONEXAO } from "../utils/conexao";

export function ClienteFormScreen({ navigation, route }: any) {
    const { user } = useAuth();

    // Se veio um clienteId pela navegação, estamos editando um cliente
    // existente. Se não veio nada, estamos criando um cliente novo.
    const clienteId: string | undefined = route.params?.clienteId;
    const modoEdicao = !!clienteId;

    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [email, setEmail] = useState("");
    const [cep, setCep] = useState("");
    const [rua, setRua] = useState("");
    const [numero, setNumero] = useState("");
    const [bairro, setBairro] = useState("");
    const [cidade, setCidade] = useState("");
    const [estado, setEstado] = useState("");
    const [observacoes, setObservacoes] = useState("");
    const [buscandoCep, setBuscandoCep] = useState(false);

    const [loadingDados, setLoadingDados] = useState(modoEdicao);
    const [salvando, setSalvando] = useState(false);
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [mensagemLimite, setMensagemLimite] = useState<string | null>(null);

    useEffect(() => {
        if (!modoEdicao || !user) return;
        const usuarioLogado = user; // garante ao TypeScript que não é mais "null" aqui dentro

        async function carregarCliente() {
            try {
                // Ainda não temos uma função "buscar 1 cliente" otimizada —
                // por enquanto, buscamos a lista toda e filtramos o que precisamos.
                const lista = await listarClientes(usuarioLogado.uid);
                const cliente = lista.find((c) => c.id === clienteId);

                if (!cliente) {
                    setGeneralError("Cliente não encontrado.");
                    return;
                }

                setNome(cliente.nome);
                setTelefone(cliente.telefone);
                setWhatsapp(cliente.whatsapp ?? "");
                setEmail(cliente.email ?? "");
                setCep(cliente.cep ?? "");
                setRua(cliente.rua ?? "");
                setNumero(cliente.numero ?? "");
                setBairro(cliente.bairro ?? "");
                setCidade(cliente.cidade ?? "");
                setEstado(cliente.estado ?? "");
                setObservacoes(cliente.observacoes ?? "");
            } catch (err: any) {
                setGeneralError(err?.message ?? "Não foi possível carregar o cliente.");
            } finally {
                setLoadingDados(false);
            }
        }

        carregarCliente();
    }, [modoEdicao, user]);

    async function handleCepChange(valor: string) {
        setCep(valor);

        const cepLimpo = valor.replace(/\D/g, "");
        if (cepLimpo.length !== 8) return;

        setBuscandoCep(true);
        const endereco = await buscarEnderecoPorCep(valor);
        setBuscandoCep(false);

        if (endereco) {
            setRua(endereco.rua);
            setBairro(endereco.bairro);
            setCidade(endereco.cidade);
            setEstado(endereco.estado);
        }
    }

    function validarFormulario(): string | null {
        if (!nome.trim()) return "Informe o nome do cliente.";
        if (!whatsapp.trim()) return "Informe o WhatsApp do cliente.";
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

        const dados: ClienteFormData = {
            nome,
            telefone,
            whatsapp,
            email,
            cep,
            rua,
            numero,
            bairro,
            cidade,
            estado,
            observacoes,
        };

        setSalvando(true);
        try {
            if (modoEdicao && clienteId) {
                await atualizarCliente(clienteId, dados);
            } else {
                await criarCliente(user.uid, dados);
            }
            navigation.goBack();
        } catch (err: any) {
            if (err instanceof LimitePlanoError) {
                setMensagemLimite(err.message);
            } else {
                setGeneralError(err?.message ?? "Não foi possível salvar o cliente.");
            }
        } finally {
            setSalvando(false);
        }
    }

    if (loadingDados) {
        return (
            <View style={styles.centered}>
                <Text style={styles.loadingText}>Carregando dados do cliente...</Text>
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
                    {modoEdicao ? "Editar cliente" : "Novo cliente"}
                </Text>

                <TextField label="Nome *" placeholder="Nome do cliente" value={nome} onChangeText={setNome} editable={!salvando} />

                <TextField label="WhatsApp *" placeholder="(00) 00000-0000" keyboardType="phone-pad" value={whatsapp} onChangeText={setWhatsapp} editable={!salvando} />

                <TextField label="Telefone" placeholder="(00) 00000-0000" keyboardType="phone-pad" value={telefone} onChangeText={setTelefone} editable={!salvando} />

                <TextField label="E-mail" placeholder="cliente@exemplo.com" keyboardType="email-address" value={email} onChangeText={setEmail} editable={!salvando} />

                <TextField
                    label={buscandoCep ? "CEP (buscando...)" : "CEP"}
                    placeholder="00000-000"
                    keyboardType="numeric"
                    value={cep}
                    onChangeText={handleCepChange}
                    editable={!salvando}
                />
                <TextField label="Rua" placeholder="Nome da rua" value={rua} onChangeText={setRua} editable={!salvando} />

                <TextField label="Número" placeholder="Ex: 123" keyboardType="numeric" value={numero} onChangeText={setNumero} editable={!salvando} />

                <TextField label="Bairro" placeholder="Bairro" value={bairro} onChangeText={setBairro} editable={!salvando} />

                <TextField label="Cidade" placeholder="Cidade" value={cidade} onChangeText={setCidade} editable={!salvando} />

                <TextField label="Estado" placeholder="UF" value={estado} onChangeText={setEstado} editable={!salvando} />

                <TextField label="Observações" placeholder="Alguma informação extra" value={observacoes} onChangeText={setObservacoes} editable={!salvando} />

                {fieldError && <Text style={styles.errorBanner}>{fieldError}</Text>}
                {generalError && <Text style={styles.errorBanner}>{generalError}</Text>}

                <Button
                    label={modoEdicao ? "Salvar alterações" : "Cadastrar cliente"}
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

            <LimiteModal
                visible={!!mensagemLimite}
                mensagem={mensagemLimite ?? ""}
                onFechar={() => {
                    setMensagemLimite(null);
                    navigation.goBack();
                }}
            />
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