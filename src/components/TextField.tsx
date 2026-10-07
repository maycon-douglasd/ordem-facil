import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme/colors";

type TextFieldProps = TextInputProps & {
    label: string;
    errorMessage?: string | null;
    isPassword?: boolean;
};

export function TextField({
    label,
    errorMessage,
    isPassword = false,
    style,
    ...rest
}: TextFieldProps) {
    // Controla se a senha está visível ou oculta. Começa sempre oculta,
    // por segurança — o usuário escolhe revelar, não o contrário.
    const [senhaVisivel, setSenhaVisivel] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={[
                        styles.input,
                        errorMessage ? styles.inputError : null,
                        isPassword && styles.inputWithIcon,
                        style,
                    ]}
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="none"
                    secureTextEntry={isPassword && !senhaVisivel}
                    {...rest}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setSenhaVisivel((atual) => !atual)}
                        style={styles.eyeButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons
                            name={senhaVisivel ? "eye-off" : "eye"}
                            size={20}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>
            <Text style={styles.errorText}>{errorMessage ?? " "}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.sm,
    },
    label: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    inputWrapper: {
        position: "relative",
        justifyContent: "center",
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.md,
        fontSize: 15,
        color: colors.textPrimary,
        backgroundColor: colors.surface,
    },
    inputWithIcon: {
        paddingRight: 44,
    },
    inputError: {
        borderColor: colors.danger,
    },
    eyeButton: {
        position: "absolute",
        right: spacing.md,
    },
    errorText: {
        fontSize: 12,
        color: colors.danger,
        marginTop: spacing.xs,
        minHeight: 14,
    },
});