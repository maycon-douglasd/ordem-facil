import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import { colors, radius, spacing } from "../theme/colors";

type ButtonProps = {
    label: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: "primary" | "secondary";
    style?: ViewStyle;
};

export function Button({
    label,
    onPress,
    loading = false,
    disabled = false,
    variant = "primary",
    style,
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.85}
            style={[
                styles.base,
                variant === "primary" ? styles.primary : styles.secondary,
                isDisabled && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={variant === "primary" ? colors.textInverse : colors.primary} />
            ) : (
                <Text style={variant === "primary" ? styles.textPrimary : styles.textSecondary}>
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        height: 52,
        borderRadius: radius.md,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
    },
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    disabled: {
        opacity: 0.6,
    },
    textPrimary: {
        color: colors.textInverse,
        fontSize: 16,
        fontWeight: "600",
    },
    textSecondary: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: "600",
    },
});