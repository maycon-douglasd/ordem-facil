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
import { validateRegisterForm } from "../../utils/validators";

export function RegisterScreen({ navigation }: any) {
    const { cadastrar } = useAuth();

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [loading, setLoading] = useState(false);
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [generalError, setGeneralError] = useState<string | null>(null);

    async function handleRegister() {
        setGeneralError(null);

        const validationError = validateRegisterForm(nome, email, senha, confirmarSenha);
        if (validationError) {
            setFieldError(validationError);
            return;
        }
        setFieldError(null);

        setLoading(true);
        try {
            await cadastrar(nome, email, senha);
            // Após cadastrar, o AuthContext detecta o novo usuário logado
            // e o AppNavigator troca de tela automaticamente.
        } catch (error: any) {
            setGeneralError(error?.message ?? "Não foi possível criar a conta. Tente novamente.");
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
                    <Text style={styles.title}>Criar conta</Text>
                    <Text style={styles.subtitle}>Comece a organizar seus serviços agora.</Text>
                </View>

                <View style={styles.form}>
                    <TextField label="Nome" placeholder="Seu nome" value={nome} onChangeText={setNome} editable={!loading} />
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
                        placeholder="Mínimo 6 caracteres"
                        isPassword
                        value={senha}
                        onChangeText={setSenha}
                        editable={!loading}
                    />

                    <TextField
                        label="Confirmar senha"
                        placeholder="Repita a senha"
                        isPassword
                        value={confirmarSenha}
                        onChangeText={setConfirmarSenha}
                        editable={!loading}
                    />

                    {fieldError && <Text style={styles.errorBanner}>{fieldError}</Text>}
                    {generalError && <Text style={styles.errorBanner}>{generalError}</Text>}

                    <Button label="Criar conta" onPress={handleRegister} loading={loading} />

                    <Button
                        label="Já tenho conta"
                        variant="secondary"
                        onPress={() => navigation.navigate("Login")}
                        disabled={loading}
                        style={styles.backButton}
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
        fontSize: 24,
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
    backButton: {
        marginTop: spacing.sm,
    },
});