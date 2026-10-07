import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ClientesScreen } from "../screens/ClientesScreen";
import { ServicosScreen } from "../screens/ServicosScreen";
import { AgendaScreen } from "../screens/AgendaScreen";
import { FinanceiroScreen } from "../screens/FinanceiroScreen";
import { colors } from "../theme/colors";


const Tab = createBottomTabNavigator();

export function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarLabelStyle: { fontSize: 11 },
                tabBarIcon: ({ color, size }) => {
                    const icones: Record<string, keyof typeof Ionicons.glyphMap> = {
                        Inicio: "home",
                        ClientesTab: "people",
                        ServicosTab: "build",
                        AgendaTab: "calendar",
                        FinanceiroTab: "cash",
                    };
                    const nomeIcone = icones[route.name] ?? "ellipse";
                    return <Ionicons name={nomeIcone} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Inicio" component={DashboardScreen} options={{ title: "Início" }} />
            <Tab.Screen name="ClientesTab" component={ClientesScreen} options={{ title: "Clientes" }} />

            <Tab.Screen name="ServicosTab" component={ServicosScreen} options={{ title: "Serviços" }} />

            <Tab.Screen name="AgendaTab" component={AgendaScreen} options={{ title: "Agenda" }} />

            <Tab.Screen name="FinanceiroTab" component={FinanceiroScreen} options={{ title: "Financeiro" }} />
        </Tab.Navigator>
    );
}