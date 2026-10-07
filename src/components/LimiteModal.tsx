import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { Button } from "./Button";
import { colors, radius, spacing } from "../theme/colors";

type LimiteModalProps = {
    visible: boolean;
    mensagem: string;
    onFechar: () => void;
};

// Modal reutilizável, mostrado sempre que o usuário do plano gratuito
// atinge algum limite (clientes, ordens/mês, orçamentos/mês).
export function LimiteModal({ visible, mensagem, onFechar }: LimiteModalProps) {
    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onFechar}>
            <View style={styles.overlay}>
                <View style={styles.content}>

                    <Text style={styles.icone}>⭐</Text>

                    <Text style={styles.titulo}>Limite do plano gratuito atingido</Text>

                    <Text style={styles.mensagem}>{mensagem}</Text>

                    <Button label="Continuar no gratuito" variant="secondary" onPress={onFechar} />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
    },
    content: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        width: "100%",
        alignItems: "center",
    },
    icone: {
        fontSize: 32,
        marginBottom: spacing.sm,
    },
    titulo: {
        fontSize: 17,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: spacing.sm,
        textAlign: "center",
    },
    mensagem: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: "center",
        marginBottom: spacing.lg,
        lineHeight: 20,
    },
});