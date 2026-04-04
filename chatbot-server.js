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
const MODEL = process.env.GRPQ_MODEL;

// Route /chat pour générer les réponses du bot IA
app.post('/chat', async (req, res) => {
    const userMsg = req.body.message;
    const sessionId = req.body.sessionId || 'default'; // Identifiant de session
    
    if (!userMsg) return res.status(400).json({ error: 'Message manquant.' });
    
    try {
        let messages;
        {
            messages = [
                {
                    role: 'system',
                    content:
                        'Tu es un assistant personel'
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