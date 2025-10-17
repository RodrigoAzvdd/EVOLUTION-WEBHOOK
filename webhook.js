const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const API_URL = 'http://localhost:3005';
const API_KEY = '429683C4C977415CAAFCCE10F7D57E11'; // Confirme se é o seu API key correto
const INSTANCE_NAME = 'RODRIGO';
const TARGET_NUMBER = '558594350030@s.whatsapp.net'; // Número específico para envio

// Armazena o histórico de conversas (limpeza após 10 minutos)
const conversationHistory = new Map();
const HISTORY_TIMEOUT = 10 * 60 * 1000; // 10 minutos em milissegundos

// Função para limpar histórico antigo
function cleanupHistory() {
    const now = Date.now();
    for (const [key, value] of conversationHistory) {
        if (now - value.timestamp > HISTORY_TIMEOUT) {
            conversationHistory.delete(key);
        }
    }
}
setInterval(cleanupHistory, 5 * 60 * 1000); // Limpa a cada 5 minutos

// Endpoint genérico para todos os eventos
app.post('/webhook', (req, res) => {
    console.log('Webhook recebido (genérico):', JSON.stringify(req.body, null, 2));

    const mensagem = req.body.data || req.body;
    if (mensagem && mensagem.key && !mensagem.key.fromMe && mensagem.message) {
        const numero = mensagem.key.remoteJid;
        const textoRecebido = mensagem.message?.conversation || mensagem.message?.extendedTextMessage?.text || '';
        const nome = mensagem.pushName || 'amigo';

        console.log(`Mensagem de ${numero}: ${textoRecebido}`);
        const userHistory = conversationHistory.get(numero) || { initialGreetingSent: false, timestamp: Date.now() };
        let updatedHistory = { ...userHistory, timestamp: Date.now() };

        if (numero === TARGET_NUMBER) {
            if (textoRecebido === '4') {
                conversationHistory.delete(numero);
                enviarMensagem(numero, `Tchau, ${nome}! Foi um prazer ajudar. Quando quiser, é só voltar! 👋`); 
            } else if (!userHistory.initialGreetingSent) {
                enviarMensagem(numero, `Olá, ${nome}! Como posso ajudar você hoje? 😊`);
                enviarMensagem(numero, `Descubra mais sobre mim:\n1️⃣ Digite 1 para saber o que eu faço\n2️⃣ Digite 2 para explorar serviços\n3️⃣ Digite 3 para entrar em contato\n4️⃣ Digite 4 para sair`);
                updatedHistory.initialGreetingSent = true;
                conversationHistory.set(numero, updatedHistory);
            } else {
                if (textoRecebido === '1') {
                    enviarMensagem(numero, `Oi, ${nome}! Eu sou um assistente criado com a Evolution API, usando um webhook poderoso para responder mensagens automaticamente. Transformo interações em algo dinâmico e personalizado, tudo direto do WhatsApp! 🚀`);
                } else if (textoRecebido === '2') {
                    enviarMensagem(numero, `Ótima escolha, ${nome}! Estou explorando serviços incríveis – em breve, trarei opções como automações e suporte personalizado. Fique ligado! ✨`);
                } else if (textoRecebido === '3') {
                    enviarMensagem(numero, `Que tal conversarmos, ${nome}? Envie sua dúvida ou ideia, e te ajudarei com um toque especial de inovação! 📩`);
                } else {
                    enviarMensagem(numero, `Olá, ${nome}! Não reconheci seu comando. Tente:\n1️⃣ O que eu faço\n2️⃣ Serviços\n3️⃣ Contato\n4️⃣ Sair`);
                }
            }
        }
    }

    res.sendStatus(200);
});

// Endpoint específico para messages.upsert
app.post('/webhook/messages-upsert', (req, res) => {
    console.log('Webhook recebido (messages.upsert):', JSON.stringify(req.body, null, 2));

    const mensagem = req.body.data;
    if (mensagem && mensagem.key && !mensagem.key.fromMe) {
        const numero = mensagem.key.remoteJid;
        const textoRecebido = mensagem.message?.conversation || mensagem.message?.extendedTextMessage?.text || '';
        const nome = mensagem.pushName || 'amigo';

        console.log(`Mensagem de ${numero}: ${textoRecebido}`);
        const userHistory = conversationHistory.get(numero) || { initialGreetingSent: false, timestamp: Date.now() };
        let updatedHistory = { ...userHistory, timestamp: Date.now() };

        if (numero === TARGET_NUMBER) {
            if (textoRecebido === '4') {
                conversationHistory.delete(numero);
                enviarMensagem(numero, `Tchau, ${nome}! Foi um prazer ajudar. Quando quiser, é só voltar! 👋`);
            } else if (!userHistory.initialGreetingSent) {
                enviarMensagem(numero, `Olá, ${nome}! Como posso ajudar você hoje? 😊`);
                enviarMensagem(numero, `Descubra mais sobre mim:\n1️⃣ Digite 1 para saber o que eu faço\n2️⃣ Digite 2 para explorar serviços\n3️⃣ Digite 3 para entrar em contato\n4️⃣ Digite 4 para sair`);
                updatedHistory.initialGreetingSent = true;
                conversationHistory.set(numero, updatedHistory);
            } else {
                if (textoRecebido === '1') {
                    enviarMensagem(numero, `Oi, ${nome}! Eu sou um assistente criado com a Evolution API, usando um webhook poderoso para responder mensagens automaticamente. Transformo interações em algo dinâmico e personalizado, tudo direto do WhatsApp! 🚀`);
                } else if (textoRecebido === '2') {
                    enviarMensagem(numero, `Ótima escolha, ${nome}! Estou explorando serviços incríveis – em breve, trarei opções como automações e suporte personalizado. Fique ligado! ✨`);
                } else if (textoRecebido === '3') {
                    enviarMensagem(numero, `Que tal conversarmos, ${nome}? Envie sua dúvida ou ideia, e te ajudarei com um toque especial de inovação! 📩`);
                } else {
                    enviarMensagem(numero, `Olá, ${nome}! Não reconheci seu comando. Tente:\n1️⃣ O que eu faço\n2️⃣ Serviços\n3️⃣ Contato\n4️⃣ Sair`);
                }
            }
        }
    }

    res.sendStatus(200);
});

// Endpoints para outros eventos (apenas log)
app.post('/webhook/chats-update', (req, res) => {
    console.log('Webhook recebido (chats.update):', JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
});

app.get('/health', (req, res) => res.sendStatus(200));

app.post('/webhook/contacts-update', (req, res) => {
    console.log('Webhook recebido (contacts.update):', JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
});

// Função para enviar mensagem
function enviarMensagem(numero, texto) {
    axios.post(`${API_URL}/message/sendText/${INSTANCE_NAME}`, {
        number: numero,
        text: texto
    }, {
        headers: { 'apikey': API_KEY }
    }).then(response => {
        console.log('Mensagem enviada:', response.data);
    }).catch(error => {
        console.error('Erro no envio:', error.response?.data || error.message);
    });
}

// Inicia o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Escutador rodando em http://localhost:${PORT}`);
});
