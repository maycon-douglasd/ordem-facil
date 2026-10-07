import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "./Button";
import { colors, spacing } from "../theme/colors";

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

// Regra do projeto: nenhuma tela pode quebrar o app inteiro.
// Isso captura qualquer erro de renderização não tratado em qualquer tela
// filha e mostra uma tela amigável, com opção de tentar de novo.
export class ErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        // Aqui, futuramente, entra o envio para Sentry/Crashlytics
        console.error("[ErrorBoundary] Erro não tratado:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Algo deu errado</Text>
                    
                    <Text style={styles.message}>
                        Ocorreu um erro inesperado. Tente novamente.
                    </Text>

                    <Button label="Tentar novamente" onPress={() => this.setState({ hasError: false })} />
                </View>
            );
        }
        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.lg,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    message: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: "center",
        marginBottom: spacing.lg,
    },
});