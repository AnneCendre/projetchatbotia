const cors = require('cors');
const express = require('express');
require('dotenv').config();
const axios = require('axios');
const app = express();
const { exec } = require('child_process');
app.use(express.json());
app.use(cors());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama3-70b-8192';

// Endpoint pour récupérer la documentation en ligne dynamiquement
app.get('/fetchDoc', (req, res) => {
    exec('node Tools/fetchDoc.js', { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
            res.status(500).send('Erreur lors de la récupération de la documentation');
            return;
        }
        res.send(stdout);
    })
});

// Endpoint pour servir les frais de livraison dynamiquement
app.get('/fetchDelivery', (req, res) => {
    exec('node Tools/fetchDeliveryPrices.js', { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
            res.status(500).send('Erreur lors de la récupération des frais de livraison');
            return;
        }
        res.send(stdout);
    });
});

// Route /chat pour générer les réponses du bot IA
app.post('/chat', async (req, res) => {
    const userMsg = req.body.message;
    const sessionId = req.body.sessionId || 'default'; // Identifiant de session
    
    if (!userMsg) return res.status(400).json({ error: 'Message manquant.' });
    
    try {
        let messages;
        
        if (req.body.documentation) {
            messages = [
                { role: 'system', content:
                    'Tu es un assistant utile pour un site e-commerce. Utilise la documentation fournie pour répondre précisément à la question de l\'utilisateur. Ne propose pas d\'utiliser un outil, réponds directement.'
                },
                { role: 'system', content: 'Documentation du site :\n' + req.body.documentation },
                { role: 'user', content: userMsg }
            ];
        } else if (req.body.delivery) {
            messages = [
                { role: 'system', content:
                    'Tu es un assistant utile pour un site e-commerce. Utilise les informations sur les frais de livraison fournies pour répondre précisément à la question de l\'utilisateur. Ne propose pas d\'utiliser un outil, réponds directement.'
                },
                { role: 'system', content: 'Frais de livraison :\n' + req.body.delivery },
                { role: 'user', content: userMsg }
            ];
        } else {
            messages = [
                {
                    role: 'system',
                    content:
                        'Tu es un assistant utile pour un site e-commerce qui s appelle ShopEx et qui vend des produits high tech.\n\n' +
                        '- Si l\'utilisateur pose une question relative à la navigation sur le site, la création ou gestion de compte, l\'achat, la commande, le paiement ou la livraison, tu dois répondre exactement : {"tool":"documentation"} et rien d\'autre.\n\n' +
                        '- Si la question concerne les frais de livraison, tu dois répondre exactement : {"tool":"delivery"} et rien d\'autre.\n\n' +
                        'Sinon, réponds normalement.'
                },
                { role: 'user', content: userMsg }
            ];
        }

        const response = await axios.post(GROQ_URL, {
            model: MODEL,
            messages
        }, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        let botMsg = response.data.choices[0].message.content;
        
        res.json({ reply: botMsg });

    } catch (err) {
        console.error('Erreur détaillée:', err.response?.data || err.message);
        res.status(500).json({ 
            error: 'Erreur serveur ou API.',
            details: err.response?.data?.error?.message || err.message
        });
    }
});

app.listen(3001, () => {
    console.log('Serveur chatbot démarré sur http://localhost:3001');
});