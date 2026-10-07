import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { colors, spacing } from "../../theme/colors";
import { validateLoginForm } from "../../utils/validators";

export function LoginScreen({ navigation }: any) {
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);
    // Erro por campo (validação local) e erro geral (vindo do Firebase/rede)
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [generalError, setGeneralError] = useState<string | null>(null);

    async function handleLogin() {
        setGeneralError(null);

        const validationError = validateLoginForm(email, senha);
        if (validationError) {
            setFieldError(validationError);
            return;
        }
        setFieldError(null);

        setLoading(true);
        try {
            await login(email, senha);
            // Não precisa navegar manualmente: o AppNavigator observa o estado
            // de autenticação e troca de pilha (Auth -> App) sozinho.
        } catch (error: any) {
            setGeneralError(error?.message ?? "Não foi possível entrar. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Ordem Fácil</Text>

                    <Text style={styles.subtitle}>Organize seus serviços. Aumente seus resultados.</Text>
                </View>

                <View style={styles.form}>
                    <TextField
                        label="E-mail"
                        placeholder="seuemail@exemplo.com"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        editable={!loading}
                    />
                    
                    <TextField
                        label="Senha"
                        placeholder="Sua senha"
                        isPassword
                        value={senha}
                        onChangeText={setSenha}
                        editable={!loading}
                    />

                    {fieldError && <Text style={styles.errorBanner}>{fieldError}</Text>}
                    {generalError && <Text style={styles.errorBanner}>{generalError}</Text>}

                    <Button label="Entrar" onPress={handleLogin} loading={loading} />

                    <Button
                        label="Criar conta"
                        variant="secondary"
                        onPress={() => navigation.navigate("Cadastro")}
                        disabled={loading}
                        style={styles.registerButton}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    container: {
        flexGrow: 1,
        justifyContent: "center",
        padding: spacing.lg,
    },
    header: {
        alignItems: "center",
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: "center",
    },
    form: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.lg,
    },
    errorBanner: {
        color: colors.danger,
        fontSize: 13,
        marginBottom: spacing.sm,
        textAlign: "center",
    },
    registerButton: {
        marginTop: spacing.sm,
    },
});