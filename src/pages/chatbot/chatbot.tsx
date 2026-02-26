import { useState } from "react";
import NavBar from "../../shared/components/navbar";
import Footer from "../../shared/components/footer";
import { GoogleGenAI } from "@google/genai";
import nubesArriba from "./assets/nubes-arriba.png";
import nubesAbajo from "./assets/nubes-abajo.png";
import "./chatbot.css";

interface Message {
  role: "user" | "model";
  content: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content:
        "Hola Soy NUBI, tu robot amigo con inteligencia artificial. ¿En qué puedo ayudarte hoy?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  // Función que devuelve una promesa con las voces cuando estén listas
  const waitForVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        // Si aún no hay voces, esperamos el evento 'voiceschanged'
        window.speechSynthesis.onvoiceschanged = () => {
          resolve(window.speechSynthesis.getVoices());
          window.speechSynthesis.onvoiceschanged = null; // Limpiamos el evento
        };
      }
    });
  };

  // Función speak actualizada (ahora asíncrona)
  const speak = async (text: string) => {
    // Cancelar cualquier audio anterior
    window.speechSynthesis.cancel();

    // Esperar a que las voces estén cargadas
    const voices = await waitForVoices();

    // Buscar la voz de Marcelo (ajusta el nombre si es necesario)
    const marceloVoice = voices.find((v) =>
      v.name.toLowerCase().includes("marcelo")
    );

    const utterance = new SpeechSynthesisUtterance(text);
    if (marceloVoice) {
      utterance.voice = marceloVoice;
    }
    utterance.lang = "es-ES";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  };

  // 🛑 filtro infantil
  const isSafeForKids = (text: string) => {
    const forbiddenWords = [
      "sexo",
      "sexual",
      "violencia",
      "matar",
      "arma",
      "sangre",
      "droga",
      "porn",
      "muerte",
      "suicidio",
      "pelea",
      "gore",
      "violar",
    ];

    return !forbiddenWords.some((word) =>
      text.toLowerCase().includes(word)
    );
  };

  const handleSend = async (voiceText?: string) => {
    const textToSend = voiceText ?? input;

    if (!textToSend.trim()) return;

    if (!isSafeForKids(textToSend)) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            "Lo siento, de eso no puedo hablar. ¿Quieres que hablemos de animales, colores o juegos?",
        },
      ]);
      setInput("");
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const systemInstruction = {
        role: "model",
        parts: [
          {
            text: `Eres Nubi, un robot amigable para niños de 3 a 5 años.
            Usa lenguaje simple, frases cortas y no uses emojis.
            Nunca hables de temas peligrosos o inapropiados.`,
          },
        ],
      };

      const history = [
        systemInstruction,
        ...messages.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
        { role: "user", parts: [{ text: textToSend }] },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: history,
      });

      const assistantText = response.text || "";

      if (assistantText) {
        const assistantMessage: Message = {
          role: "model",
          content: assistantText,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error(err);
      setError("Ups, algo salió mal con Nubi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat">
      <NavBar />

      <img src={nubesArriba} alt="Nubes arriba" draggable={false} />

      <div className="chat-container marco">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="bubble">
                {msg.content}
                <button
                  className="speak-btn"
                  onClick={() => speak(msg.content)}
                >
                  🔊
                </button>
              </div>
            </div>
          ))}

          {loading && (
            <div className="message model">
              <div className="bubble typing">
                Nubi está pensando... 🤖💭
              </div>
            </div>
          )}

          {error && <div className="error">{error}</div>}
        </div>

        <div className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleSend()
            }
            placeholder="Escribe tu pregunta..."
            disabled={loading}
          />

          <button onClick={() => handleSend()} disabled={loading}>
            Enviar
          </button>
        </div>
      </div>

      <img src={nubesAbajo} alt="Nubes abajo" draggable={false} />

      <Footer />
    </div>
  );
}