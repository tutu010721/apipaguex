// Ficheiro: server.js

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Certifique-se de que 'node-fetch' está no seu package.json

const app = express();
app.use(express.json()); // Middleware para interpretar o corpo das requisições como JSON

// Configuração do CORS para permitir pedidos apenas do seu domínio de frontend
const corsOptions = {
    origin: 'https://loja2pc.online' // Substitua se o domínio do Vercel for outro
};
app.use(cors(corsOptions));

// A SUA CHAVE SECRETA DA API PAGUEX
// IMPORTANTE: Mova isto para as Variáveis de Ambiente no Render!
const PAGUEX_SECRET_KEY = process.env.PAGUEX_SECRET_KEY || 'sk_live_v2wcnMTDb8qlnzOoOjKt7AR16cbYkTRZlnCLwYW6LZ';

// Rota que o seu frontend irá chamar
app.post('/criar-cobranca', async (req, res) => {
    console.log("Recebido pedido para criar cobrança:", req.body);

    // O frontend já envia os dados num formato muito bom.
    // A API PagueX espera 'customer' e 'items', que já recebemos.
    const frontendPayload = req.body;

    // Construímos o corpo da requisição para a PagueX
    const paguexPayload = {
        amount: frontendPayload.amount,
        paymentMethod: "pix", // Fixo como pix, conforme a necessidade do projeto
        customer: frontendPayload.customer,
        items: frontendPayload.items,
        // Adicione outros campos se necessário, como 'postbackUrl', 'pix', etc.
    };

    // Construção do Header de Autenticação, conforme a documentação
    const headers = {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': 'Basic ' + Buffer.from(`${PAGUEX_SECRET_KEY}:x`).toString('base64')
    };

    try {
        console.log("Enviando para a API PagueX...");
        const response = await fetch('https://api.pague-x.com/v1/transactions', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(paguexPayload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Erro da API PagueX:", data);
            // Retorna o erro da PagueX para o frontend
            return res.status(response.status).json(data);
        }

        console.log("Resposta da PagueX recebida com sucesso:", data);
        // Retorna a resposta de sucesso para o frontend
        res.status(200).json(data);

    } catch (error) {
        console.error("Erro interno ao chamar a PagueX:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
});

// Inicia o servidor na porta fornecida pelo Render
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Servidor backend a rodar na porta ${PORT}`);
});
