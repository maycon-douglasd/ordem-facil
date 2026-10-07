import React, { useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, radius, spacing } from "../theme/colors";
import { BackButton } from "../components/BackButton";
import { enviarPeloWhatsapp } from "../utils/whatsapp";

const PERGUNTAS_FREQUENTES = [
    {
        pergunta: "Como funciona o plano gratuito?",
        resposta:
            "O plano gratuito permite até 5 clientes, 3 ordens de serviço por mês e 3 orçamentos por mês, com histórico completo e envio de orçamentos pelo WhatsApp.",
    },
    {
        pergunta: "Como aprovo um orçamento?",
        resposta:
            "Na tela de detalhes do orçamento, toque em \"Aprovar orçamento\", informe a data e hora do serviço, e uma Ordem de Serviço será criada automaticamente.",
    },
    {
        pergunta: "Como mudo o status de uma Ordem de Serviço?",
        resposta:
            "Abra a Ordem de Serviço na Agenda ou na lista de Ordens de Serviço, e toque em um dos botões de status (Agendado, Em andamento, Concluído, Cancelado).",
    },
    {
        pergunta: "O que significa a caixinha azul no topo do Dashboard?",
        resposta:
            "É o \"Próximo passo\": uma dica automática sobre o que precisa da sua atenção agora, como atendimentos atrasados, orçamentos aguardando resposta há mais de 2 dias, ou atendimentos agendados para hoje. Quando não há nada pendente, ela mostra \"Tudo em dia!\".",
    },
];

export function CentralAjudaScreen({ navigation }: any) {
    const [perguntaAberta, setPerguntaAberta] = useState<number | null>(null);

    function alternarPergunta(index: number) {
        setPerguntaAberta((atual) => (atual === index ? null : index));
    }

    function handleFalarComSuporte() {
        enviarPeloWhatsapp(
            "5584981096129",
            "Olá! Preciso de ajuda com o app Ordem Fácil."
        );
    }


    function handleAbrirPoliticas() {
        Linking.openURL("https://claude.ai/artifact/GJCBFwSJbGFKfqXptmyu8N");
    }

    return (
        <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerRow}>

                    <View style={styles.backButtonWrapper}>
                        <BackButton onPress={() => navigation.goBack()} />
                    </View>

                    <Text style={styles.headerTitle}>Central de ajuda</Text>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Perguntas frequentes</Text>

                {PERGUNTAS_FREQUENTES.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.perguntaCard}
                        onPress={() => alternarPergunta(index)}
                    >
                        <View style={styles.perguntaHeaderRow}>
                            <Text style={styles.perguntaTexto}>{item.pergunta}</Text>

                            <Text style={styles.perguntaIcone}>
                                {perguntaAberta === index ? "−" : "+"}
                            </Text>
                        </View>

                        {perguntaAberta === index && (
                            <Text style={styles.respostaTexto}>{item.resposta}</Text>
                        )}
                    </TouchableOpacity>
                ))}

                <Text style={styles.sectionTitle}>Precisa de mais ajuda?</Text>

                <TouchableOpacity style={styles.suporteButton} onPress={handleFalarComSuporte}>

                    <Text style={styles.suporteButtonText}>💬 Falar com suporte</Text>
                </TouchableOpacity>

                <View style={styles.linksLegais}>
                    <TouchableOpacity onPress={handleAbrirPoliticas}>
                        <Text style={styles.linkLegal}>Política de Privacidade e Termos de Uso</Text>
                    </TouchableOpacity>
                </View>
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
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.textPrimary,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    perguntaCard: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    perguntaHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    perguntaTexto: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        color: colors.textPrimary,
        marginRight: spacing.sm,
    },
    perguntaIcone: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.primary,
    },
    respostaTexto: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: spacing.sm,
        lineHeight: 19,
    },
    suporteButton: {
        backgroundColor: "#25D366",
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        alignItems: "center",
    },
    suporteButtonText: {
        color: colors.textInverse,
        fontSize: 14,
        fontWeight: "700",
    },
    linksLegais: {
        marginTop: spacing.lg,
        gap: spacing.sm,
    },
    linkLegal: {
        fontSize: 13,
        color: colors.primary,
        textDecorationLine: "underline",
    },
});