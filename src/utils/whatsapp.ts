import { Linking, Alert } from "react-native";

// Remove tudo que não for número do telefone (parênteses, traços, espaços),
// e garante o código do Brasil (55) na frente, exigido pelo formato do WhatsApp.
function formatarNumeroWhatsapp(numero: string): string {
    const apenasNumeros = numero.replace(/\D/g, "");
    if (apenasNumeros.startsWith("55")) return apenasNumeros;
    return `55${apenasNumeros}`;
}

// Abre o WhatsApp com uma mensagem pré-preenchida para o número informado.
export async function enviarPeloWhatsapp(numero: string, mensagem: string): Promise<void> {
    const numeroFormatado = formatarNumeroWhatsapp(numero);
    const mensagemCodificada = encodeURIComponent(mensagem);
    const url = `https://wa.me/${numeroFormatado}?text=${mensagemCodificada}`;

    try {
        const suportado = await Linking.canOpenURL(url);
        if (!suportado) {
            Alert.alert(
                "WhatsApp não encontrado",
                "Não foi possível abrir o WhatsApp neste dispositivo."
            );
            return;
        }
        await Linking.openURL(url);
    } catch (error) {
        console.error("[whatsapp] Erro ao abrir WhatsApp:", error);
        Alert.alert("Erro", "Não foi possível abrir o WhatsApp. Tente novamente.");
    }
}