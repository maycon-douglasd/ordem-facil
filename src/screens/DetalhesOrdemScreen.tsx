import React, { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { colors, radius, spacing } from "../theme/colors";
import {
    listarOrdensServico,
    atualizarStatusOrdem,
    definirOrdemPaga,
} from "../services/ordensServicoService";
import { buscarPlanoUsuario } from "../services/usuarioService";
import { listarClientes } from "../services/clientesService";
import { OrdemServico, StatusOrdem } from "../types/ordemServico";
import { BackButton } from "../components/BackButton";
import { Button } from "../components/Button";
import { enviarPeloWhatsapp } from "../utils/whatsapp";

export function DetalhesOrdemScreen({ navigation, route }: any) {
    const { user } = useAuth();
    const ordemId: string = route.params?.ordemId;

    const [ordem, setOrdem] = useState<OrdemServico | null>(null);
    const [whatsappCliente, setWhatsappCliente] = useState("");
    const [ehProfissional, setEhProfissional] = useState(false);
    const [loading, setLoading] = useState(true);
    const [atualizandoStatus, setAtualizandoStatus] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            if (!user) return;
            const usuarioLogado = user;

            async function carregarOrdem() {
                try {
                    const [lista, listaClientes] = await Promise.all([
                        listarOrdensServico(usuarioLogado.uid),
                        listarClientes(usuarioLogado.uid),
                    ]);
                    const encontrada = lista.find((o) => o.id === ordemId);

                    if (!encontrada) {
                        setError("Ordem de serviço não encontrada.");
                        return;
                    }

                    setOrdem(encontrada);

                    const cliente = listaClientes.find((c) => c.id === encontrada.clienteId);
                    setWhatsappCliente(cliente?.whatsapp || cliente?.telefone || "");

                    const plano = await buscarPlanoUsuario(usuarioLogado.uid);
                    setEhProfissional(plano === "profissional");
                } catch (err: any) {
                    setError(err?.message ?? "Não foi possível carregar a ordem de serviço.");
                } finally {
                    setLoading(false);
                }
            }

            carregarOrdem();
        }, [user, ordemId])
    );

    function montarMensagemWhatsapp(): string {
        if (!ordem) return "";
        const numeroFormatado = ordem.numero.toString().padStart(3, "0");
        return `Olá ${ordem.clienteNome}! Confirmando seu atendimento (OS #${numeroFormatado}):\n\n${ordem.itens
            .map((item) => `- ${item.descricao}`)
            .join("\n")}\n\nData: ${ordem.dataAgendada} às ${ordem.horaAgendada}`;
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

    async function handleTogglePago() {
        if (!ordem) return;

        const novoValor = !ordem.pago;
        try {
            await definirOrdemPaga(ordem.id, novoValor);
            setOrdem({ ...ordem, pago: novoValor });
        } catch (err: any) {
            Alert.alert("Erro", err?.message ?? "Não foi possível atualizar o pagamento.");
        }
    }

    async function handleMudarStatus(novoStatus: StatusOrdem) {
        if (!ordem) return;

        setAtualizandoStatus(true);
        try {
            await atualizarStatusOrdem(ordem.id, novoStatus);
            setOrdem({ ...ordem, status: novoStatus });
        } catch (err: any) {
            Alert.alert("Erro", err?.message ?? "Não foi possível atualizar o status.");
        } finally {
            setAtualizandoStatus(false);
        }
    }

    function getStatusInfo(status: StatusOrdem) {
        switch (status) {
            case "em_andamento":
                return { texto: "Em andamento", cor: colors.info, fundo: colors.infoBg };
            case "concluido":
                return { texto: "Concluído", cor: colors.success, fundo: colors.successBg };
            case "cancelado":
                return { texto: "Cancelado", cor: colors.danger, fundo: colors.dangerBg };
            default:
                return { texto: "Agendado", cor: colors.warning, fundo: colors.warningBg };
        }
    }

    if (loading) {
        return (
            <View style={styles.centered}>
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    if (error || !ordem) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error ?? "Ordem não encontrada."}</Text>
            </View>
        );
    }

    const statusInfo = getStatusInfo(ordem.status);
    const numeroFormatado = ordem.numero.toString().padStart(3, "0");

    const statusOptions: { valor: StatusOrdem; label: string }[] = [
        { valor: "agendado", label: "Agendado" },
        { valor: "em_andamento", label: "Em andamento" },
        { valor: "concluido", label: "Concluído" },
        { valor: "cancelado", label: "Cancelado" },
    ];

    return (
        <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerRow}>

                    <View style={styles.backButtonWrapper}>
                        <BackButton onPress={() => navigation.goBack()} />
                    </View>

                    <Text style={styles.headerTitle}>OS #{numeroFormatado}</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.fundo }]}>

                    <Text style={[styles.statusText, { color: statusInfo.cor }]}>{statusInfo.texto}</Text>
                </View>

                <Text style={styles.sectionLabel}>Cliente</Text>

                <Text style={styles.sectionValue}>{ordem.clienteNome}</Text>

                <Text style={styles.sectionLabel}>Data e hora</Text>

                <Text style={styles.sectionValue}>
                    {ordem.dataAgendada} - {ordem.horaAgendada}
                </Text>

                <Text style={styles.sectionLabel}>Itens</Text>
                {ordem.itens.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                        <Text style={styles.itemDescricao}>{item.descricao}</Text>

                        <Text style={styles.itemValor}>R$ {item.valor.toFixed(2).replace(".", ",")}</Text>
                    </View>
                ))}

                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>

                    <Text style={styles.totalValor}>R$ {ordem.total.toFixed(2).replace(".", ",")}</Text>
                </View>

                {ehProfissional && (
                    <Button
                        label="📤 Confirmar pelo WhatsApp"
                        onPress={handleEnviarWhatsapp}
                        style={styles.whatsappButton}
                    />
                )}

                <Button
                    label="Editar ordem"
                    variant="secondary"
                    onPress={() => navigation.navigate("EditarOrdemServico", { ordemId: ordem.id })}
                    style={styles.editButton}
                />


                <TouchableOpacity
                    style={[styles.pagoButton, ordem.pago && styles.pagoButtonAtivo]}
                    onPress={handleTogglePago}
                >
                    <Text style={[styles.pagoButtonText, ordem.pago && styles.pagoButtonTextAtivo]}>
                        {ordem.pago ? "✓ Pago" : "Marcar como pago"}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.sectionLabel}>Alterar status</Text>

                <View style={styles.statusButtonsRow}>
                    {statusOptions.map((opcao) => {
                        const isAtual = ordem.status === opcao.valor;
                        return (
                            <TouchableOpacity
                                key={opcao.valor}
                                style={[styles.statusButton, isAtual && styles.statusButtonAtivo]}
                                onPress={() => handleMudarStatus(opcao.valor)}
                                disabled={atualizandoStatus || isAtual}
                            >
                                <Text style={[styles.statusButtonText, isAtual && styles.statusButtonTextAtivo]}>
                                    {opcao.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
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
        marginTop: spacing.md,
    },
    editButton: {
        marginTop: spacing.sm,
    },
    pagoButton: {
        marginTop: spacing.sm,
        height: 48,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
    },
    pagoButtonAtivo: {
        backgroundColor: colors.successBg,
        borderColor: colors.success,
    },
    pagoButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    pagoButtonTextAtivo: {
        color: colors.success,
    },
    statusButtonsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
    },
    statusButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    statusButtonAtivo: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    statusButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    statusButtonTextAtivo: {
        color: colors.textInverse,
    },
});