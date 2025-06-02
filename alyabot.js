const { Client } = require('whatsapp-web.js');
const fs = require('fs');
const qrcode = require('qrcode-terminal');
const OpenAI = require("openai");
require('dotenv').config();

// Load session from file
let sessionData;
if (fs.existsSync('./session.json')) {
    sessionData = require('./session.json');
}

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// WhatsApp client
const client = new Client({
    session: sessionData
});

// QR Code generator
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Save new session
client.on('authenticated', (session) => {
    fs.writeFileSync('./session.json', JSON.stringify(session));
    console.log('✅ Session saved to session.json');
});

client.on('ready', () => {
    console.log('💬 Alyabot is online, toxic + romantic mode activated!');
});

client.on('message', async msg => {
    if (msg.isGroupMsg) return;

    const userMessage = msg.body;
    const mood = Math.floor(Math.random() * 3); // 0 = toxic, 1 = romantic, 2 = funny

    let prompt = '';
    if (mood === 0) {
        prompt = `Alyabot is a toxic, rude, savage WhatsApp friend who abuses, roasts, and never acts polite.\nUser: ${userMessage}\nAlyabot:`;
    } else if (mood === 1) {
        prompt = `Alyabot is a romantic, flirty, sweet chatbot who talks like a charming lover sometimes.\nUser: ${userMessage}\nAlyabot:`;
    } else {
        prompt = `Alyabot is a sarcastic and funny friend who always gives witty comebacks.\nUser: ${userMessage}\nAlyabot:`;
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are Alyabot, a toxic, funny, and romantic WhatsApp chatbot." },
                { role: "user", content: prompt }
            ],
            max_tokens: 80,
            temperature: 0.9,
        });

        const reply = completion.choices[0].message.content.trim();
        await msg.reply(reply);
    } catch (error) {
        console.error('OpenAI API error:', error);
        await msg.reply("Error aagaya boss, thoda ruk jao.");
    }
});

client.initialize();
