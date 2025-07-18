// Ficheiro: server.js (VERSÃO FINAL COM VERIFICAÇÃO)

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); // Permite pedidos do seu site

const PAGUEX_SECRET_KEY = process.env.PAGUEX_SECRET_KEY;

// Rota para criar a cobrança (já existente)
app.post('/criar-cobranca', async (req, res) => {
    if (!PAGUEX_SECRET_KEY) {
        return res.status(500).json({ message: "Erro de configuração do servidor." });
    }
    const paguexPayload = req.body;
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
        if (!response.ok) return res.status(response.status).json(data);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Erro interno no servidor." });
    }
});

// *** NOVA ROTA PARA VERIFICAR O STATUS DA TRANSAÇÃO ***
app.get('/verificar-transacao/:transactionId', async (req, res) => {
    const { transactionId } = req.params;
    console.log(`-> Verificando status da transação ID: ${transactionId}`);

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
            console.error("<- Erro da PagueX ao verificar status:", data);
            return res.status(response.status).json(data);
        }
        
        // Retorna apenas os dados essenciais para o frontend
        res.status(200).json({ status: data.status });

    } catch (error) {
        console.error("<- Erro interno ao verificar status:", error);
        res.status(500).json({ message: "Erro interno no servidor." });
    }
});


const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Servidor backend a rodar na porta ${PORT}`);
});
