import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../theme/colors";


type BackButtonProps = {
    onPress: () => void;
    color?: string;
};

// Botão de voltar reutilizável. Por padrão, a cor do ícone é branca
// (para usar em headers azuis, como no Dashboard e na lista de Clientes),
// mas pode ser sobrescrita passando a prop "color" — por exemplo, para
// usar em telas com fundo claro.
export function BackButton({ onPress, color = colors.textInverse }: BackButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={styles.button}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Ionicons name="arrow-back" size={24} color={color} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});