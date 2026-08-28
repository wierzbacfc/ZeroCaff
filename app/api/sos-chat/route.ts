import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, streakDays = 0, lastIntakeHoursAgo = 0 } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        text: "Pamiętaj, że ochota na kofeinę to tylko fala biochemiczna trwająca około 10-15 minut. Jeśli teraz odpuścisz, zyskasz dziś nawet +40 minut głębokiego snu fazy delta i obudzisz się wypoczęty, bez porannej mgły mózgowej. Wypij teraz dużą szklankę zimnej wody!",
        fallback: true
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `Jesteś empatycznym, naukowo uzasadnionym i motywującym asystentem kryzysowym w aplikacji ZeroCaff do rzucania kofeiny.
Użytkownik odczuwa nagłą, silną chęć na wypicie kawy lub napoju energetycznego i szuka wsparcia.
Profil użytkownika: ${streakDays} dni wolnych od kofeiny (od ostatniego spożycia minęło ok. ${lastIntakeHoursAgo} godz.).

Twoje zadanie:
1. Natychmiast odciągnąć użytkownika od sięgnięcia po kofeinę z empatią i spokojem.
2. Wytłumaczyć prostym, plastycznym językiem co DOKŁADNIE osiągnie i zyska, jeśli się teraz NIE napije (np. regeneracja fazy snu głębokiego NREM-3/4 o 30-35%, normalizacja receptorów adenozynowych, brak nagłego wyrzutu kortyzolu i kołatania serca, brak zjazdu energetycznego za 2 godziny).
3. Podsunąć 1 natychmiastowy krok zastępczy (np. duża szklanka lodowatej wody, 60-sekundowy oddech 4-7-8, rozciąganie, herbata miętowa/rooibos).
4. Utrzymuj odpowiedzi zwięzłe (maksymalnie 3-4 zdania lub 2-3 zwięzłe punkty), bez zbędnego lania wody, w języku polskim.`;

    // Format chat history for Gemini API
    const contents = Array.isArray(messages) && messages.length > 0 
      ? messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }))
      : [{ role: 'user', parts: [{ text: 'Mam teraz ogromną chęć na kawę / kofeinę. Proszę, pomóż mi wytrwać i powiedz co zyskam, jeśli się nie napiję.' }] }];

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const text = response.text || "Każda pokonana chęć to kolejny krok do trwałej wolności od zmęczenia. Daj sobie 10 minut i napij się zimnej wody!";

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error in SOS chat handler:", error);
    return NextResponse.json({
      text: "Fala ochoty na kofeinę osiąga szczyt po ok. 5 minutach, a po 15 min zanika. Jeśli teraz wytrwasz, Twój mózg dziś w nocy odbuduje kluczową fazę snu głębokiego (NREM-3), dając Ci prawdziwą, naturalną energię na jutro!",
      fallback: true
    });
  }
}
