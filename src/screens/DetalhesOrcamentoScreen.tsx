import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { colors, radius, spacing } from "../theme/colors";
import { listarOrcamentos, atualizarStatusOrcamento } from "../services/orcamentosService";
import { criarOrdemServico } from "../services/ordensServicoService";
import { criarNotificacao } from "../services/notificacoesService";
import { listarClientes } from "../services/clientesService";
import { Orcamento } from "../types/orcamento";
import { BackButton } from "../components/BackButton";
import { Button } from "../components/Button";
import { enviarPeloWhatsapp } from "../utils/whatsapp";

export function DetalhesOrcamentoScreen({ navigation, route }: any) {
    const { user } = useAuth();
    const orcamentoId: string = route.params?.orcamentoId;

    const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
    const [whatsappCliente, setWhatsappCliente] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [modalAprovarVisivel, setModalAprovarVisivel] = useState(false);
    const [dataAgendada, setDataAgendada] = useState("");
    const [horaAgendada, setHoraAgendada] = useState("");
    const [aprovando, setAprovando] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (!user) return;
            const usuarioLogado = user;

            async function carregarDados() {
                try {
                    const [listaOrcamentos, listaClientes] = await Promise.all([
                        listarOrcamentos(usuarioLogado.uid),
                        listarClientes(usuarioLogado.uid),
                    ]);

                    const encontrado = listaOrcamentos.find((o) => o.id === orcamentoId);
                    if (!encontrado) {
                        setError("Orçamento não encontrado.");
                        return;
                    }
                    setOrcamento(encontrado);

                    const cliente = listaClientes.find((c) => c.id === encontrado.clienteId);
                    setWhatsappCliente(cliente?.whatsapp || cliente?.telefone || "");
                } catch (err: any) {
                    setError(err?.message ?? "Não foi possível carregar o orçamento.");
                } finally {
                    setLoading(false);
                }
            }

            carregarDados();
        }, [user, orcamentoId])
    );

    function montarMensagemWhatsapp(): string {
        if (!orcamento) return "";
        const linhasItens = orcamento.itens
            .map((item) => `- ${item.descricao}: R$ ${item.valor.toFixed(2).replace(".", ",")}`)
            .join("\n");

        return `Olá ${orcamento.clienteNome}! Segue seu orçamento:\n\n${linhasItens}\n\nTotal: R$ ${orcamento.total
            .toFixed(2)
            .replace(".", ",")}\n\nAguardo sua aprovação!`;
    }

    function handleEnviarWhatsapp() {
        if (!whatsappCliente) {
            Alert.alert(
                "Sem WhatsApp cadastrado",
                "Este cliente não tem um número de WhatsApp ou telefone cadastrado."
            );
            return;
        }
        enviarPeloWhatsapp(whatsappCliente, montarMensagemWhatsapp());
    }

    function abrirModalAprovacao() {
        setDataAgendada("");
        setHoraAgendada("");
        setModalAprovarVisivel(true);
    }

    async function confirmarAprovacao() {
        if (!user || !orcamento) return;

        if (!dataAgendada.trim() || !horaAgendada.trim()) {
            Alert.alert("Dados incompletos", "Informe a data e a hora do serviço.");
            return;
        }

        setAprovando(true);
        try {
            await atualizarStatusOrcamento(orcamento.id, "aprovado");
            await criarOrdemServico(
                user.uid,
                {
                    clienteId: orcamento.clienteId,
                    clienteNome: orcamento.clienteNome,
                    itens: orcamento.itens,
                    dataAgendada,
                    horaAgendada,
                },
                orcamento.id
            );
            setOrcamento({ ...orcamento, status: "aprovado" });
            setModalAprovarVisivel(false);
            Alert.alert("Sucesso", "Orçamento aprovado! A ordem de serviço foi criada.");

            await criarNotificacao(
                user.uid,
                "orcamento_aprovado",
                "Orçamento aprovado",
                `O orçamento de ${orcamento.clienteNome} foi aprovado e uma ordem de serviço foi criada.`
            );

        } catch (err: any) {
            Alert.alert("Erro", err?.message ?? "Não foi possível aprovar o orçamento.");
        } finally {
            setAprovando(false);
        }
    }

    function getStatusInfo(status: Orcamento["status"]) {
        switch (status) {
            case "aprovado":
                return { texto: "Aprovado", cor: colors.success, fundo: colors.successBg };
            case "recusado":
                return { texto: "Recusado", cor: colors.danger, fundo: colors.dangerBg };
            default:
                return { texto: "Pendente", cor: colors.warning, fundo: colors.warningBg };
        }
    }

    if (loading) {
        return (
            <View style={styles.centered}>
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    if (error || !orcamento) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error ?? "Orçamento não encontrado."}</Text>
            </View>
        );
    }

    const statusInfo = getStatusInfo(orcamento.status);

    return (
        <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
            <View style={styles.header}>

                <View style={styles.headerRow}>

                    <View style={styles.backButtonWrapper}>
                        <BackButton onPress={() => navigation.goBack()} />

                    </View>

                    <Text style={styles.headerTitle}>Orçamento</Text>

                </View>
            </View>

            <View style={styles.content}>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.fundo }]}>

                    <Text style={[styles.statusText, { color: statusInfo.cor }]}>{statusInfo.texto}</Text>
                </View>

                <Text style={styles.sectionLabel}>Cliente</Text>

                <Text style={styles.sectionValue}>{orcamento.clienteNome}</Text>

                <Text style={styles.sectionLabel}>Itens</Text>
                {orcamento.itens.map((item, index) => (
                    <View key={index} style={styles.itemRow}>

                        <Text style={styles.itemDescricao}>{item.descricao}</Text>

                        <Text style={styles.itemValor}>R$ {item.valor.toFixed(2).replace(".", ",")}</Text>
                    </View>
                ))}

                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>

                    <Text style={styles.totalValor}>R$ {orcamento.total.toFixed(2).replace(".", ",")}</Text>
                </View>

                <Button label="📤 Enviar pelo WhatsApp" onPress={handleEnviarWhatsapp} style={styles.whatsappButton} />

                {orcamento.status === "pendente" && (
                    <Button
                        label="Aprovar orçamento"
                        variant="secondary"
                        onPress={abrirModalAprovacao}
                        style={styles.approveButton}
                    />
                )}

                <Button
                    label="Editar"
                    variant="secondary"
                    onPress={() => navigation.navigate("EditarOrcamento", { orcamentoId: orcamento.id })}
                />
            </View>

            <Modal
                visible={modalAprovarVisivel}
                animationType="slide"
                transparent
                onRequestClose={() => setModalAprovarVisivel(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>

                        <Text style={styles.modalTitle}>Aprovar orçamento</Text>

                        <Text style={styles.modalSubtitle}>
                            Informe quando o serviço será realizado. Isso vai gerar uma nova Ordem de Serviço.
                        </Text>

                        <Text style={styles.modalLabel}>Data</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="DD/MM/AAAA"
                            placeholderTextColor={colors.textSecondary}
                            value={dataAgendada}
                            onChangeText={setDataAgendada}
                        />

                        <Text style={styles.modalLabel}>Hora</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="HH:MM"
                            placeholderTextColor={colors.textSecondary}
                            value={horaAgendada}
                            onChangeText={setHoraAgendada}
                        />

                        <Button label="Confirmar aprovação" onPress={confirmarAprovacao} loading={aprovando} />
                        <Button
                            label="Cancelar"
                            variant="secondary"
                            onPress={() => setModalAprovarVisivel(false)}
                            disabled={aprovando}
                            style={styles.modalCancelButton}
                        />
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    container: { flexGrow: 1 },
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
    errorText: {
        color: colors.danger,
        fontSize: 14,
        textAlign: "center",
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
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        marginBottom: spacing.md,
    },
    statusText: {
        fontSize: 13,
        fontWeight: "600",
    },
    sectionLabel: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    sectionValue: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: colors.surface,
        borderRadius: radius.sm,
        padding: spacing.sm,
        marginBottom: spacing.xs,
    },
    itemDescricao: {
        fontSize: 14,
        color: colors.textPrimary,
    },
    itemValor: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: spacing.sm,
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
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
    whatsappButton: {
        backgroundColor: "#25D366",
        marginBottom: spacing.sm,
    },
    approveButton: {
        marginTop: spacing.sm,
        marginBottom: spacing.sm,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        padding: spacing.lg,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    modalSubtitle: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: spacing.md,
        lineHeight: 18,
    },
    modalLabel: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    modalInput: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.md,
        fontSize: 15,
        color: colors.textPrimary,
        backgroundColor: colors.background,
        marginBottom: spacing.sm,
    },
    modalCancelButton: {
        marginTop: spacing.sm,
    },
});