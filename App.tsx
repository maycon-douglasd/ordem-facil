import React from "react";
import { StatusBar } from "expo-status-bar";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { AuthProvider } from "./src/contexts/AuthContext";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StatusBar style="light"/>
        <RootNavigator />
      </AuthProvider>
    </ErrorBoundary>
  )
}