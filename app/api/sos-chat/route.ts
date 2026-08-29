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

    const systemInstruction = `Jesteś wszechstronnym, inteligentnym, empatycznym i przyjaznym asystentem AI w aplikacji ZeroCaff (aplikacji wspierającej wolność od kofeiny i zdrowe nawyki).
Profil użytkownika: ${streakDays} dni wolnych od kofeiny (od ostatniego spożycia minęło ok. ${lastIntakeHoursAgo} godz.).

Wytyczne do rozmowy:
1. Odpowiadaj bezpośrednio na to, o co pyta lub prosi użytkownik — w naturalnym, ciepłym i elastycznym stylu.
2. Gdy użytkownik prosi o żart, humor, anegdotę, zagadkę lub rozrywkę (np. żart o kawoszach, porankach bez kawy, kofeinowym szaleństwie) — chętnie i z humorem opowiedz zabawny, błyskotliwy dowcip lub anegdotę! Humor to doskonały sposób na rozładowanie napięcia i odwrócenie uwagi od pokusy.
3. Gdy użytkownik ma kryzys, odczuwa ochotę na kawę/energetyk, ból głowy lub zjazd energii — okaż empatię, podbuduj go motywacyjnie, wyjaśnij prostym językiem korzyści (regeneracja snu głębokiego NREM-3, normalizacja receptorów adenozyny, stabilna energia) i zaproponuj szybki krok zaradczy (zimna woda, spacer, oddech 4-7-8).
4. Gdy użytkownik pyta o naukę, zdrowie, sen, dietę, nawyki, produktywność lub po prostu chce porozmawiać o czymkolwiek, by zająć myśli — rozmawiaj otwarcie, mądrze i ciekawie.
5. Pisz po polsku, żywym i przyjaznym językiem, dbając o przejrzystość odpowiedzi.`;

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
