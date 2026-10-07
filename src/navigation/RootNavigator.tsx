import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { ClienteFormScreen } from "../screens/ClienteFormScreen";
import { ServicoFormScreen } from "../screens/ServicoFormScreen";
import { OrcamentosScreen } from "../screens/OrcamentosScreen";
import { OrcamentoFormScreen } from "../screens/OrcamentoFormScreen";
import { DetalhesOrcamentoScreen } from "../screens/DetalhesOrcamentoScreen";
import { OrdensServicoScreen } from "../screens/OrdensServicoScreen";
import { OrdemServicoFormScreen } from "../screens/OrdemServicoFormScreen";
import { DetalhesOrdemScreen } from "../screens/DetalhesOrdemScreen";
import { DrawerNavigator } from "./DrawerNavigator";
import { PerfilScreen } from "../screens/PerfilScreen";
import { MeuPlanoScreen } from "../screens/MeuPlanoScreen";
import { MinhaEmpresaScreen } from "../screens/MinhaEmpresaScreen";
import { ConfiguracoesScreen } from "../screens/ConfiguracoesScreen";
import { CentralAjudaScreen } from "../screens/CentralAjudaScreen";
import { NotificacoesScreen } from "../screens/NotificacoesScreen";
import { DespesaFormScreen } from "../screens/DespesaFormScreen";
import { FinanceiroCompletoScreen } from "../screens/FinanceiroCompletoScreen";
import { colors } from "../theme/colors";
import { AuthStackParamList, AppStackParamList } from "../types/navigation";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Cadastro" component={RegisterScreen} />
        </AuthStack.Navigator>
    );
}

function AppNavigator() {
    return (
        <AppStack.Navigator screenOptions={{ headerShown: false }}>
            <AppStack.Screen name="MainTabs" component={DrawerNavigator} />

            <AppStack.Screen name="Perfil" component={PerfilScreen} />

            <AppStack.Screen name="MeuPlano" component={MeuPlanoScreen} />

            <AppStack.Screen name="MinhaEmpresa" component={MinhaEmpresaScreen} />

            <AppStack.Screen name="Configuracoes" component={ConfiguracoesScreen} />

            <AppStack.Screen name="CentralAjuda" component={CentralAjudaScreen} />

            <AppStack.Screen name="Notificacoes" component={NotificacoesScreen} />

            <AppStack.Screen name="NovaDespesa" component={DespesaFormScreen} />

            <AppStack.Screen name="FinanceiroCompleto" component={FinanceiroCompletoScreen} />

            <AppStack.Screen name="NovoCliente" component={ClienteFormScreen} />

            <AppStack.Screen name="EditarCliente" component={ClienteFormScreen} />

            <AppStack.Screen name="NovoServico" component={ServicoFormScreen} />

            <AppStack.Screen name="EditarServico" component={ServicoFormScreen} />

            <AppStack.Screen name="Orcamentos" component={OrcamentosScreen} />

            <AppStack.Screen name="NovoOrcamento" component={OrcamentoFormScreen} />

            <AppStack.Screen name="EditarOrcamento" component={OrcamentoFormScreen} />

            <AppStack.Screen name="DetalhesOrcamento" component={DetalhesOrcamentoScreen} />

            <AppStack.Screen name="OrdensServico" component={OrdensServicoScreen} />

            <AppStack.Screen name="NovaOrdemServico" component={OrdemServicoFormScreen} />

            <AppStack.Screen name="EditarOrdemServico" component={OrdemServicoFormScreen} />

            <AppStack.Screen name="DetalhesOrdem" component={DetalhesOrdemScreen} />
        </AppStack.Navigator>
    );
}

export function RootNavigator() {
    const { user, loadingAuthState } = useAuth();

    // Enquanto o Firebase ainda está checando se existe uma sessão salva,
    // mostramos loading — evita um "flash" da tela de Login antes do Dashboard.
    if (loadingAuthState) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
    },
});