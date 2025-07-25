// Ficheiro: server.js (VERSÃO FINAL COM DADOS COMPLETOS)

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

const PAGUEX_SECRET_KEY = process.env.PAGUEX_SECRET_KEY;

// Rota para CRIAR a cobrança
app.post('/criar-cobranca', async (req, res) => {
    if (!PAGUEX_SECRET_KEY) {
        return res.status(500).json({ message: "Erro de configuração do servidor." });
    }
    const frontendPayload = req.body;
    const paguexPayload = { ...frontendPayload, paymentMethod: "pix" };
    const headers = {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': 'Basic ' + Buffer.from(`${PAGUEX_SECRET_KEY}:x`).toString('base64')
    };
    try {
        const response = await fetch('https://api.pague-x.com/v1/transactions', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(paguexPayload)
        });
        const data = await response.json();
        if (!response.ok) {
            console.error("Erro da API PagueX ao criar:", data);
            return res.status(response.status).json(data);
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Erro interno no servidor." });
    }
});

// Rota para VERIFICAR a transação (AGORA ENVIA OS DADOS COMPLETOS)
app.get('/verificar-transacao/:transactionId', async (req, res) => {
    const { transactionId } = req.params;
    if (!PAGUEX_SECRET_KEY) {
        return res.status(500).json({ message: "Erro de configuração do servidor." });
    }
    const headers = {
        'accept': 'application/json',
        'authorization': 'Basic ' + Buffer.from(`${PAGUEX_SECRET_KEY}:x`).toString('base64')
    };
    try {
        const response = await fetch(`https://api.pague-x.com/v1/transactions/${transactionId}`, {
            method: 'GET',
            headers: headers
        });
        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        // **** ALTERAÇÃO AQUI: Enviando todos os dados da transação para o frontend ****
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Erro interno no servidor." });
    }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Servidor backend a rodar na porta ${PORT}`);
});
