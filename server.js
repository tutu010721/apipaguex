// Ficheiro: server.js (VERSÃO COM DEBUG)

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

const corsOptions = {
    // Permite pedidos de qualquer origem. Para mais segurança, restrinja ao seu domínio.
    origin: '*' 
};
app.use(cors(corsOptions));

const PAGUEX_SECRET_KEY = process.env.PAGUEX_SECRET_KEY;

app.post('/criar-cobranca', async (req, res) => {
    console.log("-> Pedido recebido no backend para criar cobrança.");

    if (!PAGUEX_SECRET_KEY) {
        console.error("ERRO GRAVE: A chave da API PAGUEX_SECRET_KEY não foi configurada no Render.");
        return res.status(500).json({ message: "Erro de configuração do servidor." });
    }

    const frontendPayload = req.body;
    const paguexPayload = {
        amount: frontendPayload.amount,
        paymentMethod: "pix",
        customer: frontendPayload.customer,
        items: frontendPayload.items,
    };

    const headers = {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': 'Basic ' + Buffer.from(`${PAGUEX_SECRET_KEY}:x`).toString('base64')
    };

    try {
        console.log("-> Enviando dados para a API PagueX...");
        const response = await fetch('https://api.pague-x.com/v1/transactions', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(paguexPayload)
        });

        const data = await response.json();

        // LINHA DE DEBUG ADICIONADA AQUI!
        console.log('<- RESPOSTA COMPLETA DA PAGUEX:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error("-> Erro retornado pela PagueX:", data);
            return res.status(response.status).json(data);
        }

        console.log("-> Resposta da PagueX processada com sucesso.");
        res.status(200).json(data);

    } catch (error) {
        console.error("-> Erro interno ao tentar conectar com a PagueX:", error);
        res.status(500).json({ message: "Erro interno no servidor ao conectar com a API de pagamento." });
    }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Servidor backend a rodar na porta ${PORT}`);
});
