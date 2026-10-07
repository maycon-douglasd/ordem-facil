import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/Button";
import { colors, radius, spacing } from "../theme/colors";
import { listarClientes } from "../services/clientesService";
import { listarServicos } from "../services/servicosService";
import {
    atualizarOrdemServico,
    criarOrdemServico,
    listarOrdensServico,
    LimitePlanoError,
} from "../services/ordensServicoService";
import { Cliente } from "../types/cliente";
import { Servico } from "../types/servico";
import { ItemOrcamento } from "../types/orcamento";
import { OrdemServicoFormData } from "../types/ordemServico";
import { isValidData, isValidHora } from "../utils/validators";
import { temConexaoComInternet, MENSAGEM_SEM_CONEXAO } from "../utils/conexao";
import { LimiteModal } from "../components/LimiteModal";

export function OrdemServicoFormScreen({ navigation, route }: any) {
    const { user } = useAuth();

    const ordemId: string | undefined = route.params?.ordemId;
    const modoEdicao = !!ordemId;

    const [clienteId, setClienteId] = useState("");
    const [clienteNome, setClienteNome] = useState("");
    const [itens, setItens] = useState<ItemOrcamento[]>([]);
    const [dataAgendada, setDataAgendada] = useState("");
    const [horaAgendada, setHoraAgendada] = useState("");

    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [servicos, setServicos] = useState<Servico[]>([]);

    const [modalClienteVisivel, setModalClienteVisivel] = useState(false);
    const [modalItemVisivel, setModalItemVisivel] = useState(false);

    const [itemDescricao, setItemDescricao] = useState("");
    const [itemValor, setItemValor] = useState("");

    const [loadingDados, setLoadingDados] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [mensagemLimite, setMensagemLimite] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        const usuarioLogado = user;

        async function carregarDados() {
            try {
                const [listaClientes, listaServicos] = await Promise.all([
                    listarClientes(usuarioLogado.uid),
                    listarServicos(usuarioLogado.uid),
                ]);
                setClientes(listaClientes);
                setServicos(listaServicos);

                if (modoEdicao) {
                    const listaOrdens = await listarOrdensServico(usuarioLogado.uid);
                    const ordem = listaOrdens.find((o) => o.id === ordemId);

                    if (!ordem) {
                        setGeneralError("Ordem de serviço não encontrada.");
                        return;
                    }

                    setClienteId(ordem.clienteId);
                    setClienteNome(ordem.clienteNome);
                    setItens(ordem.itens);
                    setDataAgendada(ordem.dataAgendada);
                    setHoraAgendada(ordem.horaAgendada);
                }
            } catch (err: any) {
                setGeneralError(err?.message ?? "Não foi possível carregar os dados.");
            } finally {
                setLoadingDados(false);
            }
        }

        carregarDados();
    }, [user, modoEdicao]);

    function adicionarItemDoServico(servico: Servico) {
        setItens((atual) => [...atual, { descricao: servico.nome, valor: servico.valorPadrao }]);
        setModalItemVisivel(false);
    }

    function adicionarItemAvulso() {
        const valorNumerico = Number(itemValor.replace(",", "."));
        if (!itemDescricao.trim() || isNaN(valorNumerico) || valorNumerico < 0) {
            Alert.alert("Item inválido", "Informe uma descrição e um valor válido.");
            return;
        }
        setItens((atual) => [...atual, { descricao: itemDescricao.trim(), valor: valorNumerico }]);
        setItemDescricao("");
        setItemValor("");
        setModalItemVisivel(false);
    }

    function removerItem(index: number) {
        setItens((atual) => atual.filter((_, i) => i !== index));
    }

    function calcularTotal(): number {
        return itens.reduce((soma, item) => soma + item.valor, 0);
    }

    function validarFormulario(): string | null {
        if (!clienteId) return "Selecione um cliente.";
        if (itens.length === 0) return "Adicione pelo menos um item.";
        if (!dataAgendada.trim()) return "Informe a data agendada.";
        if (!isValidData(dataAgendada)) return "Informe uma data válida (DD/MM/AAAA).";
        if (!horaAgendada.trim()) return "Informe a hora agendada.";
        if (!isValidHora(horaAgendada)) return "Informe uma hora válida (HH:MM).";
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

        const dados: OrdemServicoFormData = {
            clienteId,
            clienteNome,
            itens,
            dataAgendada,
            horaAgendada,
        };

        setSalvando(true);
        try {
            if (modoEdicao && ordemId) {
                await atualizarOrdemServico(ordemId, dados);
            } else {
                await criarOrdemServico(user.uid, dados);
            }
            navigation.goBack();
        } catch (err: any) {
            if (err instanceof LimitePlanoError) {
                setMensagemLimite(err.message);
            } else {
                setGeneralError(err?.message ?? "Não foi possível salvar a ordem de serviço.");
            }
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
                <Text style={styles.title}>
                    {modoEdicao ? "Editar ordem de serviço" : "Nova ordem de serviço"}
                </Text>

                <Text style={styles.label}>Cliente *</Text>

                <TouchableOpacity
                    style={styles.selectorButton}
                    onPress={() => setModalClienteVisivel(true)}
                >
                    <Text style={clienteNome ? styles.selectorTextFilled : styles.selectorTextPlaceholder}>
                        {clienteNome || "Selecionar cliente"}
                    </Text>
                </TouchableOpacity>

                <View style={styles.dataHoraRow}>
                    <View style={styles.dataHoraField}>
                        <Text style={styles.label}>Data *</Text>

                        <TextInput
                            style={styles.textInput}
                            placeholder="DD/MM/AAAA"
                            placeholderTextColor={colors.textSecondary}
                            value={dataAgendada}
                            onChangeText={setDataAgendada}
                        />
                    </View>

                    <View style={styles.dataHoraField}>
                        <Text style={styles.label}>Hora *</Text>

                        <TextInput
                            style={styles.textInput}
                            placeholder="HH:MM"
                            placeholderTextColor={colors.textSecondary}
                            value={horaAgendada}
                            onChangeText={setHoraAgendada}
                        />
                    </View>
                </View>

                <Text style={styles.label}>Itens</Text>
                {itens.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                        <Text style={styles.itemDescricao}>{item.descricao}</Text>

                        <Text style={styles.itemValor}>R$ {item.valor.toFixed(2).replace(".", ",")}</Text>

                        <TouchableOpacity onPress={() => removerItem(index)} style={styles.itemRemoveButton}>

                            <Text style={styles.itemRemoveText}>×</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity
                    style={styles.addItemButton}
                    onPress={() => setModalItemVisivel(true)}
                >
                    <Text style={styles.addItemButtonText}>+ Adicionar item</Text>
                </TouchableOpacity>

                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>

                    <Text style={styles.totalValor}>R$ {calcularTotal().toFixed(2).replace(".", ",")}</Text>
                </View>

                {fieldError && <Text style={styles.errorBanner}>{fieldError}</Text>}
                {generalError && <Text style={styles.errorBanner}>{generalError}</Text>}

                <Button
                    label={modoEdicao ? "Salvar alterações" : "Salvar ordem de serviço"}
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

            <Modal
                visible={modalClienteVisivel}
                animationType="slide"
                onRequestClose={() => setModalClienteVisivel(false)}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Selecionar cliente</Text>
                    <FlatList
                        data={clientes}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.modalListContent}
                        ListEmptyComponent={
                            <Text style={styles.modalEmptyText}>
                                Nenhum cliente cadastrado ainda. Cadastre um cliente primeiro.
                            </Text>
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => {
                                    setClienteId(item.id);
                                    setClienteNome(item.nome);
                                    setModalClienteVisivel(false);
                                }}
                            >
                                <Text style={styles.modalItemText}>{item.nome}</Text>
                            </TouchableOpacity>
                        )}
                    />
                    <Button
                        label="Fechar"
                        variant="secondary"
                        onPress={() => setModalClienteVisivel(false)}
                    />
                </View>
            </Modal>

            <Modal
                visible={modalItemVisivel}
                animationType="slide"
                onRequestClose={() => setModalItemVisivel(false)}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Adicionar item</Text>

                    <Text style={styles.modalSubtitle}>Do catálogo de serviços</Text>
                    <FlatList
                        data={servicos}
                        keyExtractor={(item) => item.id}
                        style={styles.modalServicosList}
                        ListEmptyComponent={
                            <Text style={styles.modalEmptyText}>Nenhum serviço no catálogo ainda.</Text>
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => adicionarItemDoServico(item)}
                            >
                                <Text style={styles.modalItemText}>{item.nome}</Text>
                                <Text style={styles.modalItemValor}>
                                    R$ {item.valorPadrao.toFixed(2).replace(".", ",")}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />

                    <Text style={styles.modalSubtitle}>Ou adicione um item avulso</Text>
                    <TextInput
                        style={styles.modalInput}
                        placeholder="Descrição do item"
                        placeholderTextColor={colors.textSecondary}
                        value={itemDescricao}
                        onChangeText={setItemDescricao}
                    />
                    <TextInput
                        style={styles.modalInput}
                        placeholder="Valor (R$)"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="decimal-pad"
                        value={itemValor}
                        onChangeText={setItemValor}
                    />
                    <Button label="Adicionar item avulso" onPress={adicionarItemAvulso} />

                    <Button
                        label="Fechar"
                        variant="secondary"
                        onPress={() => setModalItemVisivel(false)}
                        style={styles.modalCloseButton}
                    />
                </View>
            </Modal>

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
    label: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        marginTop: spacing.sm,
    },
    selectorButton: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.md,
        justifyContent: "center",
        backgroundColor: colors.surface,
    },
    selectorTextFilled: {
        fontSize: 15,
        color: colors.textPrimary,
    },
    selectorTextPlaceholder: {
        fontSize: 15,
        color: colors.textSecondary,
    },
    dataHoraRow: {
        flexDirection: "row",
        gap: spacing.sm,
    },
    dataHoraField: {
        flex: 1,
    },
    textInput: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.md,
        fontSize: 15,
        color: colors.textPrimary,
        backgroundColor: colors.surface,
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface,
        borderRadius: radius.sm,
        padding: spacing.sm,
        marginTop: spacing.xs,
    },
    itemDescricao: {
        flex: 1,
        fontSize: 14,
        color: colors.textPrimary,
    },
    itemValor: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textPrimary,
        marginRight: spacing.sm,
    },
    itemRemoveButton: {
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    itemRemoveText: {
        fontSize: 18,
        color: colors.danger,
        fontWeight: "700",
    },
    addItemButton: {
        marginTop: spacing.sm,
        paddingVertical: spacing.sm,
    },
    addItemButtonText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: "600",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: spacing.lg,
        marginBottom: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    totalValor: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.success,
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
    modalContainer: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.lg,
        paddingTop: spacing.xl * 1.5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    modalSubtitle: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textSecondary,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    modalListContent: {
        flexGrow: 1,
    },
    modalServicosList: {
        maxHeight: 180,
    },
    modalEmptyText: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: "center",
        padding: spacing.md,
    },
    modalItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalItemText: {
        fontSize: 15,
        color: colors.textPrimary,
    },
    modalItemValor: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.success,
    },
    modalInput: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.md,
        fontSize: 15,
        color: colors.textPrimary,
        backgroundColor: colors.surface,
        marginBottom: spacing.sm,
    },
    modalCloseButton: {
        marginTop: spacing.md,
    },
});