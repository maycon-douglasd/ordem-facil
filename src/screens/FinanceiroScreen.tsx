import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { buscarPlanoUsuario } from "../services/usuarioService";
import { colors } from "../theme/colors";
import { FinanceiroBloqueadoScreen } from "./FinanceiroBloqueadoScreen";
import { FinanceiroCompletoScreen } from "./FinanceiroCompletoScreen";

// Decide qual versão da tela de Financeiro mostrar, dependendo do plano
// do usuário logado. Usuários Gratuitos veem a prévia bloqueada;
// usuários Profissionais veem a versão completa.
export function FinanceiroScreen({ navigation }: any) {
  const { user } = useAuth();
  const [plano, setPlano] = useState<"gratis" | "profissional" | null>(null);

  useEffect(() => {
    if (!user) return;

    async function verificarPlano() {
      const planoAtual = await buscarPlanoUsuario(user!.uid);
      setPlano(planoAtual);
    }

    verificarPlano();
  }, [user]);

  if (plano === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (plano === "gratis") {
    return <FinanceiroBloqueadoScreen navigation={navigation} />;
  }

  // Usuário Profissional: mostra a versão completa do Financeiro.
  return <FinanceiroCompletoScreen navigation={navigation} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});