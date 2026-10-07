export type EnderecoPorCep = {
    rua: string;
    bairro: string;
    cidade: string;
    estado: string;
};

// Busca o endereço a partir de um CEP, usando a API pública ViaCEP.
// Retorna null se o CEP não for encontrado ou se der erro de rede —
// nesses casos, o profissional pode preencher o endereço manualmente.
export async function buscarEnderecoPorCep(cep: string): Promise<EnderecoPorCep | null> {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
        return null;
    }

    try {
        const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const dados = await resposta.json();

        if (dados.erro) {
            return null;
        }

        return {
            rua: dados.logradouro ?? "",
            bairro: dados.bairro ?? "",
            cidade: dados.localidade ?? "",
            estado: dados.uf ?? "",
        };
    } catch (error) {
        console.error("[cep] Erro ao buscar CEP:", error);
        return null;
    }
}