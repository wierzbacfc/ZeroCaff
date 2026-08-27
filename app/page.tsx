"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Coffee, Zap, Leaf, GlassWater, Trophy, Activity,
  Plus, X, TrendingUp, TrendingDown, RotateCcw, Home, BarChart2,
  Calendar, Flame, Sparkles, CheckCircle2, Lock,
  Clock, Award, ShieldCheck, ChevronRight, Info,
  Settings, Palette, Sun, Moon, SunMedium, Sunset,
  Monitor, Trash2, Check, AlertTriangle, Brain,
  Heart, Compass, ArrowRight, BatteryCharging,
  Bell, BellOff, BellRing, Target, AlertCircle,
  Download, RefreshCw, Smartphone, CheckCircle, Wifi, ArrowUpCircle
} from 'lucide-react';
import { format, subDays, isSameDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// --- Types ---
type ThemeMode = 'dark' | 'gray' | 'light';
type AccentColorKey = 'orange' | 'emerald' | 'amber' | 'cyan' | 'violet' | 'rose' | 'blue';

type AccentPalette = {
  key: AccentColorKey;
  name: string;
  primary: string;       // hex for SVG and Charts
  primaryHover: string;
  glow: string;
  ring: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  btnGradient: string;
};

type Drink = {
  id: string;
  name: string;
  mg: number;
  icon: React.ElementType;
  color: string;
  accentColor: string;
};

type DrinkLog = {
  id: string;
  timestamp: number;
  drinkId: string;
  mg: number;
  customName?: string;
};

type Milestone = {
  id: string;
  code: string;
  name: string;
  seconds: number;
  phase: string;
  benefit: string;
  description: string;
  symptoms: string;
  tips: string;
  mentalBoost: string;
};

// --- Application Constants ---
const APP_VERSION = '1.2.0';

const getAssetUrl = (path: string) => {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

// --- Color Palettes ---
const ACCENT_PALETTES: Record<AccentColorKey, AccentPalette> = {
  orange: {
    key: 'orange',
    name: 'Pomarańczowy',
    primary: '#f97316',
    primaryHover: '#ea580c',
    glow: 'rgba(249, 115, 22, 0.35)',
    ring: '#f97316',
    badgeBg: 'rgba(249, 115, 22, 0.12)',
    badgeText: '#fb923c',
    badgeBorder: 'rgba(249, 115, 22, 0.3)',
    btnGradient: 'from-orange-500 to-amber-500',
  },
  emerald: {
    key: 'emerald',
    name: 'Szmaragdowy',
    primary: '#10b981',
    primaryHover: '#059669',
    glow: 'rgba(16, 185, 129, 0.35)',
    ring: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    badgeText: '#34d399',
    badgeBorder: 'rgba(16, 185, 129, 0.3)',
    btnGradient: 'from-emerald-500 to-teal-500',
  },
  amber: {
    key: 'amber',
    name: 'Bursztynowy',
    primary: '#f59e0b',
    primaryHover: '#d97706',
    glow: 'rgba(245, 158, 11, 0.35)',
    ring: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.12)',
    badgeText: '#fbbf24',
    badgeBorder: 'rgba(245, 158, 11, 0.3)',
    btnGradient: 'from-amber-500 to-yellow-500',
  },
  cyan: {
    key: 'cyan',
    name: 'Cyjanowy',
    primary: '#06b6d4',
    primaryHover: '#0891b2',
    glow: 'rgba(6, 182, 212, 0.35)',
    ring: '#06b6d4',
    badgeBg: 'rgba(6, 182, 212, 0.12)',
    badgeText: '#22d3ee',
    badgeBorder: 'rgba(6, 182, 212, 0.3)',
    btnGradient: 'from-cyan-500 to-blue-500',
  },
  violet: {
    key: 'violet',
    name: 'Fioletowy',
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
    glow: 'rgba(139, 92, 246, 0.35)',
    ring: '#8b5cf6',
    badgeBg: 'rgba(139, 92, 246, 0.12)',
    badgeText: '#a78bfa',
    badgeBorder: 'rgba(139, 92, 246, 0.3)',
    btnGradient: 'from-violet-500 to-purple-500',
  },
  rose: {
    key: 'rose',
    name: 'Różany',
    primary: '#f43f5e',
    primaryHover: '#e11d48',
    glow: 'rgba(244, 63, 94, 0.35)',
    ring: '#f43f5e',
    badgeBg: 'rgba(244, 63, 94, 0.12)',
    badgeText: '#fb7185',
    badgeBorder: 'rgba(244, 63, 94, 0.3)',
    btnGradient: 'from-rose-500 to-pink-500',
  },
  blue: {
    key: 'blue',
    name: 'Błękitny',
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    glow: 'rgba(59, 130, 246, 0.35)',
    ring: '#3b82f6',
    badgeBg: 'rgba(59, 130, 246, 0.12)',
    badgeText: '#60a5fa',
    badgeBorder: 'rgba(59, 130, 246, 0.3)',
    btnGradient: 'from-blue-500 to-indigo-500',
  },
};

// --- Constant Drinks ---
const DRINKS: Drink[] = [
  { id: 'coffee', name: 'Kawa (Kubek)', mg: 95, icon: Coffee, color: 'bg-amber-500/15 text-amber-500 border-amber-500/30', accentColor: '#f59e0b' },
  { id: 'espresso', name: 'Espresso', mg: 63, icon: Coffee, color: 'bg-stone-500/15 text-stone-400 border-stone-500/30', accentColor: '#a8a29e' },
  { id: 'energy', name: 'Napój Energetyczny', mg: 150, icon: Zap, color: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30', accentColor: '#eab308' },
  { id: 'cola', name: 'Coca-Cola / Pepsi', mg: 34, icon: GlassWater, color: 'bg-red-500/15 text-red-500 border-red-500/30', accentColor: '#ef4444' },
  { id: 'tea', name: 'Herbata Czarna/Zielona', mg: 30, icon: Leaf, color: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30', accentColor: '#10b981' },
];

// --- Comprehensive Milestones (Rich Early Stages + Long Term) ---
const MILESTONES: Milestone[] = [
  {
    id: 'm-2h',
    code: '2H',
    name: '2 Godziny',
    seconds: 2 * 3600,
    phase: 'Faza 1: Początek Eliminacji',
    benefit: 'Spadek szczytowego stężenia',
    description: 'Kofeina osiągnęła swój maksymalny poziom we krwi i wątrobowe enzymy (cytochrom P450 1A2) rozpoczęły intensywny proces jej rozkładu na paraksantynę, teobrominę i teofilinę.',
    symptoms: 'Możesz odczuwać pierwsze subtelne uspokojenie pulsu oraz spadek sztucznego pobudzenia.',
    tips: 'Wypij dużą szklankę wody mineralnej z odrobiną cytryny, aby wesprzeć filtrację nerkową.',
    mentalBoost: 'Pierwszy krok został postawiony. Twoje ciało zaczyna pracować na własnych obrotach.'
  },
  {
    id: 'm-4h',
    code: '4H',
    name: '4 Godziny',
    seconds: 4 * 3600,
    phase: 'Faza 1: Uwalnianie Receptorów',
    benefit: 'Uwalnianie receptorów A1 i A2A',
    description: 'Cząsteczki kofeiny powoli odczepiają się od receptorów adenozynowych w korze mózgowej. Zablokowana dotąd adenozyna – naturalny wskaźnik zmęczenia – zaczyna docierać do neuronów.',
    symptoms: 'Może pojawić się lekka senność lub chęć sięgnięcia po kolejną kawę z przyzwyczajenia.',
    tips: 'Zrób 5 głębokich wdechów lub krótki 2-minutowy spacer po pokoju zamiast iść do kuchni.',
    mentalBoost: 'To tylko chwilowy impuls nawykowy – Twoja wola jest silniejsza niż nawyk ręki.'
  },
  {
    id: 'm-6h',
    code: '6H',
    name: '6 Godzin',
    seconds: 6 * 3600,
    phase: 'Faza 1: Okres Półtrwania (T½)',
    benefit: '50% kofeiny zmetabolizowane',
    description: 'Osiągasz biologiczny okres półtrwania kofeiny. Połowa przyjętej dawki została zneutralizowana. Twoje naczynia krwionośne delikatnie się rozszerzają, ułatwiając swobodny przepływ krwi.',
    symptoms: 'Uczucie zjazdu energetycznego u osób nawykowo pijących kawę po południu.',
    tips: 'Zjedz przekąskę bogatą w magnez (orzechy, migdały, banan) lub wypij napar z mięty.',
    mentalBoost: 'Połowa trucizny stymulacyjnej zniknęła z Twojego krwioobiegu!'
  },
  {
    id: 'm-8h',
    code: '8H',
    name: '8 Godzin',
    seconds: 8 * 3600,
    phase: 'Faza 1: Równowaga Krążenia',
    benefit: 'Normalizacja ciśnienia i pulsu',
    description: 'Układ współczulny (odpowiedzialny za reakcję stresową "walcz lub uciekaj") przechodzi w stan spoczynku. Ciśnienie tętnicze i tętno spoczynkowe obniżają się do naturalnego poziomu.',
    symptoms: 'Poczucie fizycznego odprężenia mięśni karku i barków.',
    tips: 'Zwróć uwagę na głębokość oddechu – staje się on pełniejszy i spokojniejszy.',
    mentalBoost: 'Twoje serce bije teraz bez sztucznego poganiania.'
  },
  {
    id: 'm-12h',
    code: '12H',
    name: '12 Godzin',
    seconds: 12 * 3600,
    phase: 'Faza 2: Głębokie Oczyszczanie',
    benefit: 'Prawie 75% kofeiny usunięte',
    description: 'Poziom kofeiny w osoczu spadł do minimalnych wartości. Szyszynka może bez przeszkód wydzielać melatoninę, niezbędną do inicjacji naturalnego rytmu dobowego.',
    symptoms: 'Naturalna, zdrowa senność wieczorna bez niepokoju i gonitwy myśli.',
    tips: 'Wywietrz sypialnię i odłóż ekran telefonu na 45 minut przed snem.',
    mentalBoost: 'Dziś w nocy Twój mózg doświadczy pierwszego od dawna nieskażonego snu.'
  },
  {
    id: 'm-16h',
    code: '16H',
    name: '16 Godzin',
    seconds: 16 * 3600,
    phase: 'Faza 2: Regeneracja Nocna',
    benefit: 'Głęboka faza SWS & REM',
    description: 'Brak kofeiny umożliwia pełne przejście w fazę snu wolnofalowego (NREM faza 3/4). W tym czasie mózg uruchamia układ glimfatyczny, oczyszczający tkankę mózgową z toksycznych metabolitów.',
    symptoms: 'Możliwe żywsze, bardziej wyraziste sny oraz dłuższe okresy nieprzerwanego snu.',
    tips: 'Po przebudzeniu wypij szklankę letniej wody, aby nawodnić komórki.',
    mentalBoost: 'Poranek bez chemicznego zapłonu to początek prawdziwej niezależności.'
  },
  {
    id: 'm-1d',
    code: '1D',
    name: '24 Godziny (1 Dzień)',
    seconds: 24 * 3600,
    phase: 'Faza 2: Pierwsza Doba Wolności',
    benefit: 'Całkowita eliminacja z krwioobiegu',
    description: 'We krwi nie ma już aktywnej kofeiny. Receptory adenozynowe są w pełni odsłonięte. Organizm rozpoczyna proces dostrajania gęstości receptorów do naturalnych warunków.',
    symptoms: 'Może pojawić się lekki tępy ból głowy (efekt rozszerzenia naczyń mózgowych) lub znużenie.',
    tips: 'Zadbaj o elektrolity, zjedz ciepły posiłek i nie forsuj się intensywnym treningiem.',
    mentalBoost: 'Przetrwałeś całą dobę! To psychologiczny kamień milowy najwyższej wagi.'
  },
  {
    id: 'm-36h',
    code: '36H',
    name: '36 Godzin',
    seconds: 36 * 3600,
    phase: 'Faza 3: Szczyt Odstawienny',
    benefit: 'Dylatacja naczyń mózgowych',
    description: 'Kofeina zwęża naczynia mózgowe nawet o 25-30%. Po 36h przepływ krwi w naczyniach mózgu gwałtownie rośnie, co powoduje intensywne dotlenienie tkanek.',
    symptoms: 'Szczyt objawów odstawiennych: ból głowy, spadek motywacji, wrażliwość na światło.',
    tips: 'Zimny kompres na czoło, drzemka 20 minut, suplementacja magnezu i witamin z grupy B.',
    mentalBoost: 'Ból głowy to fizyczny dowód na to, że naczynia krwionośne wracają do zdrowia!'
  },
  {
    id: 'm-2d',
    code: '2D',
    name: '48 Godzin (2 Dni)',
    seconds: 2 * 24 * 3600,
    phase: 'Faza 3: Przebudowa Receptorów',
    benefit: 'Rozpoczęcie redukcji receptorów',
    description: 'Mózg zauważa brak stałej blokady i zaczyna zmniejszać nadmiarową liczbę receptorów adenozyny, którą wytworzył w odpowiedzi na chroniczne picie kofeiny.',
    symptoms: 'Mniejsza intensywność bólu głowy, fale ciepła, powolny powrót apetytu.',
    tips: 'Pij herbatki ziołowe (rumianek, melisa, rooibos) – dają rytuał ciepłego kubka bez kofeiny.',
    mentalBoost: 'Najgorszy fizjologiczny sztorm masz już za sobą.'
  },
  {
    id: 'm-3d',
    code: '3D',
    name: '72 Godziny (3 Dni)',
    seconds: 3 * 24 * 3600,
    phase: 'Faza 3: Przełom Kryzysu',
    benefit: 'Koniec ostrej fazy odstawienia',
    description: 'Szczyt objawów fizycznych mija bezpowrotnie. Układ pokarmowy uspokaja się, błona śluzowa żołądka nie jest drażniona kwasami i związkami drażniącymi.',
    symptoms: 'Wyraźny przypływ świeżości umysłowej, zniknięcie napięcia w skroniach.',
    tips: 'Wybierz się na 30-minutowy spacer w słońcu, aby stymulować naturalną produkcję serotoniny.',
    mentalBoost: 'Przełamałeś barierę 72 godzin! Statystycznie większość osób po tym etapie nie wraca.'
  },
  {
    id: 'm-4d',
    code: '4D',
    name: '4 Dni',
    seconds: 4 * 24 * 3600,
    phase: 'Faza 4: Stabilizacja Dopaminy',
    benefit: 'Równowaga szlaków nagrody',
    description: 'Układ dopaminergiczny przestaje oczekiwać nagłych sztucznych wyrzutów dopaminy. Codzienne proste czynności zaczynają przynosić naturalną satysfakcję.',
    symptoms: 'Mniejsza drażliwość, spokojniejsza reakcja na codzienne stresy.',
    tips: 'Zapisz 3 rzeczy, za które jesteś dziś wdzięczny – naturalny booster dopaminowy.',
    mentalBoost: 'Odzyskujesz kontrolę nad własnym nastrojem bez potrzeby zewnętrznych stymulantów.'
  },
  {
    id: 'm-5d',
    code: '5D',
    name: '5 Dni',
    seconds: 5 * 24 * 3600,
    phase: 'Faza 4: Nawodnienie Tkanek',
    benefit: 'Optymalna retencja wody i elektrolitów',
    description: 'Brak diuretycznego działania kofeiny pozwala komórkom na pełne nawodnienie. Zwiększa się elastyczność skóry, a mięśnie są lepiej odżywione glikogenem.',
    symptoms: 'Świeższy wygląd twarzy, mniejsze cienie pod oczami, brak suchości w ustach.',
    tips: 'Obserwuj swoją skórę – staje się bardziej promienna i gładka.',
    mentalBoost: 'Twoje ciało zatrzymuje cenne minerały zamiast bezustannie je wypłukiwać.'
  },
  {
    id: 'm-6d',
    code: '6D',
    name: '6 Dni',
    seconds: 6 * 24 * 3600,
    phase: 'Faza 4: Rytm Kortyzolowy',
    benefit: 'Naturalny poranny wyrzut energii',
    description: 'Kortyzol (hormon wybudzający) odzyskuje swój naturalny dobowy profil – najwyższy 30 minut po przebudzeniu, a następnie łagodnie opadający ku wieczorowi.',
    symptoms: 'Budzenie się rano bez uczucia "mgły mózgowej" i bez desperackiej potrzeby kawy.',
    tips: 'Wystaw oczy na naturalne światło słoneczne zaraz po wstaniu z łóżka.',
    mentalBoost: 'Twoje ciało potrafi samo produkować własną energię!'
  },
  {
    id: 'm-1w',
    code: '1T',
    name: '1 Tydzień (7 Dni)',
    seconds: 7 * 24 * 3600,
    phase: 'Faza 5: Stabilność Energetyczna',
    benefit: 'Koniec z popołudniowym zjazdem',
    description: 'Całkowity brak gwałtownych spadków energetycznych o godzinie 14:00-16:00. Poziom energii jest stabilny i przewidywalny od rana do nocy.',
    symptoms: 'Stała, wysoka wydajność w pracy przez cały dzień bez nerwowości.',
    tips: 'Doceniaj równy puls podczas wymagających zadań umysłowych.',
    mentalBoost: 'Pełny tydzień! Udowodniłeś sobie niezwykłą determinację i siłę charakteru.'
  },
  {
    id: 'm-10d',
    code: '10D',
    name: '10 Dni',
    seconds: 10 * 24 * 3600,
    phase: 'Faza 5: Wchłanianie Minerałów',
    benefit: 'Magnez, wapń i żelazo w pełni przyswajane',
    description: 'Związki garbnikowe i kofeina nie blokują już wchłaniania żelaza niehemowego oraz wapnia w jelicie cienkim. Zwiększa się gęstość mineralna i siła skurczu mięśni.',
    symptoms: 'Zanik mimowolnych drgań powiek, brak skurczów łydek, mocniejsze paznokcie.',
    tips: 'Wzbogać dietę w zielone warzywa liściaste, nasiona dyni i kakao ceremonialne bez cukru.',
    mentalBoost: 'Każdy kęs jedzenia odżywia Twoje ciało w 100%.'
  },
  {
    id: 'm-2w',
    code: '2T',
    name: '2 Tygodnie (14 Dni)',
    seconds: 14 * 24 * 3600,
    phase: 'Faza 6: Reset Adenozynowy',
    benefit: 'Przywrócenie gęstości receptorów',
    description: 'Gęstość i wrażliwość receptorów adenozynowych w mózgu wróciły do poziomu osoby nigdy niepijącej kawy. Twój mózg osiągnął fabryczną architekturę neurochemiczną.',
    symptoms: 'Głęboki, regenerujący sen i niezwykła odporność na stres psychiczny.',
    tips: 'Zauważ, jak łatwo zasypiasz – w ciągu 10-15 minut od położenia głowy na poduszce.',
    mentalBoost: 'Twój mózg fizycznie się przebudował. Jesteś wolnym człowiekiem.'
  },
  {
    id: 'm-3w',
    code: '3T',
    name: '3 Tygodnie (21 Dni)',
    seconds: 21 * 24 * 3600,
    phase: 'Faza 6: Neuroplastyczność Nawykowa',
    benefit: 'Przełamanie pętli psychologicznej',
    description: 'Zgodnie z zasadami neuroplastyczności, stare ścieżki neuronalne odpowiedzialne za automatyzm sięgania po kubek osłabły, a nowe, zdrowe nawyki stały się drugą naturą.',
    symptoms: 'Brak tęsknoty za kawą w sytuacjach towarzyskich czy podczas przerw w pracy.',
    tips: 'Zastąp dawny rytuał pyszną matchą bezkofeinową, herbatą ziołową lub zimną wodą z miętą.',
    mentalBoost: 'Zbudowałeś nowy, trwały nawyk na całe życie.'
  },
  {
    id: 'm-1m',
    code: '1M',
    name: '1 Miesiąc (30 Dni)',
    seconds: 30 * 24 * 3600,
    phase: 'Faza 7: Złota Homeostaza',
    benefit: 'Biel zębów, lśniąca cera i spokój',
    description: 'Brak przebarwień na szkliwie zębów, naturalne pH w jamie ustnej, całkowite wygaszenie stanów lękowych wywoływanych przez nadstymulację układu nerwowego.',
    symptoms: 'Niewzruszony spokój wewnętrzny, zero kołatania serca, doskonała kondycja dziąseł.',
    tips: 'Umów się na wizytę higienizacyjną – Twoje zęby pozostaną białe na zawsze!',
    mentalBoost: '30 dni czystości! Jesteś w elitarnym gronie osób dbających o czystość biologiczną.'
  },
  {
    id: 'm-45d',
    code: '45D',
    name: '45 Dni',
    seconds: 45 * 24 * 3600,
    phase: 'Faza 7: Żelazna Wydolność',
    benefit: 'Głęboka regeneracja nadnerczy',
    description: 'Kora nadnerczy jest w pełni zregenerowana po miesiącach lub latach ciągłej stymulacji. Równowaga aldosteronu i kortyzolu zapewnia stabilną wytrzymałość fizyczną.',
    symptoms: 'Większa wydolność tlenowa podczas uprawiania sportu i brak zadyszki.',
    tips: 'Sprawdź swoje tętno spoczynkowe – prawdopodobnie spadło o 4-8 uderzeń na minutę.',
    mentalBoost: 'Twoje ciało działa jak precyzyjny szwajcarski zegarek.'
  },
  {
    id: 'm-2m',
    code: '2M',
    name: '2 Miesiące (60 Dni)',
    seconds: 60 * 24 * 3600,
    phase: 'Faza 8: Mistrzowska Koncentracja',
    benefit: 'Czysty stan "Flow" bez dopalaczy',
    description: 'Zdolność do wielogodzinnej, głębokiej pracy twórczej (Deep Work) bez wahań koncentracji i bez potrzeby sztucznego stymulowania uwagi.',
    symptoms: 'Stały, laserowy fokus i znacznie wyższa odporność na rozpraszacze.',
    tips: 'Praktykuj bloki pracy 90-minutowej z 15-minutowymi przerwami na rozciąganie.',
    mentalBoost: 'Prawdziwe skupienie pochodzi z czystego umysłu, nie z kofeiny.'
  },
  {
    id: 'm-3m',
    code: '3M',
    name: '3 Miesiące (90 Dni)',
    seconds: 90 * 24 * 3600,
    phase: 'Faza 8: Kwartalny Triumf',
    benefit: 'Trwałe przeprogramowanie epigenetyczne',
    description: '90 dni to pełny cykl odnowy biologicznej wielu tkanek i komórek krwi. Twoja pamięć robocza, układ sercowo-naczyniowy i sen osiągnęły optymalny stan.',
    symptoms: 'Wspaniałe samopoczucie każdego ranka i poczucie absolutnej wolności wyboru.',
    tips: 'Świętuj ten kamień milowy ulubionym zdrowym posiłkiem lub nagrodą rzeczową.',
    mentalBoost: 'Pokonałeś jedno z najbardziej podstępnych uzależnień współczesnego świata.'
  },
  {
    id: 'm-6m',
    code: '6M',
    name: '6 Miesięcy (Pół Roku)',
    seconds: 180 * 24 * 3600,
    phase: 'Faza 9: Trwała Wolność',
    benefit: 'Niezachwiany spokój układu krążenia',
    description: 'Pół roku bez kofeiny to wielki triumf zdrowotny. Znacząco zredukowane ryzyko arytmii, nadciśnienia tętniczego oraz chronicznego wypalenia nadnerczy.',
    symptoms: 'Głęboka równowaga emocjonalna, stabilna waga i doskonałe trawienie.',
    tips: 'Bądź inspiracją dla znajomych, którzy narzekają na wieczne zmęczenie mimo picia 4 kaw dziennie.',
    mentalBoost: 'Pół roku czystości! Twoje zdrowie zyskało bezcenną tarczę ochronną.'
  },
  {
    id: 'm-9m',
    code: '9M',
    name: '9 Miesięcy',
    seconds: 270 * 24 * 3600,
    phase: 'Faza 9: Biologiczna Odnowa',
    benefit: 'Perfekcyjna harmonia psychosomatyczna',
    description: 'Układ nerwowy pracuje z maksymalną wydajnością adaptacyjną. Twój sen to głęboka studnia regeneracji każdej nocy.',
    symptoms: 'Brak jakichkolwiek wahań energii w ciągu dnia, wysoki poziom witalności.',
    tips: 'Zwróć uwagę na jakość swoich relacji – mniej drażliwości oznacza lepszą komunikację.',
    mentalBoost: '9 miesięcy konsekwencji – Twoja siła woli nie ma sobie równych.'
  },
  {
    id: 'm-1y',
    code: '1R',
    name: '1 Rok (365 Dni)',
    seconds: 365 * 24 * 3600,
    phase: 'Faza 10: Legenda Samodyscypliny',
    benefit: 'Szczytowa forma ciała i umysłu',
    description: 'Pełne cztery pory roku przeżyte w absolutnej czystości od kofeiny. Przetrwałeś jesienną słotę, zimowe mrozy, wiosenne przesilenia i letnie upały bez ani jednej kropli stymulanta.',
    symptoms: 'Niezależność, potężna odporność psychiczna, czyste serce i naturalna życiowa energia.',
    tips: 'Jesteś wzorem do naśladowania. Twoja historia to dowód, że wolność jest możliwa.',
    mentalBoost: 'LEGENDA! Osiągnąłeś absolutny szczyt. Jesteś w 100% panem swojego ciała i umysłu.'
  },
];

// --- Helpers ---
function formatDuration(ms: number) {
  const diffSec = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(diffSec / (3600 * 24));
  const h = Math.floor((diffSec % (3600 * 24)) / 3600);
  const m = Math.floor((diffSec % 3600) / 60);
  
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${diffSec % 60}s`;
}

function calculateLongestStreak(logs: DrinkLog[], currentLastIntake: number, now: number) {
  let maxGap = Math.max(0, now - currentLastIntake);
  
  if (logs.length > 0) {
    const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
    maxGap = Math.max(maxGap, now - sortedLogs[0].timestamp);
    
    for (let i = 0; i < sortedLogs.length - 1; i++) {
      const gap = sortedLogs[i].timestamp - sortedLogs[i+1].timestamp;
      if (gap > maxGap) {
        maxGap = gap;
      }
    }
  }
  return maxGap;
}

export default function Page() {
  const [isClient, setIsClient] = useState(false);
  const [view, setView] = useState<'home' | 'stats' | 'settings'>('home');
  
  // Theme & Accent State
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [accentKey, setAccentKey] = useState<AccentColorKey>('orange'); // DEFAULT ORANGE

  // App Data State
  const [logs, setLogs] = useState<DrinkLog[]>([]);
  const [lastIntake, setLastIntake] = useState<number>(Date.now() - 38 * 3600 * 1000);
  const [now, setNow] = useState<number>(Date.now());
  
  // Modals & Sheets
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  // Notification State
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // PWA & Update States
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [serverVersionInfo, setServerVersionInfo] = useState<{ version: string; description?: string } | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [updateBannerDismissed, setUpdateBannerDismissed] = useState<boolean>(false);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState<boolean>(false);

  // Time customization in Add Modal
  const [isCustomTimeOpen, setIsCustomTimeOpen] = useState(false);
  const [customTimeDate, setCustomTimeDate] = useState<string>('');
  const [customTimeHour, setCustomTimeHour] = useState<string>('');

  const currentAccent = ACCENT_PALETTES[accentKey] || ACCENT_PALETTES.orange;

  useEffect(() => {
    const savedLogs = localStorage.getItem('zerocaff_logs') || localStorage.getItem('caffeine_logs');
    const savedIntake = localStorage.getItem('zerocaff_last_intake') || localStorage.getItem('caffeine_last_intake');
    const savedTheme = localStorage.getItem('zerocaff_theme') as ThemeMode | null;
    const savedAccent = localStorage.getItem('zerocaff_accent') as AccentColorKey | null;
    const savedNotifPref = localStorage.getItem('zerocaff_notif_enabled');
    
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch {}
    }
    
    if (savedIntake) {
      setLastIntake(parseInt(savedIntake, 10));
    } else {
      const initialIntake = Date.now() - 38 * 3600 * 1000;
      setLastIntake(initialIntake);
      localStorage.setItem('zerocaff_last_intake', initialIntake.toString());
    }

    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'gray' || savedTheme === 'light')) {
      setTheme(savedTheme);
    }
    if (savedAccent && ACCENT_PALETTES[savedAccent]) {
      setAccentKey(savedAccent);
    }
    if (savedNotifPref !== null) {
      setNotificationsEnabled(savedNotifPref === 'true');
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission('unsupported');
    }
    
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isClient]);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  // --- PWA & Update Mechanisms ---
  const checkForUpdate = async (manual = false) => {
    if (manual) setIsCheckingUpdate(true);
    try {
      // 1. Service Worker update check
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
          if (reg.waiting) {
            setWaitingWorker(reg.waiting);
            setUpdateAvailable(true);
            setUpdateBannerDismissed(false);
            if (manual) showToast("Znaleziono nowszą wersję aplikacji!");
            if (manual) setIsCheckingUpdate(false);
            return;
          }
        }
      }

      // 2. Dual check with server version manifest
      const res = await fetch(`${getAssetUrl('/version.json')}?_t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setServerVersionInfo(data);
        if (data.version && data.version !== APP_VERSION) {
          setUpdateAvailable(true);
          setUpdateBannerDismissed(false);
          if (manual) showToast(`Dostępna nowa wersja: v${data.version}!`);
        } else if (manual) {
          showToast(`Masz najnowszą wersję aplikacji (v${APP_VERSION})`);
        }
      } else if (manual) {
        showToast(`Masz najnowszą wersję aplikacji (v${APP_VERSION})`);
      }
    } catch {
      if (manual) showToast("Aplikacja działa w trybie offline.");
    } finally {
      if (manual) setIsCheckingUpdate(false);
    }
  };

  const applyUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    showToast("Aktualizowanie aplikacji ZeroCaff...");
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  const handleInstallPWA = async () => {
    if (installPrompt) {
      try {
        installPrompt.prompt();
        const choiceResult = await installPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          showToast("Instalowanie aplikacji ZeroCaff...");
          setInstallPrompt(null);
        }
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    } else {
      setShowInstallGuideModal(true);
    }
  };

  // PWA Service Worker & Install Listener Registration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if running in standalone mode (already installed as PWA)
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isRunningStandalone);

    // Capture beforeinstallprompt for Android Chrome
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    const onAppInstalled = () => {
      setIsStandalone(true);
      setInstallPrompt(null);
      showToast("ZeroCaff zainstalowano pomyślnie na urządzeniu!");
    };
    window.addEventListener('appinstalled', onAppInstalled);

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(getAssetUrl('/sw.js'))
        .then((reg) => {
          if (reg.waiting) {
            setWaitingWorker(reg.waiting);
            setUpdateAvailable(true);
          }
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setUpdateAvailable(true);
                setUpdateBannerDismissed(false);
              }
            });
          });
        })
        .catch((err) => {
          console.warn('[SW Registration Error]', err);
        });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // Check for updates on mount and on window focus
    checkForUpdate(false);
    const interval = setInterval(() => checkForUpdate(false), 5 * 60 * 1000);
    const onFocus = () => checkForUpdate(false);
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert("Twoja przeglądarka nie obsługuje systemowych powiadomień Web Notification API.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('zerocaff_notif_enabled', 'true');
        showToast("Powiadomienia zostały pomyślnie aktywowane!");
        try {
          new Notification("ZeroCaff: Powiadomienia Aktywne! 🔔", {
            body: "Będziesz otrzymywać powiadomienia o nowych kamieniach milowych i osobistych rekordach.",
          });
        } catch {}
      } else if (permission === 'denied') {
        showToast("Powiadomienia zostały zablokowane w ustawieniach przeglądarki.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendTestNotification = () => {
    if (notificationPermission !== 'granted') {
      requestNotificationPermission();
      return;
    }
    try {
      new Notification("ZeroCaff: Test Powiadomień 🚀", {
        body: `Twój aktualny czas wolności od kofeiny: ${days}d ${hours}h ${minutes}m. Aplikacja czuwa nad Twoim detoksem!`,
      });
      showToast("Wysłano testowe powiadomienie!");
    } catch (err) {
      console.error(err);
    }
  };

  // Set theme & accent handlers
  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem('zerocaff_theme', newTheme);
  };

  const handleAccentChange = (newAccent: AccentColorKey) => {
    setAccentKey(newAccent);
    localStorage.setItem('zerocaff_accent', newAccent);
  };

  // Open add modal initialized with current date/time
  const handleOpenAddModal = () => {
    const currentDate = new Date();
    setCustomTimeDate(format(currentDate, 'yyyy-MM-dd'));
    setCustomTimeHour(format(currentDate, 'HH:mm'));
    setIsCustomTimeOpen(false);
    setShowAddModal(true);
  };

  const addLog = (drink: Drink) => {
    let logTimestamp = Date.now();

    if (isCustomTimeOpen && customTimeDate && customTimeHour) {
      const [h, m] = customTimeHour.split(':').map(Number);
      const chosenDate = new Date(customTimeDate);
      chosenDate.setHours(h || 0, m || 0, 0, 0);
      logTimestamp = Math.min(Date.now(), chosenDate.getTime());
    }

    const newLog: DrinkLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: logTimestamp,
      drinkId: drink.id,
      mg: drink.mg,
    };
    
    const newLogs = [newLog, ...logs];
    setLogs(newLogs);
    
    if (logTimestamp >= lastIntake || logs.length === 0) {
      setLastIntake(logTimestamp);
      localStorage.setItem('zerocaff_last_intake', logTimestamp.toString());
    }
    
    localStorage.setItem('zerocaff_logs', JSON.stringify(newLogs));
    setShowAddModal(false);
  };

  const applyTimeOffset = (minutesAgo: number) => {
    const targetDate = new Date(Date.now() - minutesAgo * 60 * 1000);
    setCustomTimeDate(format(targetDate, 'yyyy-MM-dd'));
    setCustomTimeHour(format(targetDate, 'HH:mm'));
    setIsCustomTimeOpen(true);
  };

  const removeLog = (id: string) => {
    const newLogs = logs.filter(l => l.id !== id);
    setLogs(newLogs);
    localStorage.setItem('zerocaff_logs', JSON.stringify(newLogs));
    
    if (newLogs.length > 0) {
      const latest = Math.max(...newLogs.map(l => l.timestamp));
      setLastIntake(latest);
      localStorage.setItem('zerocaff_last_intake', latest.toString());
    }
  };

  const resetTimerDirectly = () => {
    if (confirm("Czy na pewno chcesz zresetować swój licznik czasu bez dodawania wpisu w historii?")) {
      const timestamp = Date.now();
      setLastIntake(timestamp);
      localStorage.setItem('zerocaff_last_intake', timestamp.toString());
      setShowAddModal(false);
    }
  };

  // --- Calculations for Timers ---
  const diffSeconds = Math.max(0, Math.floor((now - lastIntake) / 1000));
  const days = Math.floor(diffSeconds / (3600 * 24));
  const hours = Math.floor((diffSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  // Automatic Notification on Milestones & Personal Best Streak
  useEffect(() => {
    if (!isClient || notificationPermission !== 'granted' || !notificationsEnabled) return;

    // 1. Check milestone achievements
    const achieved = MILESTONES.filter(m => diffSeconds >= m.seconds);
    if (achieved.length > 0) {
      const latestAchieved = achieved[achieved.length - 1];
      const lastNotifiedMilestoneId = localStorage.getItem('zerocaff_last_notified_milestone');
      
      if (lastNotifiedMilestoneId !== latestAchieved.id) {
        try {
          new Notification(`ZeroCaff: Nowy Kamień Milowy! 🏆 (${latestAchieved.code})`, {
            body: `Gratulacje! Osiągnąłeś etap: ${latestAchieved.name}. ${latestAchieved.benefit}`,
          });
          localStorage.setItem('zerocaff_last_notified_milestone', latestAchieved.id);
        } catch {}
      }
    }

    // 2. Check personal record streak (every full 24h milestone reached in streak)
    const currentStreakHours = Math.floor(diffSeconds / 3600);
    const lastNotifiedStreakHours = parseInt(localStorage.getItem('zerocaff_last_notified_streak_h') || '0', 10);
    
    if (currentStreakHours >= 24 && currentStreakHours >= lastNotifiedStreakHours + 24) {
      const streakDays = Math.floor(currentStreakHours / 24);
      try {
        new Notification(`ZeroCaff: Nowy Rekord Detoksu! 🔥 (${streakDays} dni)`, {
          body: `Twój ciąg czystości trwa już ${streakDays} dni (${currentStreakHours}h). Twój organizm bije rekord regeneracji!`,
        });
        localStorage.setItem('zerocaff_last_notified_streak_h', currentStreakHours.toString());
      } catch {}
    }
  }, [diffSeconds, isClient, notificationPermission, notificationsEnabled]);

  const clearAllData = () => {
    if (confirm("UWAGA: Czy na pewno chcesz wyczyścić wszystkie dane, logi i zresetować aplikację do ustawień fabrycznych?")) {
      localStorage.clear();
      setLogs([]);
      const start = Date.now();
      setLastIntake(start);
      setTheme('dark');
      setAccentKey('orange');
      alert("Dane zostały zresetowane.");
    }
  };

  // Milestone Progress
  const currentMilestoneIndex = MILESTONES.findIndex(m => diffSeconds < m.seconds);
  const nextMilestone = currentMilestoneIndex === -1 ? MILESTONES[MILESTONES.length - 1] : MILESTONES[currentMilestoneIndex];
  const previousMilestoneSeconds = currentMilestoneIndex <= 0 ? 0 : MILESTONES[currentMilestoneIndex - 1].seconds;
  
  const milestoneProgress = currentMilestoneIndex === -1 
    ? 100 
    : Math.min(100, Math.max(0, ((diffSeconds - previousMilestoneSeconds) / (nextMilestone.seconds - previousMilestoneSeconds)) * 100));

  const secondsRemainingForMilestone = Math.max(0, nextMilestone.seconds - diffSeconds);
  const remainingDays = Math.floor(secondsRemainingForMilestone / (3600 * 24));
  const remainingHours = Math.floor((secondsRemainingForMilestone % (3600 * 24)) / 3600);
  const remainingMins = Math.floor((secondsRemainingForMilestone % 3600) / 60);

  // --- Triple Ring Progress Calculations ---
  // Ring 1 (Days): 7-day loop (progress within current 7-day cycle)
  const daysCycleProgress = Math.min(100, ((days % 7) + (hours / 24)) / 7 * 100);
  // Ring 2 (Hours): 0-24h
  const hoursProgress = Math.min(100, ((hours * 60 + minutes) / (24 * 60)) * 100);
  // Ring 3 (Minutes): 0-60m
  const minutesProgress = Math.min(100, ((minutes * 60 + seconds) / 3600) * 100);

  // Concentric SVG Radii
  const rDays = 126;    // Outer (Accent primary)
  const rHours = 103;   // Middle (Cyan/Secondary)
  const rMinutes = 80;  // Inner (Violet/Tertiary)

  const cDays = 2 * Math.PI * rDays;
  const cHours = 2 * Math.PI * rHours;
  const cMinutes = 2 * Math.PI * rMinutes;

  const offsetDays = cDays - (daysCycleProgress / 100) * cDays;
  const offsetHours = cHours - (hoursProgress / 100) * cHours;
  const offsetMinutes = cMinutes - (minutesProgress / 100) * cMinutes;

  // Track & outline colors for guaranteed contrast
  const trackStrokeColor = theme === 'light' ? '#e2e8f0' : theme === 'gray' ? '#2e313e' : '#1e212b';
  const trackBorderColor = theme === 'light' ? '#cbd5e1' : theme === 'gray' ? '#3d4152' : '#272a38';

  // --- Stats Calculations & 7-Day Trendline ---
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(now, 6 - i);
    const dayLogs = logs.filter(l => isSameDay(new Date(l.timestamp), date));
    const totalMg = dayLogs.reduce((sum, l) => sum + l.mg, 0);
    return {
      name: format(date, 'EEE', { locale: pl }), 
      fullDate: format(date, 'd MMMM yyyy', { locale: pl }),
      mg: totalMg,
    };
  });

  // Linear Regression for 7-Day Trendline
  const nPoints = chartData.length;
  const xMean = (nPoints - 1) / 2;
  const yMean = chartData.reduce((sum, d) => sum + d.mg, 0) / nPoints;
  let numTrend = 0;
  let denTrend = 0;
  chartData.forEach((d, i) => {
    numTrend += (i - xMean) * (d.mg - yMean);
    denTrend += Math.pow(i - xMean, 2);
  });
  const trendSlope = denTrend === 0 ? 0 : numTrend / denTrend;
  const trendIntercept = yMean - trendSlope * xMean;

  const chartDataWithTrend = chartData.map((d, i) => ({
    ...d,
    trend: Math.max(0, Math.round(trendSlope * i + trendIntercept)),
  }));

  const startTrendVal = Math.max(0, Math.round(trendIntercept));
  const endTrendVal = Math.max(0, Math.round(trendSlope * 6 + trendIntercept));
  const total7DayMg = chartData.reduce((sum, d) => sum + d.mg, 0);
  const isDeclining = trendSlope < -2;
  const isIncreasing = trendSlope > 2;
  const trendPercent = startTrendVal > 0 
    ? Math.round(Math.abs((endTrendVal - startTrendVal) / startTrendVal) * 100)
    : 0;

  const todaysTotalMg = chartData[6].mg;
  const weekTotalDrinks = logs.filter(l => now - l.timestamp <= 7 * 24 * 3600 * 1000).length;
  const totalCaffeineSavedEstimate = Math.round((diffSeconds / 3600) * 8.3); // ~200mg/24h saved
  const totalHoursClean = Math.floor(diffSeconds / 3600);
  
  const longestStreakMs = calculateLongestStreak(logs, lastIntake, now);
  const longestStreakFormatted = formatDuration(longestStreakMs);

  const drinkCounts = logs.reduce((acc, log) => {
    acc[log.drinkId] = (acc[log.drinkId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const favoriteDrinkId = Object.keys(drinkCounts).length > 0 
    ? Object.keys(drinkCounts).reduce((a, b) => drinkCounts[a] > drinkCounts[b] ? a : b) 
    : null;
  const favoriteDrink = favoriteDrinkId ? DRINKS.find(d => d.id === favoriteDrinkId) : null;

  // --- Time-of-Day Intake Distribution (Najczęstsze pory spożycia) ---
  const timeBuckets = [
    {
      id: 'morning',
      label: 'Poranek',
      timeRange: '06:00 – 11:59',
      icon: Sun,
      color: '#f59e0b',
      bgColor: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      description: 'Nawyk poranny – nakłada się na naturalny szczyt porannego kortyzolu.',
      advice: 'Zastąp kawę 500 ml wody ze szczyptą soli kłodawskiej i 10 min spaceru w świetle dziennym.',
      filter: (h: number) => h >= 6 && h < 12,
    },
    {
      id: 'afternoon',
      label: 'Wczesne Popołudnie',
      timeRange: '12:00 – 15:59',
      icon: SunMedium,
      color: '#f97316',
      bgColor: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
      description: 'Zjazd poobiedni – kumulacja adenozyny i spadek glukozy po posiłku.',
      advice: 'Zjedz lżejszy obiad o niskim IG, zrób 10-minutowy spacer lub wypij zimną wodę gazowaną z cytryną.',
      filter: (h: number) => h >= 12 && h < 16,
    },
    {
      id: 'evening',
      label: 'Popołudnie / Wieczór',
      timeRange: '16:00 – 20:59',
      icon: Sunset,
      color: '#8b5cf6',
      bgColor: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
      description: 'Stres i zmęczenie popołudniowe – bezpośrednio blokuje produkcję melatoniny.',
      advice: 'Kofeina po 16:00 niszczy fazę snu głębokiego NREM. Zastąp ją melisą, rumiankiem lub magnezem.',
      filter: (h: number) => h >= 16 && h < 21,
    },
    {
      id: 'night',
      label: 'Noc / Wczesny Ranek',
      timeRange: '21:00 – 05:59',
      icon: Moon,
      color: '#06b6d4',
      bgColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      description: 'Praca nocna lub bezsenność rozregulowująca dobowy zegar biologiczny.',
      advice: 'Zredukuj ekspozycję na niebieskie światło ekranów i zastosuj techniki oddechowe 4-7-8.',
      filter: (h: number) => h >= 21 || h < 6,
    },
  ];

  const bucketStats = timeBuckets.map(b => {
    const bucketLogs = logs.filter(l => {
      const h = new Date(l.timestamp).getHours();
      return b.filter(h);
    });
    const count = bucketLogs.length;
    const mg = bucketLogs.reduce((sum, l) => sum + l.mg, 0);
    const percentage = logs.length > 0 ? Math.round((count / logs.length) * 100) : 0;
    return {
      ...b,
      count,
      mg,
      percentage,
    };
  });

  const peakBucket = logs.length > 0 
    ? [...bucketStats].filter(b => b.count > 0).sort((a, b) => b.count - a.count)[0] || null
    : null;

  // --- Theme Wrapper Styles ---
  const themeClasses = {
    dark: 'bg-[#090a0f] text-zinc-100',
    gray: 'bg-[#16171e] text-slate-100',
    light: 'bg-[#f4f5f8] text-zinc-900',
  }[theme];

  const cardClasses = {
    dark: 'bg-zinc-900/60 border-zinc-800/80',
    gray: 'bg-[#20222d]/80 border-slate-700/60',
    light: 'bg-white/95 border-zinc-200 shadow-sm',
  }[theme];

  const subTextClasses = {
    dark: 'text-zinc-400',
    gray: 'text-slate-400',
    light: 'text-zinc-600',
  }[theme];

  const muteTextClasses = {
    dark: 'text-zinc-500',
    gray: 'text-slate-500',
    light: 'text-zinc-400',
  }[theme];

  const innerItemBg = {
    dark: 'bg-zinc-950/70 border-zinc-800/60',
    gray: 'bg-[#181922]/90 border-slate-700/50',
    light: 'bg-zinc-50 border-zinc-200',
  }[theme];

  const navBg = {
    dark: 'bg-[#090a0f]/92 border-zinc-800/80',
    gray: 'bg-[#16171e]/95 border-slate-700/80',
    light: 'bg-white/95 border-zinc-200/90 shadow-lg',
  }[theme];

  const modalBg = {
    dark: 'bg-zinc-900 border-zinc-800',
    gray: 'bg-[#1e202a] border-slate-700',
    light: 'bg-white border-zinc-200',
  }[theme];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${themeClasses}`}>
      <div className="max-w-md mx-auto relative min-h-screen">
        
        {/* Top App Header with Brand Logo & ENLARGED Options Button */}
        <header className="px-6 pt-6 pb-4 flex items-center justify-between relative z-20">
          <div 
            onClick={() => setView('home')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            {/* AI Generated Sleek Coffee Bean Logo */}
            <div 
              className="relative flex items-center justify-center w-11 h-11 rounded-2xl border shadow-sm transition-all overflow-hidden p-1"
              style={{
                borderColor: currentAccent.badgeBorder,
                backgroundColor: currentAccent.badgeBg,
                boxShadow: `0 0 20px ${currentAccent.glow}`
              }}
            >
              <img 
                src={getAssetUrl('/coffee_bean_logo.jpg')} 
                alt="ZeroCaff Coffee Bean Logo" 
                width={40} 
                height={40} 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight">
                  ZeroCaff
                </span>
                <span 
                  className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: currentAccent.badgeBg,
                    color: currentAccent.primary,
                    borderColor: currentAccent.badgeBorder,
                  }}
                >
                  Detox
                </span>
              </div>
              <p className={`text-[11px] font-medium ${muteTextClasses}`}>Wolność od kofeiny</p>
            </div>
          </div>

          {/* DELIKATNIE POWIĘKSZONY PRZYCISK OPCJI NA GÓRZE */}
          <button
            id="top-settings-btn"
            onClick={() => setView(view === 'settings' ? 'home' : 'settings')}
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all shadow-sm active:scale-95 backdrop-blur-md ${
              view === 'settings' 
                ? 'border-transparent text-white ring-2 ring-offset-2 shadow-md'
                : `${cardClasses} ${subTextClasses} hover:text-zinc-100 hover:border-zinc-500`
            }`}
            style={view === 'settings' ? { 
              backgroundColor: currentAccent.primary,
              boxShadow: `0 0 16px ${currentAccent.glow}`,
              borderColor: currentAccent.primary
            } : {}}
            title="Opcje i ustawienia motywu"
          >
            <Settings size={20} className={view === 'settings' ? 'rotate-90 transition-transform duration-300' : ''} />
          </button>
        </header>

        {/* Content Area */}
        <div className="pb-32 overflow-hidden">
          {/* Notification Toast Alert */}
          <AnimatePresence>
            {notificationToast && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] px-4 py-3 rounded-2xl bg-zinc-900/95 text-white border border-zinc-700 shadow-2xl backdrop-blur-xl flex items-center gap-3"
              >
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: currentAccent.primary }}
                >
                  <BellRing size={16} className="text-white" />
                </div>
                <p className="text-xs font-semibold leading-tight flex-1">{notificationToast}</p>
                <button 
                  onClick={() => setNotificationToast(null)}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg"
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            
            {/* VIEW 1: HOME / TIMER */}
            {view === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="px-6 flex flex-col items-center"
              >
                
                {/* TRIPLE CONCENTRIC PROGRESS RINGS TIMER WITH DISTINCT CONTOURS, ON-RING LABELS & NUMERICAL VALUES */}
                <div className="relative flex items-center justify-center w-full max-w-[340px] aspect-square my-2">
                  {/* Subtle Glowing Halo */}
                  <div 
                    className="absolute inset-6 blur-3xl rounded-full pointer-events-none opacity-30"
                    style={{ backgroundColor: currentAccent.primary }}
                  />

                  {/* SVG Triple Rings with Prominent Days Ring & Delicate Minutes Ring */}
                  <svg className="w-full h-full drop-shadow-xl" viewBox="0 0 300 300">
                    <defs>
                      <filter id="glow-outer" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor={currentAccent.primary} floodOpacity="0.5" />
                      </filter>
                      <filter id="glow-mid" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#06b6d4" floodOpacity="0.5" />
                      </filter>
                      <filter id="glow-inner" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#8b5cf6" floodOpacity="0.5" />
                      </filter>
                    </defs>

                    {/* ROTATING ARCS LAYER (-90 deg from center (150, 150)) */}
                    <g transform="rotate(-90 150 150)">
                      {/* ================= RING 1 (OUTER - DNI - NAJBARDZIEJ WYRÓŻNIONY) ================= */}
                      {/* Dark high-contrast outer track border */}
                      <circle 
                        cx="150" cy="150" r="132" 
                        stroke={trackBorderColor} 
                        strokeWidth="14" 
                        fill="none" 
                      />
                      {/* Inner track stroke */}
                      <circle 
                        cx="150" cy="150" r="132" 
                        stroke={trackStrokeColor} 
                        strokeWidth="10" 
                        fill="none" 
                      />
                      {/* Active Progress - Grubszy i wiodący */}
                      <motion.circle 
                        cx="150" cy="150" r="132"
                        stroke={currentAccent.primary}
                        strokeWidth="11" 
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 132}
                        strokeDashoffset={(2 * Math.PI * 132) - (daysCycleProgress / 100) * (2 * Math.PI * 132)}
                        filter="url(#glow-outer)"
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />

                      {/* ================= RING 2 (MIDDLE - GODZINY - ŚREDNIA GRUBOŚĆ) ================= */}
                      {/* Dark high-contrast middle track border */}
                      <circle 
                        cx="150" cy="150" r="106" 
                        stroke={trackBorderColor} 
                        strokeWidth="9.5" 
                        fill="none" 
                      />
                      {/* Inner track stroke */}
                      <circle 
                        cx="150" cy="150" r="106" 
                        stroke={trackStrokeColor} 
                        strokeWidth="6.5" 
                        fill="none" 
                      />
                      {/* Active Progress - Średnia grubość */}
                      <motion.circle 
                        cx="150" cy="150" r="106"
                        stroke="#06b6d4" 
                        strokeWidth="7.5" 
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 106}
                        strokeDashoffset={(2 * Math.PI * 106) - (hoursProgress / 100) * (2 * Math.PI * 106)}
                        filter="url(#glow-mid)"
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />

                      {/* ================= RING 3 (INNER - MINUTY - NAJDELIKATNIEJSZY) ================= */}
                      {/* Dark high-contrast inner track border */}
                      <circle 
                        cx="150" cy="150" r="80" 
                        stroke={trackBorderColor} 
                        strokeWidth="6" 
                        fill="none" 
                      />
                      {/* Inner track stroke */}
                      <circle 
                        cx="150" cy="150" r="80" 
                        stroke={trackStrokeColor} 
                        strokeWidth="3.5" 
                        fill="none" 
                      />
                      {/* Active Progress - Cienki i subtelny */}
                      <motion.circle 
                        cx="150" cy="150" r="80"
                        stroke="#8b5cf6" 
                        strokeWidth="4.5" 
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 80}
                        strokeDashoffset={(2 * Math.PI * 80) - (minutesProgress / 100) * (2 * Math.PI * 80)}
                        filter="url(#glow-inner)"
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </g>

                    {/* DIRECT ON-RING LABELS AND VALUES (NON-ROTATED) */}
                    {/* Ring 1 Label & Value Badge (Outer - Dni) */}
                    <g transform="translate(150, 18)">
                      <rect 
                        x="-38" y="-10" width="76" height="20" rx="10" 
                        fill={theme === 'light' ? '#ffffff' : '#0f1118'} 
                        stroke={currentAccent.primary} 
                        strokeWidth="1.5" 
                      />
                      <circle cx="-28" cy="0" r="3.5" fill={currentAccent.primary} />
                      <text 
                        x="3" y="3.5" 
                        textAnchor="middle" 
                        fill={theme === 'light' ? '#18181b' : '#ffffff'} 
                        fontSize="9.5" 
                        fontWeight="800" 
                        letterSpacing="0.3px"
                      >
                        DNI: {days}d
                      </text>
                    </g>

                    {/* Ring 2 Label & Value Badge (Middle - Godziny) */}
                    <g transform="translate(150, 44)">
                      <rect 
                        x="-40" y="-9" width="80" height="18" rx="9" 
                        fill={theme === 'light' ? '#ffffff' : '#0f1118'} 
                        stroke="#06b6d4" 
                        strokeWidth="1.5" 
                      />
                      <circle cx="-30" cy="0" r="3" fill="#06b6d4" />
                      <text 
                        x="3" y="3" 
                        textAnchor="middle" 
                        fill={theme === 'light' ? '#0e7490' : '#22d3ee'} 
                        fontSize="9" 
                        fontWeight="800" 
                        letterSpacing="0.2px"
                      >
                        GODZ: {hours}h
                      </text>
                    </g>

                    {/* Ring 3 Label & Value Badge (Inner - Minuty) */}
                    <g transform="translate(150, 70)">
                      <rect 
                        x="-36" y="-8.5" width="72" height="17" rx="8.5" 
                        fill={theme === 'light' ? '#ffffff' : '#0f1118'} 
                        stroke="#8b5cf6" 
                        strokeWidth="1.5" 
                      />
                      <circle cx="-27" cy="0" r="2.5" fill="#8b5cf6" />
                      <text 
                        x="2" y="3" 
                        textAnchor="middle" 
                        fill={theme === 'light' ? '#6d28d9' : '#c084fc'} 
                        fontSize="8.5" 
                        fontWeight="800" 
                        letterSpacing="0.2px"
                      >
                        MIN: {minutes}m
                      </text>
                    </g>
                  </svg>
                  
                  {/* Central Text HUD */}
                  <div className="absolute flex flex-col items-center justify-center text-center select-none pt-7">
                    <span className="text-4xl sm:text-5xl font-light tracking-tighter tabular-nums leading-none">
                      {days > 0 ? days : hours}
                    </span>
                    <span 
                      className="text-[10px] font-bold tracking-widest uppercase mt-1"
                      style={{ color: currentAccent.primary }}
                    >
                      {days > 0 ? (days === 1 ? 'Dzień Wolności' : 'Dni Wolności') : 'Godzin Wolności'}
                    </span>
                    <div className={`flex items-center gap-1.5 text-xs font-medium tabular-nums mt-1.5 px-3 py-1 rounded-full border backdrop-blur-md ${innerItemBg}`}>
                      <Clock size={12} className={muteTextClasses} />
                      <span>{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                </div>

                {/* EXPLICIT RING VALUE CARDS (OZNACZENIE I WARTOŚĆ KAŻDEGO PIERŚCIENIA) */}
                <div className="w-full space-y-1.5 mb-5">
                  <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-zinc-400">
                    <span>Odczyt pierścieni czasu:</span>
                    <span className="text-[10px] text-zinc-500">cykle odliczania</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 w-full">
                    {/* Outer Ring: DAYS */}
                    <div className={`border rounded-2xl p-3 flex flex-col relative overflow-hidden backdrop-blur-sm transition-all ${cardClasses}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: currentAccent.primary }} />
                          Dni
                        </span>
                        <span className={`text-[9px] font-medium ${muteTextClasses}`}>Zewn.</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold tabular-nums">{days}</span>
                        <span className={`text-[10px] font-medium ${muteTextClasses}`}>dni</span>
                      </div>
                      <span className={`text-[10px] tabular-nums mt-1 ${muteTextClasses}`}>
                        cykl 7d: {Math.round(daysCycleProgress)}%
                      </span>
                    </div>

                    {/* Middle Ring: HOURS */}
                    <div className={`border rounded-2xl p-3 flex flex-col relative overflow-hidden backdrop-blur-sm transition-all ${cardClasses}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block shrink-0" />
                          Godziny
                        </span>
                        <span className={`text-[9px] font-medium ${muteTextClasses}`}>Środk.</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold tabular-nums">{hours}</span>
                        <span className={`text-[10px] font-medium ${muteTextClasses}`}>/ 24h</span>
                      </div>
                      <span className={`text-[10px] tabular-nums mt-1 ${muteTextClasses}`}>
                        doba: {Math.round(hoursProgress)}%
                      </span>
                    </div>

                    {/* Inner Ring: MINUTES */}
                    <div className={`border rounded-2xl p-3 flex flex-col relative overflow-hidden backdrop-blur-sm transition-all ${cardClasses}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-violet-400 inline-block shrink-0" />
                          Minuty
                        </span>
                        <span className={`text-[9px] font-medium ${muteTextClasses}`}>Wewn.</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold tabular-nums">{minutes}</span>
                        <span className={`text-[10px] font-medium ${muteTextClasses}`}>/ 60m</span>
                      </div>
                      <span className={`text-[10px] tabular-nums mt-1 ${muteTextClasses}`}>
                        godz: {Math.round(minutesProgress)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* CURRENT / NEXT MILESTONE ACTIVE CARD */}
                <div 
                  onClick={() => setSelectedMilestone(nextMilestone)}
                  className={`w-full rounded-3xl p-5 border relative overflow-hidden backdrop-blur-md cursor-pointer transition-all group ${cardClasses}`}
                >
                  <div 
                    className="absolute top-0 right-0 w-36 h-36 blur-3xl rounded-full opacity-20"
                    style={{ backgroundColor: currentAccent.primary }}
                  />
                  
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-8 h-8 rounded-xl flex items-center justify-center border"
                        style={{
                          backgroundColor: currentAccent.badgeBg,
                          color: currentAccent.primary,
                          borderColor: currentAccent.badgeBorder
                        }}
                      >
                        <Trophy size={16} />
                      </div>
                      <div>
                        <span 
                          className="text-[10px] font-bold uppercase tracking-wider"
                          style={{ color: currentAccent.primary }}
                        >
                          Następny Kamień Milowy
                        </span>
                        <h3 className="text-base font-semibold flex items-center gap-1.5">
                          {nextMilestone.name}
                          <ChevronRight size={14} className={`${muteTextClasses} group-hover:translate-x-0.5 transition-transform`} />
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold">{Math.floor(milestoneProgress)}%</span>
                      <p className={`text-[10px] font-medium ${muteTextClasses}`}>
                        {remainingDays > 0 ? `${remainingDays}d ${remainingHours}h` : `${remainingHours}h ${remainingMins}m`} do celu
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className={`w-full h-2.5 rounded-full overflow-hidden p-0.5 border relative z-10 mb-2 ${theme === 'light' ? 'bg-zinc-100 border-zinc-200' : 'bg-black/40 border-zinc-800/80'}`}>
                    <motion.div 
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: currentAccent.primary,
                        boxShadow: `0 0 12px ${currentAccent.glow}`
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${milestoneProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs relative z-10">
                    <p className={`line-clamp-1 ${subTextClasses}`}>
                      <span style={{ color: currentAccent.primary }} className="font-semibold">{nextMilestone.benefit}:</span> {nextMilestone.description}
                    </p>
                    <span className="text-[10px] font-semibold text-cyan-400 shrink-0 ml-2">Kliknij po szczegóły</span>
                  </div>
                </div>

                {/* EXPANDED MILESTONES GRID (2H, 4H, 6H, 8H, 12H, 16H, 1D, 36H, 2D... 1R) */}
                <div className="w-full mt-6">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-1.5">
                      <Award size={15} style={{ color: currentAccent.primary }} />
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${subTextClasses}`}>
                        Osiągnięcia & Kamienie Milowe ({MILESTONES.length})
                      </h4>
                    </div>
                    <span className={`text-[11px] font-medium ${muteTextClasses}`}>
                      {MILESTONES.filter(m => diffSeconds >= m.seconds).length} / {MILESTONES.length} zdobyte
                    </span>
                  </div>

                  {/* Badges Grid (4 columns) */}
                  <div className="grid grid-cols-4 gap-2">
                    {MILESTONES.map((milestone) => {
                      const isUnlocked = diffSeconds >= milestone.seconds;
                      const isNext = milestone.id === nextMilestone.id && !isUnlocked;

                      return (
                        <motion.button
                          key={milestone.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedMilestone(milestone)}
                          className={`relative rounded-2xl p-2.5 flex flex-col items-center justify-center transition-all border text-center ${
                            isUnlocked
                              ? `${theme === 'light' ? 'bg-orange-50/80 border-orange-200' : 'bg-zinc-900 border-zinc-700/80 shadow-md'}`
                              : isNext
                              ? `${theme === 'light' ? 'bg-white border-cyan-400 ring-2 ring-cyan-400/20' : 'bg-zinc-900/90 border-cyan-500/60 shadow-[0_0_14px_rgba(6,182,212,0.2)]'}`
                              : `${innerItemBg} ${muteTextClasses} hover:border-zinc-600`
                          }`}
                          style={isUnlocked ? {
                            borderColor: currentAccent.badgeBorder,
                            backgroundColor: currentAccent.badgeBg,
                          } : {}}
                        >
                          {/* Top Status Icon */}
                          <div className="mb-1">
                            {isUnlocked ? (
                              <CheckCircle2 
                                size={15} 
                                style={{ color: currentAccent.primary }}
                              />
                            ) : isNext ? (
                              <Sparkles size={15} className="text-cyan-400 animate-pulse" />
                            ) : (
                              <Lock size={13} className={muteTextClasses} />
                            )}
                          </div>

                          {/* Code (e.g. 2H, 6H, 1D, 36H, 1T) */}
                          <span 
                            className="text-xs font-bold tracking-tight"
                            style={isUnlocked ? { color: currentAccent.primary } : isNext ? { color: '#06b6d4' } : {}}
                          >
                            {milestone.code}
                          </span>

                          <span className={`text-[8.5px] mt-0.5 truncate max-w-full font-medium ${muteTextClasses}`}>
                            {milestone.name}
                          </span>

                          {/* Glow Indicator for Next Target */}
                          {isNext && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            )}

            {/* VIEW 2: STATS */}
            {view === 'stats' && (
              <motion.div 
                key="stats"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="px-6 space-y-4"
              >
                {/* Stats Highlights Header */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Centrum Statystyk</h2>
                    <p className={`text-xs ${muteTextClasses}`}>Twoje postępy w detoksie kofeinowym</p>
                  </div>
                  <div 
                    className="px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5"
                    style={{
                      backgroundColor: currentAccent.badgeBg,
                      color: currentAccent.primary,
                      borderColor: currentAccent.badgeBorder
                    }}
                  >
                    <ShieldCheck size={14} />
                    <span>Aktywny Detoks</span>
                  </div>
                </div>

                {/* 2x2 Clean Recovery Metrics (Bez kalkulatora oszczędności) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`border rounded-3xl p-4 backdrop-blur-sm ${cardClasses}`}>
                    <div style={{ color: currentAccent.primary }} className="mb-2"><Activity size={20} /></div>
                    <div className="text-3xl font-bold tracking-tight">
                      {todaysTotalMg}<span className={`text-sm font-normal ml-1 ${muteTextClasses}`}>mg</span>
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${muteTextClasses}`}>Kofeina Dzisiaj</div>
                  </div>

                  <div className={`border rounded-3xl p-4 backdrop-blur-sm ${cardClasses}`}>
                    <div className="text-amber-500 mb-2"><BatteryCharging size={20} /></div>
                    <div className="text-3xl font-bold tracking-tight">
                      {totalHoursClean}<span className={`text-sm font-normal ml-1 ${muteTextClasses}`}>godz</span>
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${muteTextClasses}`}>Czyste Godziny</div>
                  </div>

                  <div className={`border rounded-3xl p-4 backdrop-blur-sm ${cardClasses}`}>
                    <div className="text-orange-500 mb-2"><Flame size={20} /></div>
                    <div className="text-2xl font-bold tracking-tight truncate">{longestStreakFormatted}</div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${muteTextClasses}`}>Najdłuższy Ciąg</div>
                  </div>

                  <div className={`border rounded-3xl p-4 backdrop-blur-sm ${cardClasses}`}>
                    <div className="text-cyan-400 mb-2"><Heart size={20} /></div>
                    <div className="text-2xl font-bold tracking-tight">~{totalCaffeineSavedEstimate}<span className={`text-xs font-normal ml-1 ${muteTextClasses}`}>mg</span></div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${muteTextClasses}`}>Uniknięta Kofeina</div>
                  </div>
                </div>

                {/* Favorite Trigger Drink */}
                {favoriteDrink ? (
                  <div className={`border rounded-3xl p-4 flex items-center justify-between backdrop-blur-sm ${cardClasses}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${favoriteDrink.color}`}>
                        <favoriteDrink.icon size={20} />
                      </div>
                      <div>
                        <div className={`text-[10px] font-bold uppercase tracking-widest ${muteTextClasses}`}>Główny Wyzwalacz</div>
                        <div className="text-base font-semibold">{favoriteDrink.name} ({drinkCounts[favoriteDrink.id]}x)</div>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${innerItemBg}`}>
                      {favoriteDrink.mg} mg / porcja
                    </span>
                  </div>
                ) : (
                  <div className={`border rounded-3xl p-4 text-center ${cardClasses}`}>
                    <p className={`text-xs ${subTextClasses}`}>Świetnie! Brak zarejestrowanych potknięć w historii.</p>
                  </div>
                )}

                {/* 7-Day Chart with Visual Trend Line */}
                <div className={`border rounded-3xl p-5 pt-6 backdrop-blur-sm ${cardClasses}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} style={{ color: currentAccent.primary }} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Spożycie Kofeiny & Linia Trendu
                      </span>
                    </div>
                    <span className={`text-[10px] font-medium ${muteTextClasses}`}>7 dni</span>
                  </div>

                  {/* Dynamic Trend Indicator Banner */}
                  <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-2xl border text-xs font-medium bg-zinc-500/5">
                    <div className="flex items-center gap-2">
                      {total7DayMg === 0 ? (
                        <>
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-emerald-500 font-bold">0 mg w tym tygodniu – Idealna Czystość! 🔥</span>
                        </>
                      ) : isDeclining ? (
                        <>
                          <TrendingDown size={15} className="text-emerald-500" />
                          <span className="text-emerald-500 font-bold">Trend Spadkowy (-{trendPercent}%) – Świetna redukcja!</span>
                        </>
                      ) : isIncreasing ? (
                        <>
                          <TrendingUp size={15} className="text-rose-500" />
                          <span className="text-rose-500 font-bold">Trend Wzrostowy (+{trendPercent}%) – Uważaj na nawyki</span>
                        </>
                      ) : (
                        <>
                          <Activity size={15} style={{ color: currentAccent.primary }} />
                          <span className="font-bold">Trend Stabilny – Stała kontrola spożycia</span>
                        </>
                      )}
                    </div>
                    <span className={`text-[10px] ${muteTextClasses}`}>Linia przerywana: Trend</span>
                  </div>
                  
                  <div className="h-[210px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartDataWithTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: theme === 'light' ? '#71717a' : '#94a3b8', fontSize: 11 }} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: theme === 'light' ? '#71717a' : '#94a3b8', fontSize: 11 }} 
                        />
                        <Tooltip 
                          cursor={{ fill: theme === 'light' ? '#f1f5f9' : '#1e293b', opacity: 0.4 }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const mgVal = payload.find(p => p.dataKey === 'mg')?.value;
                              const trendVal = payload.find(p => p.dataKey === 'trend')?.value;
                              return (
                                <div className={`text-xs py-2 px-3 rounded-xl shadow-2xl border ${modalBg}`}>
                                  <span className="font-semibold" style={{ color: currentAccent.primary }}>
                                    {payload[0].payload.fullDate}
                                  </span>
                                  <p className="mt-1 font-medium">Spożycie: {mgVal} mg</p>
                                  <p className={`text-[11px] font-medium mt-0.5 ${muteTextClasses}`}>
                                    Wartość trendu: ~{trendVal} mg
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        {/* Daily Consumption Bars */}
                        <Bar dataKey="mg" radius={[6, 6, 0, 0]} maxBarSize={32}>
                          {chartDataWithTrend.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                entry.mg === 0 
                                  ? (theme === 'light' ? '#e2e8f0' : '#27272a') 
                                  : entry.mg > 400 
                                  ? '#ef4444' 
                                  : currentAccent.primary
                              }
                            />
                          ))}
                        </Bar>
                        {/* Visual Linear Regression Trend Line */}
                        <Line 
                          type="monotone" 
                          dataKey="trend" 
                          stroke={total7DayMg === 0 ? '#10b981' : isDeclining ? '#10b981' : isIncreasing ? '#f43f5e' : currentAccent.primary} 
                          strokeWidth={2.5} 
                          strokeDasharray="4 4" 
                          dot={{ 
                            r: 3.5, 
                            strokeWidth: 2, 
                            fill: theme === 'light' ? '#ffffff' : '#0f1118',
                            stroke: total7DayMg === 0 ? '#10b981' : isDeclining ? '#10b981' : isIncreasing ? '#f43f5e' : currentAccent.primary
                          }}
                          activeDot={{ r: 5 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* NAJCZĘSTSZE PORY SPOŻYCIA (ANALIZA CZASOWA & KRYTYCZNE PUNKTY DNIA) */}
                <div className={`border rounded-3xl p-5 backdrop-blur-sm ${cardClasses}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock size={16} style={{ color: currentAccent.primary }} />
                      <h3 className="text-xs font-bold uppercase tracking-wider">
                        Najczęstsze Pory Spożycia
                      </h3>
                    </div>
                    <span className={`text-[10px] font-medium ${muteTextClasses}`}>Rytm Dobowy</span>
                  </div>
                  
                  <p className={`text-xs mb-4 ${muteTextClasses}`}>
                    Analiza historii wskazuje momenty dnia, w których najczęściej sięgasz po kofeinę, ułatwiając przełamanie nawyku.
                  </p>

                  {/* Critical Window Diagnosis Card (if entries exist) */}
                  {peakBucket ? (
                    <div className="mb-4 p-3.5 rounded-2xl border bg-orange-500/10 border-orange-500/30">
                      <div className="flex items-center gap-2 text-xs font-bold text-orange-500 mb-1">
                        <AlertCircle size={15} />
                        <span>Krytyczny Punkt Dnia: {peakBucket.label} ({peakBucket.timeRange})</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${subTextClasses}`}>
                        {peakBucket.description}
                      </p>
                      <div className="mt-2 pt-2 border-t border-orange-500/20 text-[11px] font-medium text-orange-400">
                        💡 <strong className="text-orange-300">Rekomendacja:</strong> {peakBucket.advice}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span>Brak zarejestrowanych napojów – brak wykształconych krytycznych okien czasowych!</span>
                    </div>
                  )}

                  {/* 4 Time Slots Grid / Progress Breakdown */}
                  <div className="space-y-2.5">
                    {bucketStats.map((bucket) => {
                      const IconComponent = bucket.icon;
                      const isPeak = peakBucket?.id === bucket.id && bucket.count > 0;
                      return (
                        <div 
                          key={bucket.id}
                          className={`p-3 rounded-2xl border transition-all ${innerItemBg} ${isPeak ? 'ring-1 ring-orange-500/40' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-6 h-6 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${bucket.color}20`, color: bucket.color }}
                              >
                                <IconComponent size={14} />
                              </div>
                              <div>
                                <span className="text-xs font-bold">{bucket.label}</span>
                                <span className={`text-[10px] ml-2 ${muteTextClasses}`}>({bucket.timeRange})</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold">{bucket.count}x</span>
                              <span className={`text-[10px] ml-1.5 font-medium ${muteTextClasses}`}>({bucket.mg} mg)</span>
                            </div>
                          </div>

                          {/* Mini Progress Bar */}
                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'light' ? 'bg-zinc-200' : 'bg-zinc-800'}`}>
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${bucket.percentage}%`, 
                                backgroundColor: bucket.color 
                              }}
                            />
                          </div>

                          <div className="flex justify-between items-center mt-1 text-[10px]">
                            <span className={muteTextClasses}>{bucket.percentage}% wszystkich napojów</span>
                            {isPeak && (
                              <span className="text-orange-500 font-bold uppercase tracking-wider text-[9px]">Główne Okno Ryzyka</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* History Logs */}
                <div className={`border rounded-3xl p-5 backdrop-blur-sm ${cardClasses}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Rejestr Zdarzeń
                    </span>
                    <span className={`text-xs ${muteTextClasses}`}>{logs.length} wpisów</span>
                  </div>

                  <div className="space-y-2">
                    {logs.length === 0 ? (
                      <div className={`text-center py-8 text-sm ${muteTextClasses}`}>
                        Czysto! Nie zanotowano żadnych napojów.
                      </div>
                    ) : (
                      logs.map(log => {
                        const drink = DRINKS.find(d => d.id === log.drinkId) || DRINKS[0];
                        return (
                          <div key={log.id} className={`rounded-2xl p-3 flex items-center justify-between border ${innerItemBg}`}>
                             <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${drink.color}`}>
                                  <drink.icon size={16} />
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">{drink.name}</p>
                                  <p className={`text-[11px] font-medium ${muteTextClasses}`}>
                                    {format(new Date(log.timestamp), 'd MMM, HH:mm', { locale: pl })} • {log.mg} mg
                                  </p>
                                </div>
                             </div>
                             <button 
                              onClick={() => removeLog(log.id)}
                              className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                              title="Usuń wpis"
                             >
                               <X size={15} />
                             </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </motion.div>
            )}

            {/* VIEW 3: SETTINGS (BEZ KALKULATORA OSZCZĘDNOŚCI) */}
            {view === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="px-6 space-y-5"
              >
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Ustawienia Wyglądu</h2>
                  <p className={`text-xs ${muteTextClasses}`}>Dostosuj motyw i kolor wiodący aplikacji</p>
                </div>

                {/* THEME SELECTOR (CIEMNY, SZARY, JASNY) */}
                <div className={`border rounded-3xl p-5 backdrop-blur-sm ${cardClasses}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Palette size={16} style={{ color: currentAccent.primary }} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      Motyw Wizualny
                    </h3>
                  </div>
                  <p className={`text-xs mb-4 ${muteTextClasses}`}>
                    Wybierz styl tła dopasowany do Twojego wzroku.
                  </p>

                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Dark Theme */}
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                        theme === 'dark' 
                          ? 'border-2 bg-zinc-950 text-white'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                      style={theme === 'dark' ? { borderColor: currentAccent.primary, boxShadow: `0 0 12px ${currentAccent.glow}` } : {}}
                    >
                      <Moon size={20} className={theme === 'dark' ? 'text-white' : 'text-zinc-500'} />
                      <span className="text-xs font-bold">Ciemny</span>
                    </button>

                    {/* Gray (Pośredni) Theme */}
                    <button
                      onClick={() => handleThemeChange('gray')}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                        theme === 'gray' 
                          ? 'border-2 bg-[#20222c] text-white'
                          : 'bg-[#20222c]/50 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                      style={theme === 'gray' ? { borderColor: currentAccent.primary, boxShadow: `0 0 12px ${currentAccent.glow}` } : {}}
                    >
                      <Monitor size={20} className={theme === 'gray' ? 'text-white' : 'text-slate-400'} />
                      <span className="text-xs font-bold">Szary</span>
                    </button>

                    {/* Light Theme */}
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                        theme === 'light' 
                          ? 'border-2 bg-white text-zinc-900'
                          : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900'
                      }`}
                      style={theme === 'light' ? { borderColor: currentAccent.primary, boxShadow: `0 0 12px ${currentAccent.glow}` } : {}}
                    >
                      <Sun size={20} className={theme === 'light' ? 'text-amber-500' : 'text-zinc-400'} />
                      <span className="text-xs font-bold">Jasny</span>
                    </button>
                  </div>
                </div>

                {/* ACCENT COLOR SELECTOR (KOLOR WIODĄCY) */}
                <div className={`border rounded-3xl p-5 backdrop-blur-sm ${cardClasses}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} style={{ color: currentAccent.primary }} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      Kolor Wiodący
                    </h3>
                  </div>
                  <p className={`text-xs mb-4 ${muteTextClasses}`}>
                    Kolor głównego pierścienia (Dni), podświetleń i odznak.
                  </p>

                  <div className="grid grid-cols-4 gap-2.5">
                    {Object.values(ACCENT_PALETTES).map((pal) => {
                      const isSelected = accentKey === pal.key;
                      return (
                        <button
                          key={pal.key}
                          onClick={() => handleAccentChange(pal.key)}
                          className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all relative ${
                            isSelected 
                              ? 'border-2 font-bold shadow-md' 
                              : `${innerItemBg} hover:border-zinc-500`
                          }`}
                          style={isSelected ? { borderColor: pal.primary } : {}}
                        >
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                            style={{ backgroundColor: pal.primary }}
                          >
                            {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                          </div>
                          <span className="text-[11px] truncate max-w-full">{pal.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* POWIADOMIENIA SYSTEMOWE (WEB NOTIFICATION API) */}
                <div className={`border rounded-3xl p-5 backdrop-blur-sm ${cardClasses}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bell size={16} style={{ color: currentAccent.primary }} />
                      <h3 className="text-sm font-bold uppercase tracking-wider">
                        Powiadomienia & Motywacja
                      </h3>
                    </div>
                    <span 
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        notificationPermission === 'granted'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : notificationPermission === 'denied'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {notificationPermission === 'granted' ? 'Aktywne' : notificationPermission === 'denied' ? 'Zablokowane' : 'Wymaga Zgody'}
                    </span>
                  </div>

                  <p className={`text-xs mb-4 ${muteTextClasses}`}>
                    Otrzymuj natychmiastowe powiadomienia na pulpicie/telefonie, gdy osiągniesz nowy kamień milowy lub pobijesz swój rekord długości detoksu.
                  </p>

                  <div className="space-y-2.5">
                    {notificationPermission !== 'granted' && (
                      <button
                        onClick={requestNotificationPermission}
                        className="w-full py-3 px-4 rounded-2xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
                        style={{
                          backgroundColor: currentAccent.primary,
                          boxShadow: `0 0 14px ${currentAccent.glow}`
                        }}
                      >
                        <BellRing size={16} />
                        Włącz powiadomienia w przeglądarce
                      </button>
                    )}

                    <button
                      onClick={sendTestNotification}
                      className={`w-full py-2.5 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${innerItemBg} hover:border-zinc-500`}
                    >
                      <Sparkles size={15} style={{ color: currentAccent.primary }} />
                      Wyślij testowe powiadomienie
                    </button>
                  </div>
                </div>

                {/* PWA & AKTUALIZACJE APLIKACJI (GITHUB & ANDROID) */}
                <div className={`border rounded-3xl p-5 backdrop-blur-sm ${cardClasses}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Smartphone size={18} style={{ color: currentAccent.primary }} />
                      <h3 className="text-sm font-bold uppercase tracking-wider">
                        Aplikacja PWA & Wersja
                      </h3>
                    </div>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: currentAccent.badgeBg,
                        color: currentAccent.badgeText,
                        borderColor: currentAccent.badgeBorder
                      }}
                    >
                      v{APP_VERSION}
                    </span>
                  </div>

                  <p className={`text-xs mb-4 ${muteTextClasses}`}>
                    Aplikacja jest przystosowana do instalacji na telefonach Android jako natywna aplikacja PWA (z własną ikonką) oraz działa w 100% offline.
                  </p>

                  {/* UPDATE BANNER IN SETTINGS IF NEW VERSION AVAILABLE */}
                  {updateAvailable && (
                    <div 
                      className="p-3.5 rounded-2xl border mb-3 flex flex-col gap-2"
                      style={{
                        backgroundColor: currentAccent.badgeBg,
                        borderColor: currentAccent.primary
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle size={18} style={{ color: currentAccent.primary }} className="animate-bounce" />
                        <span className="text-xs font-bold" style={{ color: currentAccent.badgeText }}>
                          Dostępna jest nowsza wersja ZeroCaff!
                        </span>
                      </div>
                      <p className={`text-[11px] ${subTextClasses}`}>
                        {serverVersionInfo?.description || "Wykryto nowszą wersję na serwerze. Kliknij poniżej, aby natychmiast zaktualizować aplikację."}
                      </p>
                      <button
                        onClick={applyUpdate}
                        className="w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                        style={{
                          backgroundColor: currentAccent.primary,
                          boxShadow: `0 0 12px ${currentAccent.glow}`
                        }}
                      >
                        <RefreshCw size={14} className="animate-spin" />
                        Zaktualizuj teraz do nowej wersji
                      </button>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {/* Check for updates button */}
                    <button
                      onClick={() => checkForUpdate(true)}
                      disabled={isCheckingUpdate}
                      className={`w-full py-2.5 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${innerItemBg} hover:border-zinc-500 disabled:opacity-50`}
                    >
                      <RefreshCw size={14} className={isCheckingUpdate ? "animate-spin" : ""} style={{ color: currentAccent.primary }} />
                      {isCheckingUpdate ? "Sprawdzanie serwera..." : "Sprawdź dostępność aktualizacji"}
                    </button>

                    {/* Install PWA Button */}
                    {!isStandalone ? (
                      <button
                        onClick={handleInstallPWA}
                        className="w-full py-2.5 px-4 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
                        style={{
                          backgroundColor: currentAccent.badgeBg,
                          borderColor: currentAccent.badgeBorder,
                          color: currentAccent.primary
                        }}
                      >
                        <Download size={14} />
                        Zainstaluj aplikację na telefonie (Android)
                      </button>
                    ) : (
                      <div className={`w-full py-2 px-3 rounded-2xl border text-[11px] font-semibold flex items-center justify-center gap-2 ${innerItemBg} text-emerald-400 border-emerald-500/20`}>
                        <CheckCircle size={14} />
                        Aplikacja działa jako zainstalowana PWA
                      </div>
                    )}

                    {/* Test Update Simulator */}
                    <button
                      onClick={() => {
                        setUpdateAvailable(true);
                        setUpdateBannerDismissed(false);
                        showToast("Włączono testowe okienko aktualizacji!");
                      }}
                      className={`w-full py-1.5 px-3 rounded-xl text-[10px] ${muteTextClasses} hover:text-zinc-300 transition-colors flex items-center justify-center gap-1.5`}
                    >
                      <Sparkles size={12} />
                      Przetestuj okienko wykrycia nowej wersji
                    </button>
                  </div>
                </div>

                {/* DANGER ZONE (RESET DATA) */}
                <div className={`border border-red-500/20 rounded-3xl p-5 backdrop-blur-sm ${cardClasses}`}>
                  <div className="flex items-center gap-2 mb-2 text-red-500">
                    <AlertTriangle size={16} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">
                      Strefa Danych
                    </h3>
                  </div>
                  <p className={`text-xs mb-4 ${muteTextClasses}`}>
                    Możesz wyczyścić historię wpisów lub zresetować aplikację do stanu początkowego.
                  </p>

                  <button
                    onClick={clearAllData}
                    className="w-full py-3 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <Trash2 size={16} />
                    Wyczyść wszystkie dane i zresetuj aplikację
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* BOTTOM NAVIGATION BAR: 2 TABS (LICZNIK / STATYSTYKI) + CENTER GLOWING PLUS BUTTON */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40">
          <div className={`px-8 h-20 flex items-center justify-around relative border-t backdrop-blur-xl transition-colors ${navBg}`}>
            {/* Tab 1: Timer */}
            <button 
              id="nav-home-btn"
              onClick={() => setView('home')} 
              className={`flex flex-col items-center gap-1 transition-colors px-4 py-2 ${
                view === 'home' 
                  ? 'font-bold' 
                  : `${muteTextClasses} hover:${subTextClasses}`
              }`}
              style={view === 'home' ? { color: currentAccent.primary } : {}}
            >
              <Home size={22} strokeWidth={view === 'home' ? 2.5 : 1.8} />
              <span className="text-[11px] uppercase tracking-wider font-bold">Licznik</span>
            </button>
            
            {/* Floating Action Button (Center Plus) */}
            <button 
              id="nav-add-btn"
              onClick={handleOpenAddModal} 
              className="w-14 h-14 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all border border-white/20 -translate-y-2"
              style={{
                backgroundColor: currentAccent.primary,
                boxShadow: `0 0 25px ${currentAccent.glow}`
              }}
              title="Zanotuj napój / Zresetuj licznik"
            >
              <Plus size={28} strokeWidth={2.5} />
            </button>

            {/* Tab 2: Stats */}
            <button 
              id="nav-stats-btn"
              onClick={() => setView('stats')} 
              className={`flex flex-col items-center gap-1 transition-colors px-4 py-2 ${
                view === 'stats' 
                  ? 'font-bold' 
                  : `${muteTextClasses} hover:${subTextClasses}`
              }`}
              style={view === 'stats' ? { color: currentAccent.primary } : {}}
            >
              <BarChart2 size={22} strokeWidth={view === 'stats' ? 2.5 : 1.8} />
              <span className="text-[11px] uppercase tracking-wider font-bold">Statystyki</span>
            </button>
          </div>
        </nav>

        {/* ADD DRINK & TIME CUSTOMIZATION MODAL */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
            >
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`w-full max-w-md border-t sm:rounded-3xl sm:border p-6 pb-10 sm:pb-6 max-h-[90vh] overflow-y-auto shadow-2xl ${modalBg}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: currentAccent.badgeBg,
                        color: currentAccent.primary,
                      }}
                    >
                      <Coffee size={16} />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Zanotuj Napój</h2>
                  </div>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${innerItemBg} hover:opacity-80 transition-opacity`}
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <p className={`text-xs mb-5 ${muteTextClasses}`}>
                  Wybierz spożyty napój. Licznik czasu bez kofeiny zostanie zresetowany od wyznaczonej godziny.
                </p>

                {/* TIME ADJUSTMENT SECTION */}
                <div className={`border rounded-2xl p-4 mb-5 ${innerItemBg}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <Clock size={14} style={{ color: currentAccent.primary }} />
                      <span>Kiedy wypito napój?</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCustomTimeOpen(!isCustomTimeOpen)}
                      className="text-[11px] font-medium underline underline-offset-2"
                      style={{ color: currentAccent.primary }}
                    >
                      {isCustomTimeOpen ? 'Ukryj edycję czasu' : 'Dodaj godzinę / Wypite wcześniej'}
                    </button>
                  </div>

                  {/* Quick offset buttons */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        const nowD = new Date();
                        setCustomTimeDate(format(nowD, 'yyyy-MM-dd'));
                        setCustomTimeHour(format(nowD, 'HH:mm'));
                        setIsCustomTimeOpen(false);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        !isCustomTimeOpen 
                          ? 'font-semibold border-transparent text-white' 
                          : `${cardClasses} hover:border-zinc-500`
                      }`}
                      style={!isCustomTimeOpen ? { backgroundColor: currentAccent.primary } : {}}
                    >
                      Teraz (przed chwilą)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTimeOffset(15)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border ${cardClasses} hover:border-zinc-500`}
                    >
                      -15 min
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTimeOffset(60)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border ${cardClasses} hover:border-zinc-500`}
                    >
                      -1 godz
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTimeOffset(120)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border ${cardClasses} hover:border-zinc-500`}
                    >
                      -2 godz
                    </button>
                  </div>

                  {/* Datetime Pickers */}
                  {isCustomTimeOpen && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-500/20"
                    >
                      <div>
                        <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${muteTextClasses}`}>
                          Data
                        </label>
                        <input
                          type="date"
                          value={customTimeDate}
                          onChange={(e) => setCustomTimeDate(e.target.value)}
                          className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${cardClasses}`}
                        />
                      </div>
                      <div>
                        <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${muteTextClasses}`}>
                          Godzina
                        </label>
                        <input
                          type="time"
                          value={customTimeHour}
                          onChange={(e) => setCustomTimeHour(e.target.value)}
                          className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${cardClasses}`}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* DRINK SELECTION LIST */}
                <div className="space-y-2.5 mb-5">
                  {DRINKS.map(drink => (
                    <button
                      key={drink.id}
                      onClick={() => addLog(drink)}
                      className={`w-full border rounded-2xl p-3.5 flex items-center justify-between transition-all text-left group ${innerItemBg} hover:border-zinc-500`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${drink.color}`}>
                          <drink.icon size={20} />
                        </div>
                        <div>
                          <p className="font-semibold group-hover:opacity-80 transition-opacity">{drink.name}</p>
                          <p className={`text-xs mt-0.5 ${muteTextClasses}`}>{drink.mg} mg kofeiny</p>
                        </div>
                      </div>
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors"
                        style={{
                          backgroundColor: currentAccent.badgeBg,
                          color: currentAccent.primary,
                          borderColor: currentAccent.badgeBorder
                        }}
                      >
                        <Plus size={18} />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-zinc-500/20">
                  <button 
                    onClick={resetTimerDirectly}
                    className={`w-full py-3 text-xs font-medium flex items-center justify-center gap-2 transition-colors ${muteTextClasses} hover:underline`}
                  >
                    <RotateCcw size={15} />
                    Tylko zresetuj timer do zera (bez dodawania napoju do historii)
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ROZBUDOWANY MODAL SZCZEGÓŁÓW KAMIENIA MILOWEGO (ROZSZERZONE INFORMACJE) */}
        <AnimatePresence>
          {selectedMilestone && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
            >
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`w-full max-w-md border-t sm:rounded-3xl sm:border p-6 pb-8 sm:pb-6 shadow-2xl relative max-h-[90vh] overflow-y-auto ${modalBg}`}
              >
                {/* Header with Icon, Name & Status */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-13 h-13 rounded-2xl flex items-center justify-center border text-xl font-black shrink-0"
                      style={{
                        backgroundColor: currentAccent.badgeBg,
                        color: currentAccent.primary,
                        borderColor: currentAccent.badgeBorder
                      }}
                    >
                      {selectedMilestone.code}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                        {selectedMilestone.phase}
                      </span>
                      <h2 className="text-xl font-bold tracking-tight">{selectedMilestone.name}</h2>
                      <span 
                        className="text-xs font-semibold"
                        style={{ color: currentAccent.primary }}
                      >
                        {selectedMilestone.benefit}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedMilestone(null)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${innerItemBg}`}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Unlocked Status Badge */}
                <div className="flex items-center justify-between text-xs mb-4 p-3 rounded-2xl border backdrop-blur-sm bg-black/20">
                  <span className={muteTextClasses}>Status etapu:</span>
                  {diffSeconds >= selectedMilestone.seconds ? (
                    <span className="font-bold flex items-center gap-1.5" style={{ color: currentAccent.primary }}>
                      <CheckCircle2 size={15} /> Zdobyte! Jesteś wolny od kofeiny
                    </span>
                  ) : (
                    <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                      <Clock size={14} /> Pozostało: {Math.ceil((selectedMilestone.seconds - diffSeconds) / 3600)} godz.
                    </span>
                  )}
                </div>

                {/* 4 DETAILED EDUCATIONAL & PHYSIOLOGICAL ACCORDIONS/BLOCKS */}
                <div className="space-y-3 mb-6">
                  
                  {/* Block 1: Co dzieje się w organizmie */}
                  <div className={`border rounded-2xl p-4 ${innerItemBg}`}>
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider">
                      <Brain size={15} style={{ color: currentAccent.primary }} />
                      <span>Fizjologia & Mózg</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${subTextClasses}`}>
                      {selectedMilestone.description}
                    </p>
                  </div>

                  {/* Block 2: Objawy & Czego się spodziewać */}
                  <div className={`border rounded-2xl p-4 ${innerItemBg}`}>
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-amber-500">
                      <Activity size={15} />
                      <span>Objawy & Odczucia</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${subTextClasses}`}>
                      {selectedMilestone.symptoms}
                    </p>
                  </div>

                  {/* Block 3: Praktyczne wskazówki & Ulga */}
                  <div className={`border rounded-2xl p-4 ${innerItemBg}`}>
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                      <Compass size={15} />
                      <span>Praktyczna Porada</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${subTextClasses}`}>
                      {selectedMilestone.tips}
                    </p>
                  </div>

                  {/* Block 4: Wzmocnienie psychologiczne */}
                  <div className={`border rounded-2xl p-4 ${innerItemBg}`}>
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                      <Sparkles size={15} />
                      <span>Korzyść Mentalna</span>
                    </div>
                    <p className={`text-xs leading-relaxed font-medium ${theme === 'light' ? 'text-zinc-800' : 'text-zinc-200'}`}>
                      &quot;{selectedMilestone.mentalBoost}&quot;
                    </p>
                  </div>

                </div>

                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
                  style={{ backgroundColor: currentAccent.primary }}
                >
                  Rozumiem, wracam do licznika
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FLOATING PWA UPDATE NOTIFICATION PROMPT */}
        <AnimatePresence>
          {updateAvailable && !updateBannerDismissed && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50 p-4 rounded-3xl border shadow-2xl backdrop-blur-xl"
              style={{
                backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.96)' : 'rgba(18, 18, 22, 0.96)',
                borderColor: currentAccent.primary,
                boxShadow: `0 10px 30px -5px ${currentAccent.glow}`
              }}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: currentAccent.badgeBg,
                    borderColor: currentAccent.badgeBorder,
                    color: currentAccent.primary
                  }}
                >
                  <RefreshCw size={20} className="animate-spin" />
                </div>
                <div className="flex-1 pr-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold tracking-tight">
                      Dostępna jest nowa wersja!
                    </h4>
                    <button 
                      onClick={() => setUpdateBannerDismissed(true)}
                      className={`p-1 rounded-full ${innerItemBg} hover:opacity-80 transition-opacity`}
                      title="Zamknij powiadomienie"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${subTextClasses}`}>
                    Na serwerze pojawiła się zaktualizowana wersja ZeroCaff. Kliknij przycisk, aby natychmiast zaktualizować aplikację.
                  </p>
                  
                  <div className="flex items-center gap-2 mt-3.5">
                    <button
                      onClick={applyUpdate}
                      className="flex-1 py-2.5 px-4 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                      style={{
                        backgroundColor: currentAccent.primary,
                        boxShadow: `0 0 14px ${currentAccent.glow}`
                      }}
                    >
                      <RotateCcw size={14} />
                      Zaktualizuj
                    </button>
                    <button
                      onClick={() => setUpdateBannerDismissed(true)}
                      className={`py-2.5 px-3.5 rounded-xl border text-xs font-semibold ${innerItemBg} hover:border-zinc-500 transition-all`}
                    >
                      Później
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PWA INSTALLATION GUIDE MODAL FOR ANDROID */}
        <AnimatePresence>
          {showInstallGuideModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`w-full max-w-md border-t sm:rounded-3xl sm:border p-6 pb-10 sm:pb-6 shadow-2xl ${modalBg}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: currentAccent.badgeBg,
                        color: currentAccent.primary,
                      }}
                    >
                      <Smartphone size={18} />
                    </div>
                    <h2 className="text-lg font-bold tracking-tight">Instalacja na Androidzie (PWA)</h2>
                  </div>
                  <button 
                    onClick={() => setShowInstallGuideModal(false)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${innerItemBg} hover:opacity-80 transition-opacity`}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl border mb-4" style={{ backgroundColor: currentAccent.badgeBg, borderColor: currentAccent.badgeBorder }}>
                  <img src={getAssetUrl('/icon-192.jpg')} alt="ZeroCaff" className="w-12 h-12 rounded-xl object-cover border" style={{ borderColor: currentAccent.primary }} />
                  <div>
                    <div className="text-xs font-bold">ZeroCaff - Wolność od Kofeiny</div>
                    <div className={`text-[11px] ${subTextClasses}`}>Aplikacja zainstaluje się z ładną ikonką na pulpicie telefonu</div>
                  </div>
                </div>

                <div className="space-y-3 mb-5 text-xs">
                  <div className={`p-3 rounded-xl border flex items-start gap-3 ${innerItemBg}`}>
                    <div className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</div>
                    <div className={subTextClasses}>Otwórz aplikację w przeglądarce <strong>Google Chrome</strong> na telefonie.</div>
                  </div>
                  <div className={`p-3 rounded-xl border flex items-start gap-3 ${innerItemBg}`}>
                    <div className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</div>
                    <div className={subTextClasses}>Kliknij ikonę <strong>menu (trzy kropki ⋮)</strong> w prawym górnym rogu.</div>
                  </div>
                  <div className={`p-3 rounded-xl border flex items-start gap-3 ${innerItemBg}`}>
                    <div className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</div>
                    <div className={subTextClasses}>Wybierz opcję <strong>&quot;Zainstaluj aplikację&quot;</strong> lub <strong>&quot;Dodaj do ekranu głównego&quot;</strong>.</div>
                  </div>
                </div>

                <button
                  onClick={() => setShowInstallGuideModal(false)}
                  className="w-full py-3 rounded-2xl text-white font-bold text-xs shadow-md transition-all active:scale-[0.98]"
                  style={{ backgroundColor: currentAccent.primary }}
                >
                  Zamknij instrukcję
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
