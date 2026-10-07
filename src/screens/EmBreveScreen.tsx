import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../theme/colors";


type EmBreveScreenProps = {
  route: {
    params?: {
      titulo?: string;
    };
  };
};

// Tela reutilizável para funcionalidades que ainda não foram construídas.
// Recebe o nome da funcionalidade (ex: "Serviços", "Agenda") pela navegação,
// e mostra uma mensagem apropriada, em vez de dar erro ou tela em branco.
export function EmBreveScreen({ route }: EmBreveScreenProps) {
  const titulo = route.params?.titulo ?? "Esta funcionalidade";

  return (
    <View style={styles.container}>
      <Ionicons name="construct-outline" size={48} color={colors.textSecondary} />
      <Text style={styles.title}>{titulo}</Text>
      <Text style={styles.subtitle}>
        Essa funcionalidade ainda está sendo construída. Em breve estará disponível por aqui!
      </Text>
    </View>
  );
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
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});