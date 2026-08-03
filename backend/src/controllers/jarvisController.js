const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const { maskPII, logPrivacySummary } = require('../utils/privacyShield');

// Placeholder for ElevenLabs Voice ID (Paul Bettany / JARVIS style community voice)
const JARVIS_VOICE_ID = 'pNInz6obbfIdG21sKq53'; // Example ID, might need to be changed based on the user's ElevenLabs account

const jarvisChat = async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "Message is required." });
        }

        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
        }

        // ── 1. Privacy Shield: mask all PII before touching any external API ──
        const privacy = maskPII(message);
        const maskedPrompt = privacy.masked;

        // Log PII types detected (values are NEVER logged).
        logPrivacySummary(privacy.detected);

        // Build the privacy metadata object for the response.
        const privacyMeta = {
            enabled: true,
            masked: privacy.detected.length > 0,
            detectedCount: privacy.detected.length,
            detected: [...new Set(privacy.detected.map(d => d.type))], // unique types only
        };

        // ── 2. Get Response from Gemini (using ONLY the masked prompt) ─────────
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
        
        const systemPrompt = "You are J.A.R.V.I.S., the highly advanced AI assistant originally created by Tony Stark. You are currently assisting the system administrator. You are highly intelligent, polite, sophisticated, and slightly witty with a British demeanor. Respond to the user's prompt concisely as if speaking to them verbally. Keep your answers brief and straight to the point unless asked for details.";
        
        // IMPORTANT: maskedPrompt is used here — original message never sent to Gemini.
        const prompt = `${systemPrompt}\n\nUser: ${maskedPrompt}\nJARVIS:`;
        
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // 2. Try ElevenLabs for Text-to-Speech (Paul Bettany)
        const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
        
        if (elevenLabsKey) {
            try {
                const ttsResponse = await axios.post(
                    `https://api.elevenlabs.io/v1/text-to-speech/${JARVIS_VOICE_ID}`,
                    {
                        text: responseText,
                        model_id: "eleven_monolingual_v1",
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.5
                        }
                    },
                    {
                        headers: {
                            'Accept': 'audio/mpeg',
                            'xi-api-key': elevenLabsKey,
                            'Content-Type': 'application/json'
                        },
                        responseType: 'arraybuffer' // We want the binary audio data
                    }
                );

                // Convert audio buffer to base64 to send in JSON (or stream directly)
                const audioBase64 = Buffer.from(ttsResponse.data, 'binary').toString('base64');
                
                return res.json({
                    text: responseText,
                    audio: audioBase64,
                    format: 'mp3',
                    source: 'elevenlabs',
                    privacy: privacyMeta,
                });

            } catch (ttsError) {
                console.error("ElevenLabs TTS Error:", ttsError.message);
                // Fallback to text only if TTS fails
            }
        }

        // Fallback: If no ElevenLabs key or it failed, return just text for the frontend to speak.
        return res.json({
            text: responseText,
            source: 'text-only',
            privacy: privacyMeta,
        });

    } catch (error) {
        // Use console.error here as logger may not be available in all error paths.
        console.error('JARVIS Chat Error:', error.message || error);
        res.status(500).json({ error: 'Failed to process JARVIS request.' });
    }
};

module.exports = {
    jarvisChat
};
