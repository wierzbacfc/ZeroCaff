"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Coffee, Zap, Leaf, GlassWater, Trophy, Activity,
  Plus, Minus, X, TrendingUp, TrendingDown, RotateCcw, Home, BarChart2,
  Calendar, Flame, Sparkles, CheckCircle2, Lock,
  Clock, Award, ShieldCheck, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Info,
  Settings, Palette, Sun, Moon, SunMedium, Sunset, Sunrise, CloudMoon,
  Monitor, Trash2, Check, AlertTriangle, Brain,
  Heart, Compass, ArrowRight, BatteryCharging,
  Bell, BellOff, BellRing, Target, AlertCircle,
  Download, RefreshCw, Smartphone, CheckCircle, Wifi, ArrowUpCircle, Sliders, LogOut,
  CalendarDays
} from 'lucide-react';
import { format, subDays, isSameDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// --- Types ---
type ThemeMode = 'dark' | 'gray' | 'light';
type AccentColorKey = 'orange' | 'emerald' | 'amber' | 'cyan' | 'violet' | 'rose' | 'blue';
type AddBtnStyle = 'pill' | 'frosted' | 'tab' | 'coffee' | 'cube';

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

// --- Comprehensive Milestones (Rich Early Stages + Intermediate + Long Term) ---
const MILESTONES: Milestone[] = [
  {
    id: 'm-1h',
    code: '1H',
    name: '1 Godzina',
    seconds: 1 * 3600,
    phase: 'Faza 1: Szczyt & Początek Filtracji',
    benefit: 'Hamowanie wchłaniania i szczytowy metabolizm',
    description: 'Dokładnie teraz stężenie kofeiny w Twojej krwi osiąga swoje absolutne maksimum. Cząsteczki przekroczyły już barierę krew-mózg, wymuszając nienaturalny wyrzut adrenaliny i noradrenaliny. Twoja wątroba właśnie aktywuje produkcję enzymu CYP1A2, rozpoczynając wielogodzinny proces filtrowania toksyny z krwioobiegu. To moment, w którym Twój organizm przestaje przyjmować, a zaczyna aktywnie walczyć o powrót do naturalnej homeostazy.',
    symptoms: 'Podwyższone ciśnienie krwi, przyspieszone tętno, spłycony oddech oraz sztucznie napędzona czujność maskująca prawdziwe zmęczenie.',
    tips: 'Wypij dużą szklankę wody mineralnej. Pomożesz w ten sposób nerkom, które za chwilę rozpoczną intensywne wydalanie zmetabolizowanych związków kofeiny.',
    mentalBoost: 'Twoja świadoma decyzja zaczyna procentować. Ten stymulant właśnie osiągnął swój szczyt – od tej sekundy będzie go w Tobie już tylko mniej.'
  },
  {
    id: 'm-2h',
    code: '2H',
    name: '2 Godziny',
    seconds: 2 * 3600,
    phase: 'Faza 1: Początek Eliminacji',
    benefit: 'Spadek szczytowego stężenia i praca enzymów',
    description: 'Enzym cytochrom P450 1A2 intensywnie rozbija cząsteczki kofeiny na trzy kluczowe metabolity: paraksantynę (zwiększającą rozkład tłuszczu), teobrominę (rozszerzającą naczynia) i teofilinę (rozluźniającą mięśnie gładkie). Mózg powoli orientuje się, że dopływ zewnętrznego stymulanta został odcięty. Blokada receptorów adenozynowych powoli ulega poluzowaniu, a układ nerwowy zaczyna obniżać częstotliwość fałszywych alarmów stresowych.',
    symptoms: 'Pierwsze subtelne uspokojenie pulsu. Możesz odczuwać delikatny spadek euforycznego "haju" i powolny powrót do realistycznego odczuwania poziomu własnej energii.',
    tips: 'Zrób 5 głębokich oddechów przeponowych (wdech nosem 4s, wydech ustami 6s). To zasygnalizuje nerwowi błędnemu, że zagrożenie minęło i można wyłączyć tryb "walcz lub uciekaj".',
    mentalBoost: 'System oczyszczania działa na pełnych obrotach. Pozwalasz swojemu ciału na naturalną, biologiczną detoksykację.'
  },
  {
    id: 'm-4h',
    code: '4H',
    name: '4 Godziny',
    seconds: 4 * 3600,
    phase: 'Faza 1: Uwalnianie Receptorów',
    benefit: 'Demaskowanie naturalnego zmęczenia',
    description: 'Uwalnianie receptorów A1 i A2A w korze mózgowej wkracza w decydującą fazę. Kofeina, która do tej pory udawała adenozynę (kluczowy neuroprzekaźnik snu), zsuwa się z receptorów. Teraz skumulowana adenozyna – naturalny biochemiczny wskaźnik zmęczenia – gwałtownie dociera do neuronów. Mózg w końcu otrzymuje prawdziwą, niezakłóconą informację o tym, ile energii faktycznie posiada Twoje ciało.',
    symptoms: 'Odtajnienie zmęczenia: może pojawić się nagła, wyraźna senność, ziewanie, spadek motywacji oraz automatyczna, nawykowa chęć pójścia po kolejną kawę (tzw. zjazd kofeinowy).',
    tips: 'Nie daj się oszukać własnemu mózgowi – to tylko nawyk dopaminowy. Zamiast sięgać po kubek, wstań, przeciągnij się, przewietrz pokój lub zrób 3 minuty szybkiego spaceru.',
    mentalBoost: 'Czujesz zmęczenie? To świetnie! To dowód na to, że Twoja naturalna biologia wreszcie odzyskuje głos. Jesteś silniejszy niż ten chwilowy spadek formy.'
  },
  {
    id: 'm-6h',
    code: '6H',
    name: '6 Godzin',
    seconds: 6 * 3600,
    phase: 'Faza 1: Okres Półtrwania (T½)',
    benefit: '50% stymulanta bezpowrotnie usunięte',
    description: 'Osiągasz kluczowy biologiczny kamień milowy: okres półtrwania (half-life) kofeiny. Oznacza to, że wątrobie udało się przefiltrować i zneutralizować dokładnie połowę dawki. Twoje naczynia krwionośne w mózgu, dotychczas nienaturalnie zwężone, zaczynają się rozszerzać, przywracając prawidłowy, swobodny przepływ krwi i tlenu do tkanki nerwowej. Wyrzut kortyzolu (hormonu stresu) wyraźnie zwalnia.',
    symptoms: 'Brak sztucznego napięcia, możliwe delikatne "mgliste" myślenie (brain fog) lub uczucie ociężałości, zwłaszcza u osób pijących regularnie duże dawki.',
    tips: 'To idealny moment na nawodnienie i lekką przekąskę bogatą w magnez (np. migdały, gorzka czekolada 90%), co pomoże ustabilizować poziom cukru we krwi.',
    mentalBoost: 'Półmetek pierwszego starcia za Tobą! Organizm wykonał gigantyczną pracę. Połowa toksyny już nigdy nie wróci do Twojego układu nerwowego.'
  },
  {
    id: 'm-8h',
    code: '8H',
    name: '8 Godzin',
    seconds: 8 * 3600,
    phase: 'Faza 1: Równowaga Krążenia',
    benefit: 'Normalizacja układu sercowo-naczyniowego',
    description: 'Układ współczulny przechodzi z trybu ciągłego alertu w stan spoczynku. Ciśnienie tętnicze krwi stabilizuje się, a tętno spoczynkowe obniża się do naturalnego, bezpiecznego dla serca poziomu. Nadnercza przestają być stymulowane do ciągłej, wyczerpującej produkcji adrenaliny. Dbasz właśnie o żywotność i zdrowie swojego mięśnia sercowego, zdejmując z niego niewidzialny ciężar.',
    symptoms: 'Wyraźne poczucie fizycznego odprężenia mięśni (szczególnie karku, barków i żuchwy), głębszy i wolniejszy oddech, czasem umiarkowany ból głowy związany z rozszerzaniem naczyń.',
    tips: 'Jeśli odczuwasz napięciowy ból głowy, unikaj tabletek z kofeiną. Wypij ciepły napar z melisy lub rumianku i wykonaj masaż skroni.',
    mentalBoost: 'Twoje serce bije teraz swoim własnym, miarowym rytmem, bez żadnego chemicznego poganiania. To brzmienie prawdziwego zdrowia.'
  },
  {
    id: 'm-12h',
    code: '12H',
    name: '12 Godzin',
    seconds: 12 * 3600,
    phase: 'Faza 2: Głębokie Oczyszczanie',
    benefit: 'Uwolnienie szyszynki i start produkcji melatoniny',
    description: 'Poziom kofeiny w Twojej krwi spadł do ułamkowych, śladowych wartości (ok. 25% dawki początkowej). Mózgowy ośrodek snu – szyszynka – może wreszcie bez przeszkód i opóźnień wydzielać melatoninę. Ten kluczowy hormon nie tylko reguluje rytm dobowy, ale też jest potężnym antyoksydantem naprawiającym DNA podczas snu. Kofeina już nie blokuje jego produkcji.',
    symptoms: 'Naturalna, głęboka senność wieczorna, wolna od sztucznego niepokoju i gonitwy myśli (racing thoughts), która często towarzyszy zasypianiu po kawie.',
    tips: 'Przygotuj się na doskonały sen. Zredukuj światło niebieskie, wywietrz sypialnię i zrezygnuj z wpatrywania się w ekrany na godzinę przed snem.',
    mentalBoost: 'Dziś w nocy Twój mózg doświadczy pierwszego od bardzo dawna nieskażonego, głęboko regenerującego snu. Rano obudzisz się silniejszy.'
  },
  {
    id: 'm-24h',
    code: '24H',
    name: '1 Doba',
    seconds: 24 * 3600,
    phase: 'Faza 2: Szczyt Odstawienia',
    benefit: '100% kofeiny wyeliminowane z organizmu',
    description: 'To historyczny moment. Po 24 godzinach stężenie kofeiny w Twoim ciele wynosi absolutne ZERO. Organizm jest całkowicie wolny od stymulanta, ale układ nerwowy musi teraz na nowo nauczyć się funkcjonować bez "chemicznych kul". Receptory w mózgu, dotąd otępiane regularnymi dawkami, wykazują ekstremalną nadwrażliwość na adenozynę. Rozpoczyna się proces neuroadaptacji.',
    symptoms: 'Możesz odczuwać apogeum objawów odstawiennych: pulsujące bóle głowy (spowodowane drastycznym rozszerzeniem naczyń krwionośnych w mózgu), drażliwość, wahania nastroju, sztywność mięśni i silną chęć (craving) wypicia kawy.',
    tips: 'Pij ogromne ilości wody, stosuj zimne okłady na kark i daj sobie absolutne prawo do odpoczynku. Jeśli możesz, utnij sobie 20-minutową drzemkę.',
    mentalBoost: 'Przetrwałeś najtrudniejsze 24 godziny! Ból głowy, który czujesz, to fizyczny dowód na to, że Twój mózg właśnie się leczy i przebudowuje swoje struktury.'
  },
  {
    id: 'm-48h',
    code: '48H',
    name: '2 Doby',
    seconds: 48 * 3600,
    phase: 'Faza 3: Przebudowa Receptorów',
    benefit: 'Inicjacja neuroplastyczności mózgu',
    description: 'Rozpoczyna się fascynujący biologiczny proces: "down-regulation". Ponieważ nie dostarczasz kofeiny, mózg zauważa, że posiada zbyt dużą ilość receptorów adenozynowych (wytworzonych wcześniej w ramach obrony przed kofeiną). Organizmu używa neuroplastyczności, by dosłownie zdemontować nadmiar tych receptorów. Twoja chemia mózgu wraca do fabrycznych ustawień.',
    symptoms: 'Utrzymujące się ogólne osłabienie i spadek nastroju z powodu chwilowego niedoboru dopaminy. Ból głowy zazwyczaj zaczyna tracić na intensywności.',
    tips: 'Aktywność fizyczna to Twój największy sprzymierzeniec. Nawet 15 minut lekkiego truchtu lub jogi wyzwoli endorfiny i naturalnie podniesie poziom dopaminy.',
    mentalBoost: 'Twój mózg przeprowadza teraz zaawansowaną reinżynierię własnej budowy. Jesteś w połowie drogi przez najtrudniejszy fizyczny etap odstawienia.'
  },
  {
    id: 'm-3d',
    code: '3D',
    name: '3 Doby',
    seconds: 3 * 24 * 3600,
    phase: 'Faza 3: Fizyczna Wolność',
    benefit: 'Ustabilizowanie przepływu krwi w mózgu',
    description: 'Po 72 godzinach odstawienia przepływ krwi i tlenu w naczyniach mózgowych wraca do normy. Najgorsze, ostre fizyczne objawy odstawienia (jak silne migreny czy mdłości) przeważnie ustępują. Twój układ nagrody (szlak mezolimbiczny) zaczyna powoli przypominać sobie, jak czerpać satysfakcję i dopaminę z naturalnych bodźców, a nie z farmakologicznego wymuszenia.',
    symptoms: 'Wygasanie bólu głowy. Zamiast fizycznego dyskomfortu może pojawić się pustka psychologiczna lub brak poczucia "porannego rytuału".',
    tips: 'Zastąp nawyk. Zamiast kawy, przygotuj rano yerba mate (jeśli schodzisz stopniowo), matchę, bezkofeinową kawę zbożową lub po prostu ciepłą wodę z cytryną i imbirem.',
    mentalBoost: 'Gratulacje! Najgorszy fizyczny ból jest już za Tobą. Pokonałeś chemiczne uzależnienie. Teraz zaczyna się praca nad nawykami i psychologią.'
  },
  {
    id: 'm-5d',
    code: '5D',
    name: '5 Dni',
    seconds: 5 * 24 * 3600,
    phase: 'Faza 4: Powrót Naturalnej Energii',
    benefit: 'Głęboka regeneracja nadnerczy',
    description: 'Twoje nadnercza, które przez lata były zmuszane do nieustannego wypluwania kortyzolu i adrenaliny pod dyktando kofeiny, w końcu przechodzą w fazę głębokiej regeneracji. Zauważasz, że Twoja krzywa energetyczna w ciągu dnia staje się znacznie bardziej płaska i stabilna. Unikasz drastycznych popołudniowych spadków mocy (afternoon crash). Budzisz się z bardziej autentycznym poziomem energii.',
    symptoms: 'Pojawiają się pierwsze momenty spontanicznej, czystej energii, niezależnej od stymulantów. Sen staje się wyczuwalnie głębszy i bardziej zwarty.',
    tips: 'Zwróć uwagę na to, jak czujesz się około godziny 14:00-15:00. Zauważ, że dawny, obezwładniający zjazd energetyczny zniknął lub znacznie zelżał.',
    mentalBoost: 'Odkrywasz swoją prawdziwą, rzetelną energię bazową. Nie potrzebujesz już pożyczać energii z przyszłości z lichwiarskim procentem.'
  },
  {
    id: 'm-1w',
    code: '1W',
    name: '1 Tydzień',
    seconds: 7 * 24 * 3600,
    phase: 'Faza 4: Reset Snu (REM & Deep Sleep)',
    benefit: 'Drastyczna poprawa architektury snu',
    description: 'To przełomowy tydzień. Analizy EEG osób po odstawieniu kofeiny wykazują w tym czasie znaczący wzrost udziału fazy snu głębokiego (Slow-Wave Sleep) w całkowitym czasie spoczynku. To właśnie w tej fazie dochodzi do odnowy komórkowej, wzmacniania układu odpornościowego i konsolidacji pamięci. Twój rytm okołodobowy (circadian rhythm) został niemal całkowicie zresetowany.',
    symptoms: 'Lepsze samopoczucie rano, rzadsze wybudzenia w nocy, zwiększona klarowność umysłu (brak tzw. brain fog) oraz stabilniejszy nastrój w ciągu dnia.',
    tips: 'To świetny czas, by zoptymalizować swoją poranną rutynę. Wykorzystaj świeżość umysłu na medytację, czytanie lub poranny trening zamiast bezmyślnego parzenia kawy.',
    mentalBoost: 'Jesteś wolny od tygodnia. Udowodniłeś sobie, że jesteś w stanie przełamać jeden z najsilniejszych kulturowych i chemicznych nawyków świata.'
  },
  {
    id: 'm-2w',
    code: '2W',
    name: '2 Tygodnie',
    seconds: 14 * 24 * 3600,
    phase: 'Faza 5: Stabilizacja Nastroju',
    benefit: 'Homeostaza dopaminowa i uwrażliwienie receptorów',
    description: 'Po 14 dniach układ nagrody w mózgu wraca do pełnej, naturalnej wrażliwości. Receptory dopaminowe (D2), które mogły być przytępione przez chroniczne spożycie stymulantów, odzyskują swoją pierwotną gęstość. Oznacza to, że zaczynasz czerpać znacznie więcej radości z małych, codziennych rzeczy. Zmniejszają się też stany lękowe, nerwowość i natłok myśli (overthinking), które kofeina potajemnie napędzała.',
    symptoms: 'Znaczący spadek ogólnego poziomu niepokoju (anxiety), wyższa odporność na stresujące sytuacje w pracy, głęboki, nieprzerwany sen i stabilna produktywność.',
    tips: 'Nagródź się za ten ogromny sukces. Zafunduj sobie wyjście do sauny, dobrą kolację lub nową książkę – Twój mózg jest gotowy przyjąć czystą, zdrową dopaminę z tych źródeł.',
    mentalBoost: 'To jest właśnie ten spokój umysłu, którego być może szukałeś latami w innych miejscach, a który był blokowany przez niewinny, codzienny napój.'
  },
  {
    id: 'm-3w',
    code: '3W',
    name: '3 Tygodnie',
    seconds: 21 * 24 * 3600,
    phase: 'Faza 5: Przebudowa Nawyków',
    benefit: 'Ugruntowanie nowych ścieżek neuronalnych',
    description: 'Neurobiolodzy twierdzą, że potrzeba około 21 dni, aby nowy wzorzec zachowania zaczął formować trwałe ścieżki neuronalne (choć pełny proces zajmuje dłużej). Poranny rytuał bez kawy nie wydaje się już dziwny czy brakujący. Twój układ pokarmowy (mikrobiom jelitowy) i żołądek również dziękują Ci za brak zakwaszającego i drażniącego uderzenia z samego rana. Przyswajanie minerałów (wapń, żelazo, magnez) znacząco wzrosło.',
    symptoms: 'Brak jakiejkolwiek fizycznej chęci na kofeinę. Zwiększona jasność umysłu utrzymująca się równo przez cały dzień roboczy.',
    tips: 'Bądź czujny w sytuacjach wyjątkowo stresujących lub przy dużej ilości pracy – to jedyne momenty, gdy stary nawyk psychologiczny może jeszcze cicho zapukać.',
    mentalBoost: 'Stałeś się mistrzem własnej fizjologii. Trzy tygodnie pełnej wolności zbudowały potężny fundament pod zmianę całego stylu życia.'
  },
  {
    id: 'm-1m',
    code: '1M',
    name: '1 Miesiąc',
    seconds: 30 * 24 * 3600,
    phase: 'Faza 6: Kompletna Zmiana Paradygmatu',
    benefit: 'Całkowity reset metaboliczny i psychologiczny',
    description: '30 dni wolności. Jesteś na poziomie osiągalnym dla zaledwie ułamka promila społeczeństwa żyjącego w kulturze napędzanej kofeiną. Osiągnąłeś pełen reset: Twoja kora przedczołowa pracuje płynnie, bez wymuszonych zrywów. Układ limbiczny jest spokojny, a nadnercza w pełni zregenerowane. Twoje ciało wie już doskonale, jak samodzielnie wytwarzać energię ATP bez pomocy oszusta z zewnątrz. Stałeś się osobą naturalnie energiczną.',
    symptoms: 'Doskonała jakość snu, budzenie się z naturalną energią bez budzika, głęboki spokój wewnętrzny, znacząca redukcja stanów zapalnych w organizmie, zauważalnie lepsza kondycja cery (dzięki optymalnemu nawodnieniu i lepszemu snowi).',
    tips: 'Jesteś inspiracją. Podziel się swoim doświadczeniem z innymi, ale pamiętaj – nie obniżaj gardy, jedno "wyjątkowe" espresso może ponownie obudzić dawne ścieżki nałogu.',
    mentalBoost: 'To jest absolutne zwycięstwo. Wygrałeś wolność, żelazne zdrowie i niezachwiany, krystaliczny spokój umysłu. Ciesz się swoim nowym, niesamowitym życiem!'
  }
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
  const [addBtnStyle, setAddBtnStyle] = useState<AddBtnStyle>('pill'); // DEFAULT PILL DESIGN

  // App Data State
  const [logs, setLogs] = useState<DrinkLog[]>([]);
  const [lastIntake, setLastIntake] = useState<number>(Date.now() - 38 * 3600 * 1000);
  const [now, setNow] = useState<number>(Date.now());
  
  // Chart View State (Daily 60 Days vs Weekly)
  const [chartViewMode, setChartViewMode] = useState<'daily' | 'weekly'>('daily');
  const dailyChartScrollRef = useRef<HTMLDivElement>(null);

  // Quick Past Days Calendar Filler State (60 Days Modal)
  const [quickFillDrinkId, setQuickFillDrinkId] = useState<string>('coffee');
  const [showQuickFillModal, setShowQuickFillModal] = useState<boolean>(false);
  const [quickFillSortOrder, setQuickFillSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState<boolean>(true);
  const quickFillScrollRef = useRef<HTMLDivElement>(null);

  // Modals & Sheets
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false);

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

  // Milestones Collapsed / Expanded View State (Zwijana do 2 rzędów)
  const [isMilestonesCollapsed, setIsMilestonesCollapsed] = useState<boolean>(true);

  // Active hovered ring for tooltip
  const [activeRingTooltip, setActiveRingTooltip] = useState<'days' | 'hours' | 'minutes' | 'seconds' | null>(null);
  const [ringTooltipPos, setRingTooltipPos] = useState<{x: number, y: number}>({ x: 0, y: 0 });

  // Chart drag to scroll
  const isDraggingChart = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleChartMouseDown = (e: React.MouseEvent) => {
    isDraggingChart.current = true;
    startX.current = e.pageX - (dailyChartScrollRef.current?.offsetLeft || 0);
    scrollLeft.current = dailyChartScrollRef.current?.scrollLeft || 0;
  };

  const handleChartMouseLeave = () => {
    isDraggingChart.current = false;
  };

  const handleChartMouseUp = () => {
    isDraggingChart.current = false;
  };

  const handleChartMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingChart.current) return;
    e.preventDefault();
    const x = e.pageX - (dailyChartScrollRef.current?.offsetLeft || 0);
    const walk = (x - startX.current) * 2; // scroll speed multiplier
    if (dailyChartScrollRef.current) {
      dailyChartScrollRef.current.scrollLeft = scrollLeft.current - walk;
    }
  };

  const handleRingInteraction = (e: React.MouseEvent | React.TouchEvent, ring: 'days' | 'hours' | 'minutes' | 'seconds') => {
    setActiveRingTooltip(ring);
    let clientX, clientY;
    if ('touches' in e && (e as React.TouchEvent).touches.length > 0) {
      clientX = (e as React.TouchEvent).touches[0].clientX;
      clientY = (e as React.TouchEvent).touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    } else {
      return;
    }
    setRingTooltipPos({ x: clientX, y: clientY });
  };

  const handleRingLeave = () => {
    setActiveRingTooltip(null);
  };

  const currentAccent = ACCENT_PALETTES[accentKey] || ACCENT_PALETTES.orange;

  // Live ref to synchronize with hardware / system Back button (popstate)
  const navStateRef = useRef({
    view,
    showAddModal,
    selectedMilestone,
    showInstallGuideModal,
    showExitConfirmModal,
  });

  useEffect(() => {
    navStateRef.current = {
      view,
      showAddModal,
      selectedMilestone,
      showInstallGuideModal,
      showExitConfirmModal,
    };
  }, [view, showAddModal, selectedMilestone, showInstallGuideModal, showExitConfirmModal]);

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
    const savedBtnStyle = localStorage.getItem('zerocaff_add_btn_style') as AddBtnStyle | null;
    if (savedBtnStyle && ['pill', 'frosted', 'tab', 'coffee', 'cube'].includes(savedBtnStyle)) {
      setAddBtnStyle(savedBtnStyle);
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

  // Auto-scroll 60-day daily chart to today (right side) when viewing stats
  useEffect(() => {
    if (view === 'stats' && chartViewMode === 'daily') {
      const timer = setTimeout(() => {
        if (dailyChartScrollRef.current) {
          dailyChartScrollRef.current.scrollTo({
            left: dailyChartScrollRef.current.scrollWidth,
            behavior: 'smooth'
          });
        }
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [view, chartViewMode]);

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

    // Hardware / System Back Button & Gesture Navigation (Android / PWA popstate)
    window.history.replaceState({ screen: 'home' }, '');

    const handlePopState = () => {
      const state = navStateRef.current;

      // 1. If Exit Confirm Modal is open -> close it
      if (state.showExitConfirmModal) {
        setShowExitConfirmModal(false);
        return;
      }

      // 2. If Install Guide Modal is open -> close it
      if (state.showInstallGuideModal) {
        setShowInstallGuideModal(false);
        return;
      }

      // 3. If Milestone Detail Modal is open -> close it
      if (state.selectedMilestone) {
        setSelectedMilestone(null);
        return;
      }

      // 4. If Add Drink Modal is open -> close it
      if (state.showAddModal) {
        setShowAddModal(false);
        return;
      }

      // 5. If in subview ('stats' or 'settings') -> navigate back to 'home'
      if (state.view !== 'home') {
        setView('home');
        return;
      }

      // 6. If already on 'home' with no open modals -> show Exit confirmation prompt
      // Push history state back so the browser stays in the app and shows the confirm dialog
      window.history.pushState({ screen: 'home' }, '');
      setShowExitConfirmModal(true);
    };

    window.addEventListener('popstate', handlePopState);

    // Check for updates on mount and on window focus
    checkForUpdate(false);
    const interval = setInterval(() => checkForUpdate(false), 5 * 60 * 1000);
    const onFocus = () => checkForUpdate(false);
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, []);

  // Robust Cross-Platform Notification Helper (Mobile PWA & Desktop)
  const triggerSystemNotification = async (title: string, options?: NotificationOptions) => {
    if (typeof window === 'undefined') return;

    // Haptic vibration feedback for mobile devices
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([120, 60, 120]);
      } catch {}
    }

    const fullOptions: NotificationOptions & { renotify?: boolean } = {
      icon: getAssetUrl('/icon-192.jpg'),
      badge: getAssetUrl('/icon-192.jpg'),
      body: options?.body || '',
      tag: options?.tag || 'zerocaff-notif',
      silent: false,
      ...options
    };

    let delivered = false;

    // Method A: Mobile ServiceWorker registration (Required on Android Chrome & Mobile PWAs)
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && 'showNotification' in reg) {
          await reg.showNotification(title, fullOptions);
          delivered = true;
        }
      } catch (swErr) {
        console.warn('[SW Notification error, falling back]', swErr);
      }
    }

    // Method B: Desktop Notification constructor fallback
    if (!delivered && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, fullOptions);
        delivered = true;
      } catch (nErr) {
        console.warn('[Notification constructor fallback error]', nErr);
      }
    }

    return delivered;
  };

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
        await triggerSystemNotification("ZeroCaff: Powiadomienia Aktywne! 🔔", {
          body: "Będziesz otrzymywać powiadomienia o nowych kamieniach milowych i osobistych rekordach.",
          tag: 'zerocaff-welcome'
        });
      } else if (permission === 'denied') {
        showToast("Powiadomienia zostały zablokowane w ustawieniach przeglądarki.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendTestNotification = async () => {
    if (notificationPermission !== 'granted') {
      await requestNotificationPermission();
      return;
    }
    try {
      const sent = await triggerSystemNotification("ZeroCaff: Test Powiadomień 🚀", {
        body: `Twój aktualny czas wolności od kofeiny: ${days}d ${hours}h ${minutes}m. Aplikacja czuwa nad Twoim detoksem!`,
        tag: 'zerocaff-test'
      });
      showToast("Wysłano testowe powiadomienie!");
    } catch (err) {
      console.error(err);
      showToast("Wysłano testowe powiadomienie!");
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

  // Navigation handlers with History integration for System Back Button
  const navigateToView = (newView: 'home' | 'stats' | 'settings') => {
    if (view !== newView) {
      if (typeof window !== 'undefined') {
        window.history.pushState({ screen: newView }, '');
      }
      setView(newView);
    }
  };

  // Open add modal initialized with current date/time with history entry
  const handleOpenAddModal = () => {
    const currentDate = new Date();
    setCustomTimeDate(format(currentDate, 'yyyy-MM-dd'));
    setCustomTimeHour(format(currentDate, 'HH:mm'));
    setIsCustomTimeOpen(false);
    if (typeof window !== 'undefined') {
      window.history.pushState({ screen: 'add-modal' }, '');
    }
    setShowAddModal(true);
  };

  const handleOpenMilestone = (milestone: Milestone) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ screen: 'milestone-modal' }, '');
    }
    setSelectedMilestone(milestone);
  };

  const handleOpenInstallGuide = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ screen: 'install-guide-modal' }, '');
    }
    setShowInstallGuideModal(true);
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

  // Quick Past Days (60 Days) Calendar Filler Handlers
  const addDrinkToDate = (targetDate: Date, drinkId?: string) => {
    const selectedDrink = DRINKS.find(d => d.id === (drinkId || quickFillDrinkId)) || DRINKS[0];
    const logDate = new Date(targetDate);
    const isTargetToday = isSameDay(logDate, new Date());
    if (isTargetToday) {
      logDate.setTime(Date.now());
    } else {
      logDate.setHours(10, 0, 0, 0);
    }
    const logTimestamp = logDate.getTime();

    const newLog: DrinkLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: logTimestamp,
      drinkId: selectedDrink.id,
      mg: selectedDrink.mg,
    };

    const newLogs = [newLog, ...logs];
    setLogs(newLogs);
    localStorage.setItem('zerocaff_logs', JSON.stringify(newLogs));

    if (logTimestamp >= lastIntake || logs.length === 0) {
      const latest = Math.max(...newLogs.map(l => l.timestamp));
      setLastIntake(latest);
      localStorage.setItem('zerocaff_last_intake', latest.toString());
    }
    showToast(`Dodano: ${selectedDrink.name} na dzień ${format(targetDate, 'dd.MM.yyyy')}`);
  };

  const removeDrinkFromDate = (targetDate: Date) => {
    const dayLogs = logs.filter(l => isSameDay(new Date(l.timestamp), targetDate));
    if (dayLogs.length === 0) return;

    const logToRemove = [...dayLogs].sort((a, b) => b.timestamp - a.timestamp)[0];
    const newLogs = logs.filter(l => l.id !== logToRemove.id);
    setLogs(newLogs);
    localStorage.setItem('zerocaff_logs', JSON.stringify(newLogs));

    if (newLogs.length > 0) {
      const latest = Math.max(...newLogs.map(l => l.timestamp));
      setLastIntake(latest);
      localStorage.setItem('zerocaff_last_intake', latest.toString());
    } else {
      const resetTime = Date.now() - 38 * 3600 * 1000;
      setLastIntake(resetTime);
      localStorage.setItem('zerocaff_last_intake', resetTime.toString());
    }
    showToast(`Usunięto napój z dnia ${format(targetDate, 'dd.MM.yyyy')}`);
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
        triggerSystemNotification(`ZeroCaff: Nowy Kamień Milowy! 🏆 (${latestAchieved.code})`, {
          body: `Gratulacje! Osiągnąłeś etap: ${latestAchieved.name}. ${latestAchieved.benefit}`,
          tag: `milestone-${latestAchieved.id}`
        });
        localStorage.setItem('zerocaff_last_notified_milestone', latestAchieved.id);
      }
    }

    // 2. Check personal record streak (every full 24h milestone reached in streak)
    const currentStreakHours = Math.floor(diffSeconds / 3600);
    const lastNotifiedStreakHours = parseInt(localStorage.getItem('zerocaff_last_notified_streak_h') || '0', 10);
    
    if (currentStreakHours >= 24 && currentStreakHours >= lastNotifiedStreakHours + 24) {
      const streakDays = Math.floor(currentStreakHours / 24);
      triggerSystemNotification(`ZeroCaff: Nowy Rekord Detoksu! 🔥 (${streakDays} dni)`, {
        body: `Twój ciąg czystości trwa już ${streakDays} dni (${currentStreakHours}h). Twój organizm bije rekord regeneracji!`,
        tag: `streak-${streakDays}`
      });
      localStorage.setItem('zerocaff_last_notified_streak_h', currentStreakHours.toString());
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
  // Ring 4 (Seconds): 0-60s
  const secondsProgress = Math.min(100, (seconds / 60) * 100);

  // Thumb position calculations
  const calcThumbPos = (progress: number, radius: number) => {
    const angleRad = (progress * 3.6 - 90) * (Math.PI / 180);
    return {
      x: 150 + radius * Math.cos(angleRad),
      y: 150 + radius * Math.sin(angleRad)
    };
  };
  const daysPos = calcThumbPos(daysCycleProgress, 134);
  const hoursPos = calcThumbPos(hoursProgress, 116);
  const minutesPos = calcThumbPos(minutesProgress, 98);

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

  // --- Stats Calculations: 60-Day Daily Chart with Linear Regression ---
  const DAILY_DAYS_COUNT = 60;
  const chartData60 = Array.from({ length: DAILY_DAYS_COUNT }).map((_, i) => {
    const date = subDays(now, (DAILY_DAYS_COUNT - 1) - i);
    const dayLogs = logs.filter(l => isSameDay(new Date(l.timestamp), date));
    const totalMg = dayLogs.reduce((sum, l) => sum + l.mg, 0);
    const drinksDetail = dayLogs.map(l => {
      const drink = DRINKS.find(d => d.id === l.drinkId);
      return `${drink?.name || 'Napój'} (${l.mg} mg)`;
    });
    const daysAgo = (DAILY_DAYS_COUNT - 1) - i;
    let relativeLabel = '';
    if (daysAgo === 0) relativeLabel = 'DZIŚ';
    else if (daysAgo === 1) relativeLabel = 'WCZORAJ';
    else if (daysAgo === 2) relativeLabel = '2 DNI TEMU';
    else relativeLabel = format(date, 'EEE', { locale: pl }).toUpperCase();

    return {
      date,
      name: format(date, 'd MMM', { locale: pl }),
      dayAbbr: format(date, 'EEE', { locale: pl }),
      fullDate: format(date, 'EEEE, d MMMM yyyy', { locale: pl }),
      shortDate: format(date, 'dd.MM'),
      relativeLabel,
      daysAgo,
      mg: totalMg,
      drinksCount: dayLogs.length,
      drinksDetail,
      dayLogs,
      isToday: i === (DAILY_DAYS_COUNT - 1),
    };
  });

  // Linear Regression for 60-Day Daily Trendline
  const nPoints60 = chartData60.length;
  const xMean60 = (nPoints60 - 1) / 2;
  const yMean60 = chartData60.reduce((sum, d) => sum + d.mg, 0) / nPoints60;
  let numTrend60 = 0;
  let denTrend60 = 0;
  chartData60.forEach((d, i) => {
    numTrend60 += (i - xMean60) * (d.mg - yMean60);
    denTrend60 += Math.pow(i - xMean60, 2);
  });
  const trendSlope60 = denTrend60 === 0 ? 0 : numTrend60 / denTrend60;
  const trendIntercept60 = yMean60 - trendSlope60 * xMean60;

  const chartData60WithTrend = chartData60.map((d, i) => ({
    ...d,
    trend: Math.max(0, Math.round(trendSlope60 * i + trendIntercept60)),
  }));

  const startTrendVal60 = Math.max(0, Math.round(trendIntercept60));
  const endTrendVal60 = Math.max(0, Math.round(trendSlope60 * (DAILY_DAYS_COUNT - 1) + trendIntercept60));
  const total60DayMg = chartData60.reduce((sum, d) => sum + d.mg, 0);
  const cleanDays60 = chartData60.filter(d => d.mg === 0).length;
  const avgDailyMg60 = Math.round(total60DayMg / DAILY_DAYS_COUNT);
  const isDeclining60 = trendSlope60 < -0.3;
  const isIncreasing60 = trendSlope60 > 0.3;
  const trendPercent60 = startTrendVal60 > 0 
    ? Math.round(Math.abs((endTrendVal60 - startTrendVal60) / startTrendVal60) * 100)
    : 0;

  // --- Stats Calculations: 12-Week Weekly Chart with Aggregation ---
  const WEEKS_COUNT = 12;
  const weeklyChartData = Array.from({ length: WEEKS_COUNT }).map((_, i) => {
    const daysAgoEnd = (WEEKS_COUNT - 1 - i) * 7;
    const daysAgoStart = daysAgoEnd + 6;
    const startDate = subDays(now, daysAgoStart);
    const endDate = subDays(now, daysAgoEnd);
    
    const weekLogs = logs.filter(l => {
      const logDate = new Date(l.timestamp);
      const startMs = new Date(startDate).setHours(0, 0, 0, 0);
      const endMs = new Date(endDate).setHours(23, 59, 59, 999);
      return logDate.getTime() >= startMs && logDate.getTime() <= endMs;
    });

    const totalMg = weekLogs.reduce((sum, l) => sum + l.mg, 0);
    const avgDaily = Math.round(totalMg / 7);

    // Count clean days in this week
    let cleanDays = 0;
    for (let d = 0; d < 7; d++) {
      const dayDate = subDays(endDate, d);
      const hasLog = logs.some(l => isSameDay(new Date(l.timestamp), dayDate));
      if (!hasLog) cleanDays++;
    }

    const isCurrentWeek = i === WEEKS_COUNT - 1;
    const label = isCurrentWeek 
      ? 'Ten tydz.' 
      : `${format(startDate, 'd.MM')}–${format(endDate, 'd.MM')}`;

    return {
      name: label,
      fullDate: `${format(startDate, 'd MMMM', { locale: pl })} – ${format(endDate, 'd MMMM yyyy', { locale: pl })}`,
      mg: totalMg,
      avgDaily,
      drinksCount: weekLogs.length,
      cleanDays,
      isCurrentWeek,
    };
  });

  // Linear Regression for Weekly Trendline
  const nWeeks = weeklyChartData.length;
  const xMeanW = (nWeeks - 1) / 2;
  const yMeanW = weeklyChartData.reduce((sum, d) => sum + d.mg, 0) / nWeeks;
  let numTrendW = 0;
  let denTrendW = 0;
  weeklyChartData.forEach((d, i) => {
    numTrendW += (i - xMeanW) * (d.mg - yMeanW);
    denTrendW += Math.pow(i - xMeanW, 2);
  });
  const trendSlopeW = denTrendW === 0 ? 0 : numTrendW / denTrendW;
  const trendInterceptW = yMeanW - trendSlopeW * xMeanW;

  const weeklyChartDataWithTrend = weeklyChartData.map((d, i) => ({
    ...d,
    trend: Math.max(0, Math.round(trendSlopeW * i + trendInterceptW)),
  }));

  const totalWeeklyMg = weeklyChartData.reduce((sum, d) => sum + d.mg, 0);
  const avgWeeklyMg = Math.round(totalWeeklyMg / WEEKS_COUNT);
  const cleanWeeksCount = weeklyChartData.filter(w => w.mg === 0).length;
  const isDecliningW = trendSlopeW < -3;
  const isIncreasingW = trendSlopeW > 3;
  const startTrendValW = Math.max(0, Math.round(trendInterceptW));
  const endTrendValW = Math.max(0, Math.round(trendSlopeW * (WEEKS_COUNT - 1) + trendInterceptW));
  const trendPercentW = startTrendValW > 0 
    ? Math.round(Math.abs((endTrendValW - startTrendValW) / startTrendValW) * 100)
    : 0;

  const todaysTotalMg = chartData60[DAILY_DAYS_COUNT - 1]?.mg || 0;
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

  // --- Expanded Time-of-Day Intake Distribution (Rozbudowane Pory Dnia) ---
  const timeBuckets = [
    {
      id: 'early_morning',
      label: 'Wczesny Poranek',
      timeRange: '06:00 – 08:59',
      icon: Sunrise,
      color: '#f59e0b',
      bgColor: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      description: 'Naturalny szczyt porannego wyrzutu kortyzolu (CAR). Picie kofeiny przed 9:00 rano tłumi biologiczną samoregulację i przyspiesza budowanie tolerancji.',
      advice: 'Odczekaj minimum 90 minut po przebudzeniu. Nawodnij się 500 ml wody z elektrolitami i wyjdź na 10 minut na naturalne światło słoneczne.',
      filter: (h: number) => h >= 6 && h < 9,
    },
    {
      id: 'mid_morning',
      label: 'Przedpołudnie',
      timeRange: '09:00 – 11:59',
      icon: Sun,
      color: '#eab308',
      bgColor: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
      description: 'Nawyk biurowy i druga kawa. Czas intensywnej koncentracji, w którym sięgamy po kolejną porcję ze zwykłego odruchu przy pracy.',
      advice: 'Zrób 5 głębokich oddechów przeponowych, przewietrz biuro i sięgnij po herbatę ziołową lub zimną wodę gazowaną z cytryną.',
      filter: (h: number) => h >= 9 && h < 12,
    },
    {
      id: 'early_afternoon',
      label: 'Wczesne Popołudnie (Obiad)',
      timeRange: '12:00 – 14:59',
      icon: SunMedium,
      color: '#f97316',
      bgColor: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
      description: 'Zjazd poobiedni (postprandial dip) – kumulacja porannej adenozyny oraz wydatek metaboliczny na procesy trawienne posiłku.',
      advice: 'Wybieraj posiłki o niskim indeksie glikemicznym, wyjdź na krótki 10-minutowy spacer lub zastosuj 15-minutową drzemkę (power nap).',
      filter: (h: number) => h >= 12 && h < 15,
    },
    {
      id: 'late_afternoon',
      label: 'Późne Popołudnie',
      timeRange: '15:00 – 17:59',
      icon: Sunset,
      color: '#f43f5e',
      bgColor: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
      description: 'Strefa graniczna dla snu. Ze względu na 6-godzinny okres półtrwania kofeiny, 50% przyjętej dawki pozostanie aktywne we krwi w nocy.',
      advice: 'Kategoryczna granica odcięcia stymulantów. Zastąp kawę herbatą Rooibos, naparem imbirowym lub wodą mineralną.',
      filter: (h: number) => h >= 15 && h < 18,
    },
    {
      id: 'evening',
      label: 'Wieczór',
      timeRange: '18:00 – 21:59',
      icon: CloudMoon,
      color: '#8b5cf6',
      bgColor: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
      description: 'Czas syntezy melatoniny. Kofeina po 18:00 drastycznie spłyca i niszczy fazę snu głębokiego (SWS/NREM) oraz opóźnia zasypianie.',
      advice: 'Wycisz zmysły, włącz ciepłe oświetlenie, wypij napar z melisy/rumianku i odstaw ekrany min. 45 minut przed snem.',
      filter: (h: number) => h >= 18 && h < 22,
    },
    {
      id: 'night',
      label: 'Noc',
      timeRange: '22:00 – 05:59',
      icon: Moon,
      color: '#06b6d4',
      bgColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      description: 'Jedna spójna faza nocna – regeneracja komórkowa mózgu lub praca zmianowa rozregulowująca zegar biologiczny.',
      advice: 'Zadbaj o całkowite zaciemnienie sypialni, chłodną temperaturę (18–19°C) oraz techniki oddechowe 4-7-8.',
      filter: (h: number) => h >= 22 || h < 6,
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
            onClick={() => navigateToView(view === 'settings' ? 'home' : 'settings')}
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

          {/* Ring Tooltip */}
          <AnimatePresence>
            {activeRingTooltip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.15 }}
                className={`fixed z-50 px-3 py-2 rounded-xl shadow-xl border pointer-events-none backdrop-blur-md ${
                  theme === 'light' ? 'bg-white/95 border-zinc-200' : 'bg-zinc-900/95 border-zinc-700'
                }`}
                style={{
                  left: ringTooltipPos.x,
                  top: ringTooltipPos.y - 45,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="text-[11px] font-bold whitespace-nowrap">
                  {activeRingTooltip === 'days' && (
                    <span style={{ color: currentAccent.primary }}>
                      {days} {days === 1 ? 'Dzień' : 'Dni'}
                    </span>
                  )}
                  {activeRingTooltip === 'hours' && (
                    <span className="text-cyan-400">
                      {hours} {hours === 1 ? 'Godzina' : (hours >= 2 && hours <= 4) || (hours > 20 && hours % 10 >= 2 && hours % 10 <= 4) ? 'Godziny' : 'Godzin'}
                    </span>
                  )}
                  {activeRingTooltip === 'minutes' && (
                    <span className="text-violet-400">
                      {minutes} {minutes === 1 ? 'Minuta' : (minutes % 10 >= 2 && minutes % 10 <= 4 && (minutes < 10 || minutes > 20)) ? 'Minuty' : 'Minut'}
                    </span>
                  )}
                  {activeRingTooltip === 'seconds' && (
                    <span className="text-rose-500">
                      {seconds} {seconds === 1 ? 'Sekunda' : (seconds % 10 >= 2 && seconds % 10 <= 4 && (seconds < 10 || seconds > 20)) ? 'Sekundy' : 'Sekund'}
                    </span>
                  )}
                </div>
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
                
                {/* TRIPLE CONCENTRIC PROGRESS RINGS TIMER WITH BIO-CHRONOMETER CENTRAL MEDALLION */}
                <div className="relative flex items-center justify-center w-full max-w-[340px] aspect-square my-2">
                  {/* Subtle Glowing Radial Atmosphere */}
                  <div 
                    className="absolute inset-8 blur-3xl rounded-full pointer-events-none opacity-25 transition-all duration-700"
                    style={{ backgroundColor: currentAccent.primary }}
                  />

                  {/* SVG Triple Rings with Prominent Days Ring & Delicate Minutes Ring */}
                  <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 300 300">
                    <defs>
                      <filter id="glow-outer" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={currentAccent.primary} floodOpacity="0.5" />
                      </filter>
                      <filter id="glow-mid" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#06b6d4" floodOpacity="0.5" />
                      </filter>
                      <filter id="glow-inner" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#8b5cf6" floodOpacity="0.5" />
                      </filter>
                      <filter id="glow-seconds" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#f43f5e" floodOpacity="0.5" />
                      </filter>
                      <linearGradient id="medallion-grad-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e212b" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#0c0e14" stopOpacity="0.95" />
                      </linearGradient>
                      <linearGradient id="medallion-grad-light" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
                        <stop offset="100%" stopColor="#f1f5f9" stopOpacity="0.95" />
                      </linearGradient>
                    </defs>

                    {/* ROTATING ARCS LAYER (-90 deg from center (150, 150)) */}
                    <g transform="rotate(-90 150 150)">
                      {/* ================= RING 1 (OUTER - DNI - NAJBARDZIEJ WYRÓŻNIONY) ================= */}
                      {/* Dark high-contrast outer track border */}
                      <circle 
                        cx="150" cy="150" r="134" 
                        stroke={trackBorderColor} 
                        strokeWidth="11" 
                        fill="none" 
                      />
                      {/* Inner track stroke */}
                      <circle 
                        cx="150" cy="150" r="134" 
                        stroke={trackStrokeColor} 
                        strokeWidth="7" 
                        fill="none" 
                      />
                      {/* Active Progress - Grubszy i wiodący */}
                      <motion.circle 
                        cx="150" cy="150" r="134"
                        stroke={currentAccent.primary}
                        strokeWidth="8" 
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 134}
                        strokeDashoffset={(2 * Math.PI * 134) - (daysCycleProgress / 100) * (2 * Math.PI * 134)}
                        filter="url(#glow-outer)"
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />

                      {/* ================= RING 2 (MIDDLE - GODZINY - ŚREDNIA GRUBOŚĆ) ================= */}
                      {/* Dark high-contrast middle track border */}
                      <circle 
                        cx="150" cy="150" r="116" 
                        stroke={trackBorderColor} 
                        strokeWidth="9" 
                        fill="none" 
                      />
                      {/* Inner track stroke */}
                      <circle 
                        cx="150" cy="150" r="116" 
                        stroke={trackStrokeColor} 
                        strokeWidth="5.5" 
                        fill="none" 
                      />
                      {/* Active Progress - Średnia grubość */}
                      <motion.circle 
                        cx="150" cy="150" r="116"
                        stroke="#06b6d4" 
                        strokeWidth="6.5" 
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 116}
                        strokeDashoffset={(2 * Math.PI * 116) - (hoursProgress / 100) * (2 * Math.PI * 116)}
                        filter="url(#glow-mid)"
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />

                      {/* ================= RING 3 (INNER - MINUTY - NAJDELIKATNIEJSZY) ================= */}
                      {/* Dark high-contrast inner track border */}
                      <circle 
                        cx="150" cy="150" r="98" 
                        stroke={trackBorderColor} 
                        strokeWidth="7" 
                        fill="none" 
                      />
                      {/* Inner track stroke */}
                      <circle 
                        cx="150" cy="150" r="98" 
                        stroke={trackStrokeColor} 
                        strokeWidth="4" 
                        fill="none" 
                      />
                      {/* Active Progress - Cienki i subtelny */}
                      <motion.circle 
                        cx="150" cy="150" r="98"
                        stroke="#8b5cf6" 
                        strokeWidth="5" 
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 98}
                        strokeDashoffset={(2 * Math.PI * 98) - (minutesProgress / 100) * (2 * Math.PI * 98)}
                        filter="url(#glow-inner)"
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />

                      {/* ================= RING 4 (INNERMOST - SEKUNDY - BARDZO CIENKI) ================= */}
                      {/* Dark high-contrast innermost track border */}
                      <circle 
                        cx="150" cy="150" r="80" 
                        stroke={trackBorderColor} 
                        strokeWidth="5" 
                        fill="none" 
                      />
                      {/* Inner track stroke */}
                      <circle 
                        cx="150" cy="150" r="80" 
                        stroke={trackStrokeColor} 
                        strokeWidth="2.5" 
                        fill="none" 
                      />
                      {/* Active Progress - Najcieńszy */}
                      <motion.circle 
                        cx="150" cy="150" r="80"
                        stroke="#f43f5e" 
                        strokeWidth="3.5" 
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 80}
                        strokeDashoffset={(2 * Math.PI * 80) - (secondsProgress / 100) * (2 * Math.PI * 80)}
                        filter="url(#glow-seconds)"
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />

                      {/* HIT AREAS FOR TOOLTIPS (Invisible overlay) */}
                      <circle 
                        cx="150" cy="150" r="134" stroke="transparent" strokeWidth="18" fill="none"
                        style={{ pointerEvents: 'stroke', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
                        onMouseEnter={(e) => handleRingInteraction(e, 'days')}
                        onMouseMove={(e) => handleRingInteraction(e, 'days')}
                        onMouseLeave={handleRingLeave}
                        onTouchStart={(e) => handleRingInteraction(e, 'days')}
                        onTouchMove={(e) => handleRingInteraction(e, 'days')}
                        onTouchEnd={handleRingLeave}
                      />
                      <circle 
                        cx="150" cy="150" r="116" stroke="transparent" strokeWidth="18" fill="none"
                        style={{ pointerEvents: 'stroke', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
                        onMouseEnter={(e) => handleRingInteraction(e, 'hours')}
                        onMouseMove={(e) => handleRingInteraction(e, 'hours')}
                        onMouseLeave={handleRingLeave}
                        onTouchStart={(e) => handleRingInteraction(e, 'hours')}
                        onTouchMove={(e) => handleRingInteraction(e, 'hours')}
                        onTouchEnd={handleRingLeave}
                      />
                      <circle 
                        cx="150" cy="150" r="98" stroke="transparent" strokeWidth="18" fill="none"
                        style={{ pointerEvents: 'stroke', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
                        onMouseEnter={(e) => handleRingInteraction(e, 'minutes')}
                        onMouseMove={(e) => handleRingInteraction(e, 'minutes')}
                        onMouseLeave={handleRingLeave}
                        onTouchStart={(e) => handleRingInteraction(e, 'minutes')}
                        onTouchMove={(e) => handleRingInteraction(e, 'minutes')}
                        onTouchEnd={handleRingLeave}
                      />
                      <circle 
                        cx="150" cy="150" r="80" stroke="transparent" strokeWidth="18" fill="none"
                        style={{ pointerEvents: 'stroke', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
                        onMouseEnter={(e) => handleRingInteraction(e, 'seconds')}
                        onMouseMove={(e) => handleRingInteraction(e, 'seconds')}
                        onMouseLeave={handleRingLeave}
                        onTouchStart={(e) => handleRingInteraction(e, 'seconds')}
                        onTouchMove={(e) => handleRingInteraction(e, 'seconds')}
                        onTouchEnd={handleRingLeave}
                      />
                    </g>

                    {/* DECORATIVE INNER TICK MARKS & INNER MEDALLION */}
                    <circle 
                      cx="150" cy="150" r="66"
                      fill={theme === 'light' ? 'url(#medallion-grad-light)' : 'url(#medallion-grad-dark)'}
                      stroke={theme === 'light' ? '#e2e8f0' : '#27272a'}
                      strokeWidth="1.5"
                    />
                    <circle 
                      cx="150" cy="150" r="62"
                      fill="none"
                      stroke={theme === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)'}
                      strokeWidth="1"
                      strokeDasharray="2 6"
                    />

                    {/* THUMBS WITH TEXT FOR OUTER 3 RINGS */}
                    {/* Days Thumb */}
                    <motion.g
                      initial={{ x: 150, y: 150 - 134 }}
                      animate={{ x: daysPos.x, y: daysPos.y }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="pointer-events-none"
                    >
                      <circle cx="0" cy="0" r="13" fill={theme === 'light' ? '#ffffff' : '#18181b'} stroke={currentAccent.primary} strokeWidth="2" />
                      <text x="0" y="3.5" textAnchor="middle" fontSize="10" fontWeight="bold" fontFamily="inherit" fill={theme === 'light' ? '#09090b' : '#ffffff'}>
                        {days}d
                      </text>
                    </motion.g>

                    {/* Hours Thumb */}
                    <motion.g
                      initial={{ x: 150, y: 150 - 116 }}
                      animate={{ x: hoursPos.x, y: hoursPos.y }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="pointer-events-none"
                    >
                      <circle cx="0" cy="0" r="11" fill={theme === 'light' ? '#ffffff' : '#18181b'} stroke="#06b6d4" strokeWidth="2" />
                      <text x="0" y="3" textAnchor="middle" fontSize="9" fontWeight="bold" fontFamily="inherit" fill={theme === 'light' ? '#09090b' : '#ffffff'}>
                        {hours}h
                      </text>
                    </motion.g>

                    {/* Minutes Thumb */}
                    <motion.g
                      initial={{ x: 150, y: 150 - 98 }}
                      animate={{ x: minutesPos.x, y: minutesPos.y }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="pointer-events-none"
                    >
                      <circle cx="0" cy="0" r="10" fill={theme === 'light' ? '#ffffff' : '#18181b'} stroke="#8b5cf6" strokeWidth="2" />
                      <text x="0" y="3" textAnchor="middle" fontSize="8" fontWeight="bold" fontFamily="inherit" fill={theme === 'light' ? '#09090b' : '#ffffff'}>
                        {minutes}m
                      </text>
                    </motion.g>
                  </svg>
                  
                  {/* LUXURY BIOMETRIC CHRONOMETER INNER DISPLAY */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none p-6">
                    {/* Hero Number Display with Fluid Proportions */}
                    <div className="flex items-baseline justify-center gap-1 leading-none my-0.5 mt-2">
                      <span className="text-4xl sm:text-[46px] font-black tracking-tight tabular-nums bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent drop-shadow-sm">
                        {days > 0 ? days : hours}
                      </span>
                      <span 
                        className="text-xs font-black uppercase tracking-wider"
                        style={{ color: currentAccent.primary }}
                      >
                        {days > 0 ? (days === 1 ? 'dzień' : 'dni') : 'godz'}
                      </span>
                    </div>

                    {/* Secondary Unit Subtitle */}
                    <p className={`text-[10px] font-semibold tracking-wider uppercase ${subTextClasses}`}>
                      {days > 0 ? `${hours}h ${minutes}m czystości` : `${minutes}m ${seconds}s czystości`}
                    </p>

                    {/* Digital Precision Ticker */}
                    <div className={`mt-1.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full border backdrop-blur-md text-[11px] font-mono font-bold tabular-nums shadow-inner ${innerItemBg}`}>
                      <span className="w-1.5 h-1.5 rounded-full animate-ping mr-0.5" style={{ backgroundColor: currentAccent.primary }} />
                      <span>{days > 0 ? `${days}d ` : ''}{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
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
                    <div className="text-right pb-1">
                      <p className={`text-[10px] font-bold ${muteTextClasses}`}>
                        {remainingDays > 0 ? `${remainingDays}d ${remainingHours}h` : `${remainingHours}h ${remainingMins}m`} do celu
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className={`w-full h-5 rounded-full p-0.5 border relative z-10 mb-2 flex items-center ${theme === 'light' ? 'bg-zinc-100 border-zinc-200' : 'bg-black/40 border-zinc-800/80'}`}>
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
                    
                    {/* Progress percentage on the right, floating over or next to the bar */}
                    <div className="absolute right-3 font-bold text-sm select-none" style={{ color: currentAccent.primary, textShadow: theme === 'light' ? '0 1px 2px rgba(255,255,255,0.8)' : '0 1px 4px rgba(0,0,0,0.8)' }}>
                      {Math.floor(milestoneProgress)}%
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs relative z-10">
                    <p className={`line-clamp-1 ${subTextClasses}`}>
                      <span style={{ color: currentAccent.primary }} className="font-semibold">{nextMilestone.benefit}:</span> {nextMilestone.description}
                    </p>
                    <span className="text-[10px] font-semibold text-cyan-400 shrink-0 ml-2">Kliknij po szczegóły</span>
                  </div>
                </div>

                {/* COLLAPSIBLE MILESTONES SECTION (ZWIJANA DO 2 RZĘDÓW ZE SKROJONYM WIDOKIEM NA KOLEJNY CEL) */}
                <div className="w-full mt-6">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-1.5">
                      <Award size={15} style={{ color: currentAccent.primary }} />
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${subTextClasses}`}>
                        Kamienie Milowe ({MILESTONES.length})
                      </h4>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-medium ${muteTextClasses}`}>
                        {MILESTONES.filter(m => diffSeconds >= m.seconds).length} / {MILESTONES.length} zdobyte
                      </span>
                      
                      {/* Collapse / Expand Toggle Button */}
                      <button
                        onClick={() => setIsMilestonesCollapsed(!isMilestonesCollapsed)}
                        className={`text-xs px-2.5 py-1 rounded-xl border flex items-center gap-1 font-semibold transition-all ${innerItemBg} hover:border-zinc-500`}
                        style={{ color: currentAccent.primary }}
                      >
                        <span>{isMilestonesCollapsed ? 'Rozwiń wszystkie' : 'Zwiń do 2 rzędów'}</span>
                        <ChevronDown 
                          size={14} 
                          className={`transition-transform duration-300 ${isMilestonesCollapsed ? '' : 'rotate-180'}`} 
                        />
                      </button>
                    </div>
                  </div>

                  {/* Badges Grid (4 columns, collapsible so that 2 rows are shown containing the next milestone) */}
                  {(() => {
                    // Logic to ensure the row with the next milestone is always displayed when collapsed:
                    const nextMilestoneIndex = MILESTONES.findIndex(m => m.id === nextMilestone.id);
                    const targetIndex = nextMilestoneIndex !== -1 ? nextMilestoneIndex : 0;
                    
                    // Grid has 4 columns. Target row index is Math.floor(targetIndex / 4)
                    const targetRow = Math.floor(targetIndex / 4);
                    // Determine which 2 rows (8 items) to show:
                    // If targetRow is 0, show rows 0 and 1 (items 0 to 7)
                    // If targetRow is the last row, show last 2 rows
                    // Otherwise show row targetRow and targetRow + 1 or targetRow - 1 and targetRow
                    const totalRows = Math.ceil(MILESTONES.length / 4);
                    let startRow = targetRow;
                    if (startRow + 1 >= totalRows) {
                      startRow = Math.max(0, totalRows - 2);
                    }
                    const startIndex = startRow * 4;
                    const visibleMilestones = isMilestonesCollapsed 
                      ? MILESTONES.slice(startIndex, startIndex + 8)
                      : MILESTONES;

                    return (
                      <div className="space-y-2">
                        {isMilestonesCollapsed && totalRows > 2 && (
                          <div className="flex items-center justify-between text-[10px] px-1 text-zinc-500">
                            <span>Widok rzędów {startRow + 1}-{startRow + 2} z {totalRows}</span>
                            <span className="text-cyan-400 font-semibold">Kolejny cel ({nextMilestone.code}) w widoku</span>
                          </div>
                        )}

                        <div className="grid grid-cols-4 gap-2">
                          {visibleMilestones.map((milestone) => {
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

                                {/* Code (e.g. 1H, 2H, 6H, 1D, 36H, 1T, 2L) */}
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
                    );
                  })()}
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

                {/* Consumption Chart with Daily 60-Day Horizontal Scroll & Weekly Mode */}
                <div className={`border rounded-3xl p-5 pt-6 backdrop-blur-sm ${cardClasses}`}>
                  {/* Header with Title and Mode Switcher */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={18} style={{ color: currentAccent.primary }} />
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider">
                          Wykres Spożycia & Trend
                        </h3>
                        <span className={`text-[10px] ${muteTextClasses}`}>
                          {chartViewMode === 'daily' ? 'Ostatnie 60 dni (przewijane poziomo)' : 'Ostatnie 12 tygodni (zagregowane)'}
                        </span>
                      </div>
                    </div>

                    {/* Mode Toggle Switch */}
                    <div className={`flex items-center p-1 rounded-2xl border self-start sm:self-auto ${innerItemBg}`}>
                      <button
                        type="button"
                        onClick={() => setChartViewMode('daily')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          chartViewMode === 'daily'
                            ? 'text-white shadow-md'
                            : `${muteTextClasses} hover:text-zinc-200`
                        }`}
                        style={{
                          backgroundColor: chartViewMode === 'daily' ? currentAccent.primary : 'transparent',
                        }}
                      >
                        <Calendar size={13} />
                        <span>Dzienny (60 dni)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartViewMode('weekly')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          chartViewMode === 'weekly'
                            ? 'text-white shadow-md'
                            : `${muteTextClasses} hover:text-zinc-200`
                        }`}
                        style={{
                          backgroundColor: chartViewMode === 'weekly' ? currentAccent.primary : 'transparent',
                        }}
                      >
                        <CalendarDays size={13} />
                        <span>Tygodniowy</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className={`p-2.5 rounded-2xl border text-center ${innerItemBg}`}>
                      <div className={`text-[9px] font-bold uppercase tracking-wider ${muteTextClasses}`}>
                        {chartViewMode === 'daily' ? 'Czyste dni' : 'Czyste tygodnie'}
                      </div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">
                        {chartViewMode === 'daily' ? `${cleanDays60} / 60` : `${cleanWeeksCount} / 12`}
                      </div>
                    </div>
                    <div className={`p-2.5 rounded-2xl border text-center ${innerItemBg}`}>
                      <div className={`text-[9px] font-bold uppercase tracking-wider ${muteTextClasses}`}>
                        {chartViewMode === 'daily' ? 'Śr. dzienna' : 'Śr. tygodniowa'}
                      </div>
                      <div className="text-sm font-bold mt-0.5" style={{ color: currentAccent.primary }}>
                        {chartViewMode === 'daily' ? `~${avgDailyMg60} mg` : `~${avgWeeklyMg} mg`}
                      </div>
                    </div>
                    <div className={`p-2.5 rounded-2xl border text-center ${innerItemBg}`}>
                      <div className={`text-[9px] font-bold uppercase tracking-wider ${muteTextClasses}`}>
                        Suma kofeiny
                      </div>
                      <div className="text-sm font-bold mt-0.5">
                        {chartViewMode === 'daily' ? `${total60DayMg} mg` : `${totalWeeklyMg} mg`}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Trend Indicator Banner */}
                  <div className="flex items-center justify-between mb-3 px-3.5 py-2.5 rounded-2xl border text-xs font-medium bg-zinc-500/5">
                    <div className="flex items-center gap-2">
                      {chartViewMode === 'daily' ? (
                        total60DayMg === 0 ? (
                          <>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-emerald-500 font-bold">0 mg w 60 dniach – 100% Czystości! 🔥</span>
                          </>
                        ) : isDeclining60 ? (
                          <>
                            <TrendingDown size={15} className="text-emerald-500" />
                            <span className="text-emerald-500 font-bold">Trend Spadkowy (-{trendPercent60}%) w 60 dniach – Brawo!</span>
                          </>
                        ) : isIncreasing60 ? (
                          <>
                            <TrendingUp size={15} className="text-rose-500" />
                            <span className="text-rose-500 font-bold">Trend Wzrostowy (+{trendPercent60}%) w 60 dniach – Zadbaj o limit</span>
                          </>
                        ) : (
                          <>
                            <Activity size={15} style={{ color: currentAccent.primary }} />
                            <span className="font-bold">Trend Stabilny – Stała kontrola nawyku</span>
                          </>
                        )
                      ) : (
                        totalWeeklyMg === 0 ? (
                          <>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-emerald-500 font-bold">0 mg w całym kwartale – Mistrzowska dyscyplina! 🔥</span>
                          </>
                        ) : isDecliningW ? (
                          <>
                            <TrendingDown size={15} className="text-emerald-500" />
                            <span className="text-emerald-500 font-bold">Trend Spadkowy (-{trendPercentW}%) tydzień do tygodnia</span>
                          </>
                        ) : isIncreasingW ? (
                          <>
                            <TrendingUp size={15} className="text-rose-500" />
                            <span className="text-rose-500 font-bold">Trend Wzrostowy (+{trendPercentW}%) w skali tygodni</span>
                          </>
                        ) : (
                          <>
                            <Activity size={15} style={{ color: currentAccent.primary }} />
                            <span className="font-bold">Stabilne spożycie tygodniowe</span>
                          </>
                        )
                      )}
                    </div>
                    <span className={`text-[10px] hidden xs:inline ${muteTextClasses}`}>Linia przerywana: Trend</span>
                  </div>

                  {/* Horizontal Scroll Helpers for 60-day daily view */}
                  {chartViewMode === 'daily' && (
                    <div className="flex items-center justify-between gap-2 mb-3 px-1 text-[11px]">
                      <span className={`flex items-center gap-1 font-medium ${muteTextClasses}`}>
                        👈 <span className="hidden sm:inline">Przewiń wykres w poziomie (60 dni):</span>
                        <span className="sm:hidden">Przewiń w poziomie:</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (dailyChartScrollRef.current) {
                              dailyChartScrollRef.current.scrollTo({
                                left: dailyChartScrollRef.current.scrollWidth,
                                behavior: 'smooth'
                              });
                            }
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm transition-all"
                          style={{ backgroundColor: currentAccent.primary }}
                        >
                          Dzisiaj 👉
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Chart Rendering Container */}
                  {chartViewMode === 'daily' ? (
                    <div
                      ref={dailyChartScrollRef}
                      className="overflow-x-auto pb-2 rounded-2xl select-none cursor-grab active:cursor-grabbing"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: `${currentAccent.primary} transparent`,
                        touchAction: 'pan-x'
                      }}
                      onMouseDown={handleChartMouseDown}
                      onMouseLeave={handleChartMouseLeave}
                      onMouseUp={handleChartMouseUp}
                      onMouseMove={handleChartMouseMove}
                    >
                      <div className="min-w-[1800px] h-[230px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={chartData60WithTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              interval={0}
                              tick={({ x, y, payload }) => {
                                const item = chartData60WithTrend.find(d => d.name === payload.value);
                                const isToday = item?.isToday;
                                return (
                                  <g transform={`translate(${x},${y})`}>
                                    <text 
                                      x={0} 
                                      y={0} 
                                      dy={12} 
                                      textAnchor="middle" 
                                      fill={isToday ? currentAccent.primary : (theme === 'light' ? '#64748b' : '#94a3b8')}
                                      fontSize={isToday ? 11 : 9.5}
                                      fontWeight={isToday ? 700 : 500}
                                    >
                                      {item?.shortDate || payload.value}
                                    </text>
                                    <text 
                                      x={0} 
                                      y={0} 
                                      dy={22} 
                                      textAnchor="middle" 
                                      fill={isToday ? currentAccent.primary : (theme === 'light' ? '#94a3b8' : '#64748b')}
                                      fontSize={8}
                                      fontWeight={isToday ? 700 : 400}
                                    >
                                      {isToday ? 'Dziś' : item?.dayAbbr}
                                    </text>
                                  </g>
                                );
                              }}
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: theme === 'light' ? '#71717a' : '#94a3b8', fontSize: 10 }} 
                            />
                            <Tooltip 
                              cursor={{ fill: theme === 'light' ? '#f1f5f9' : '#1e293b', opacity: 0.4 }}
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const item = payload[0].payload;
                                  const mgVal = Number(payload.find(p => p.dataKey === 'mg')?.value ?? 0);
                                  const trendVal = Number(payload.find(p => p.dataKey === 'trend')?.value ?? 0);
                                  return (
                                    <div className={`text-xs py-2.5 px-3.5 rounded-2xl shadow-2xl border min-w-[190px] ${modalBg}`}>
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-bold text-xs" style={{ color: currentAccent.primary }}>
                                          {item.fullDate}
                                        </span>
                                        {item.isToday && (
                                          <span 
                                            className="text-[9px] px-1.5 py-0.5 rounded-md font-bold text-white uppercase tracking-wider"
                                            style={{ backgroundColor: currentAccent.primary }}
                                          >
                                            Dzisiaj
                                          </span>
                                        )}
                                      </div>
                                      <div className="mt-2 space-y-1">
                                        <div className="flex items-center justify-between text-xs font-semibold">
                                          <span>Spożycie:</span>
                                          <span className={mgVal === 0 ? 'text-emerald-500' : mgVal > 400 ? 'text-rose-500' : ''}>
                                            {mgVal} mg
                                          </span>
                                        </div>
                                        <div className={`flex items-center justify-between text-[11px] font-medium ${muteTextClasses}`}>
                                          <span>Wartość trendu:</span>
                                          <span>~{trendVal} mg</span>
                                        </div>
                                      </div>
                                      {item.drinksDetail && item.drinksDetail.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-zinc-500/20 text-[10px] space-y-0.5">
                                          <span className={`font-semibold ${subTextClasses}`}>Wypite napoje:</span>
                                          {item.drinksDetail.map((d: string, idx: number) => (
                                            <p key={idx} className={muteTextClasses}>• {d}</p>
                                          ))}
                                        </div>
                                      )}
                                      {mgVal === 0 && (
                                        <div className="mt-2 pt-1.5 border-t border-emerald-500/20 text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                          <Sparkles size={11} /> 100% Czystości (0 mg)
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            {/* Daily Consumption Bars */}
                            <Bar dataKey="mg" radius={[4, 4, 0, 0]} maxBarSize={16}>
                              {chartData60WithTrend.map((entry, index) => (
                                <Cell 
                                  key={`cell-60-${index}`} 
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
                              stroke={total60DayMg === 0 ? '#10b981' : isDeclining60 ? '#10b981' : isIncreasing60 ? '#f43f5e' : currentAccent.primary} 
                              strokeWidth={2} 
                              strokeDasharray="3 3" 
                              dot={false}
                              activeDot={{ r: 4 }}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-[230px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={weeklyChartDataWithTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: theme === 'light' ? '#71717a' : '#94a3b8', fontSize: 10 }} 
                            dy={8}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: theme === 'light' ? '#71717a' : '#94a3b8', fontSize: 10 }} 
                          />
                          <Tooltip 
                            cursor={{ fill: theme === 'light' ? '#f1f5f9' : '#1e293b', opacity: 0.4 }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const item = payload[0].payload;
                                const mgVal = Number(payload.find(p => p.dataKey === 'mg')?.value ?? 0);
                                const trendVal = Number(payload.find(p => p.dataKey === 'trend')?.value ?? 0);
                                return (
                                  <div className={`text-xs py-2.5 px-3.5 rounded-2xl shadow-2xl border min-w-[210px] ${modalBg}`}>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-bold text-xs" style={{ color: currentAccent.primary }}>
                                        {item.fullDate}
                                      </span>
                                      {item.isCurrentWeek && (
                                        <span 
                                          className="text-[9px] px-1.5 py-0.5 rounded-md font-bold text-white uppercase tracking-wider"
                                          style={{ backgroundColor: currentAccent.primary }}
                                        >
                                          Bieżący tydzień
                                        </span>
                                      )}
                                    </div>
                                    <div className="mt-2 space-y-1">
                                      <div className="flex items-center justify-between text-xs font-semibold">
                                        <span>Suma tygodnia:</span>
                                        <span className={mgVal === 0 ? 'text-emerald-500' : ''}>{mgVal} mg</span>
                                      </div>
                                      <div className={`flex items-center justify-between text-[11px] ${muteTextClasses}`}>
                                        <span>Średnia dzienna:</span>
                                        <span>~{item.avgDaily} mg/dzień</span>
                                      </div>
                                      <div className={`flex items-center justify-between text-[11px] ${muteTextClasses}`}>
                                        <span>Czyste dni:</span>
                                        <span className="text-emerald-400 font-medium">{item.cleanDays}/7 dni</span>
                                      </div>
                                      <div className={`flex items-center justify-between text-[11px] ${muteTextClasses}`}>
                                        <span>Wartość trendu:</span>
                                        <span>~{trendVal} mg</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          {/* Weekly Consumption Bars */}
                          <Bar dataKey="mg" radius={[6, 6, 0, 0]} maxBarSize={26}>
                            {weeklyChartDataWithTrend.map((entry, index) => (
                              <Cell 
                                key={`cell-w-${index}`} 
                                fill={
                                  entry.mg === 0 
                                    ? (theme === 'light' ? '#e2e8f0' : '#27272a') 
                                    : entry.isCurrentWeek
                                    ? currentAccent.primary
                                    : currentAccent.primary
                                }
                              />
                            ))}
                          </Bar>
                          {/* Weekly Linear Regression Trend Line */}
                          <Line 
                            type="monotone" 
                            dataKey="trend" 
                            stroke={totalWeeklyMg === 0 ? '#10b981' : isDecliningW ? '#10b981' : isIncreasingW ? '#f43f5e' : currentAccent.primary} 
                            strokeWidth={2.5} 
                            strokeDasharray="4 4" 
                            dot={{ 
                              r: 3.5, 
                              strokeWidth: 2, 
                              fill: theme === 'light' ? '#ffffff' : '#0f1118',
                              stroke: totalWeeklyMg === 0 ? '#10b981' : isDecliningW ? '#10b981' : isIncreasingW ? '#f43f5e' : currentAccent.primary
                            }}
                            activeDot={{ r: 5 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* SZYBKIE UZUPEŁNIANIE KALENDARZA (60 DNI) - ELEGANCKA KARTA Z PRZEJŚCIEM DO OKNA */}
                <div id="quick-calendar-filler-card" className={`border rounded-3xl p-5 backdrop-blur-sm ${cardClasses}`}>
                  <div className="flex items-start gap-3.5 mb-4">
                    <div 
                      className="w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0"
                      style={{
                        backgroundColor: currentAccent.badgeBg,
                        borderColor: currentAccent.badgeBorder,
                        color: currentAccent.primary,
                      }}
                    >
                      <CalendarDays size={22} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">
                        Szybkie Uzupełnianie Kalendarza (60 Dni)
                      </h3>
                      <p className={`text-xs mt-1 leading-relaxed ${muteTextClasses}`}>
                        Otwórz wyskakujące okienko z pojemną siatką 60 dni na jednym ekranie, aby szybko przeklikać wypite kawy w historii.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowQuickFillModal(true)}
                    className="w-full py-3 px-5 rounded-2xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md hover:brightness-110 active:scale-98"
                    style={{
                      backgroundColor: currentAccent.primary,
                      boxShadow: `0 0 16px ${currentAccent.glow}`,
                    }}
                  >
                    <CalendarDays size={18} />
                    <span>Otwórz okno uzupełniania (60 dni)</span>
                  </button>
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

                {/* History Logs (Collapsible/Expandable) */}
                <div className={`border rounded-3xl p-5 backdrop-blur-sm ${cardClasses}`}>
                  <div 
                    onClick={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
                    className="flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Rejestr Zdarzeń
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${innerItemBg} ${muteTextClasses}`}>
                        {logs.length} {logs.length === 1 ? 'wpis' : logs.length > 1 && logs.length < 5 ? 'wpisy' : 'wpisów'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsHistoryCollapsed(!isHistoryCollapsed);
                      }}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${innerItemBg} hover:opacity-90`}
                      style={{ color: currentAccent.primary }}
                    >
                      <span>{isHistoryCollapsed ? 'Rozwiń' : 'Zwiń'}</span>
                      {isHistoryCollapsed ? (
                        <ChevronDown size={14} className="transition-transform duration-200" />
                      ) : (
                        <ChevronUp size={14} className="transition-transform duration-200" />
                      )}
                    </button>
                  </div>

                  {/* Logs Content Area */}
                  <div className="mt-4">
                    {logs.length === 0 ? (
                      <div className={`text-center py-6 text-sm ${muteTextClasses}`}>
                        Czysto! Nie zanotowano żadnych napojów.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(isHistoryCollapsed ? logs.slice(0, 3) : logs).map(log => {
                          const drink = DRINKS.find(d => d.id === log.drinkId) || DRINKS[0];
                          return (
                            <div key={log.id} className={`rounded-2xl p-3 flex items-center justify-between border ${innerItemBg} transition-all`}>
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
                        })}

                        {/* Collapsed view indicator / toggle trigger */}
                        {isHistoryCollapsed && logs.length > 3 && (
                          <button
                            type="button"
                            onClick={() => setIsHistoryCollapsed(false)}
                            className={`w-full py-2.5 px-4 rounded-xl border border-dashed text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${innerItemBg} ${muteTextClasses} hover:text-white`}
                          >
                            <span>Pokaż pozostałe {logs.length - 3} wpisów (Rozwiń)</span>
                            <ChevronDown size={14} />
                          </button>
                        )}

                        {!isHistoryCollapsed && logs.length > 3 && (
                          <button
                            type="button"
                            onClick={() => setIsHistoryCollapsed(true)}
                            className={`w-full py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all opacity-80 hover:opacity-100 ${muteTextClasses} mt-2`}
                          >
                            <span>Zwiń listę zdarzeń</span>
                            <ChevronUp size={14} />
                          </button>
                        )}
                      </div>
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

        {/* BOTTOM NAVIGATION BAR: 3 BALANCED TABS (LICZNIK / ZANOTUJ / STATYSTYKI) */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40">
          <div className={`px-6 h-20 flex items-center justify-around relative border-t backdrop-blur-xl transition-colors ${navBg}`}>
            {/* Tab 1: Timer */}
            <button 
              id="nav-home-btn"
              onClick={() => navigateToView('home')} 
              className={`flex flex-col items-center gap-1 transition-all px-3 py-1.5 rounded-xl active:scale-95 ${
                view === 'home' 
                  ? 'font-bold' 
                  : `${muteTextClasses} hover:${subTextClasses}`
              }`}
              style={view === 'home' ? { color: currentAccent.primary } : {}}
            >
              <div className="w-10 h-10 flex items-center justify-center">
                <Home size={22} strokeWidth={view === 'home' ? 2.5 : 1.8} />
              </div>
              <span className="text-[11px] uppercase tracking-wider font-bold">Licznik</span>
            </button>
            
            {/* Center Action: Zanotuj napój (Styl 2: Dark Frosted Glass z subtelną poświatą) */}
            <button 
              id="nav-add-btn"
              onClick={handleOpenAddModal} 
              className="flex flex-col items-center gap-1 transition-all px-3 py-1.5 group active:scale-95 focus:outline-none"
              title="Zanotuj napój / Zresetuj licznik"
            >
              <div 
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all duration-200 ${
                  theme === 'light' ? 'bg-zinc-100 border-zinc-300' : 'bg-zinc-900/90 border-zinc-700/70'
                } group-hover:scale-105 shadow-sm`}
                style={{
                  color: currentAccent.primary,
                  boxShadow: `0 0 14px ${currentAccent.glow}`
                }}
              >
                <Plus size={22} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
              </div>
              <span className={`text-[11px] uppercase tracking-wider font-bold transition-colors ${subTextClasses}`}>
                Zanotuj
              </span>
            </button>

            {/* Tab 2: Stats */}
            <button 
              id="nav-stats-btn"
              onClick={() => navigateToView('stats')} 
              className={`flex flex-col items-center gap-1 transition-all px-3 py-1.5 rounded-xl active:scale-95 ${
                view === 'stats' 
                  ? 'font-bold' 
                  : `${muteTextClasses} hover:${subTextClasses}`
              }`}
              style={view === 'stats' ? { color: currentAccent.primary } : {}}
            >
              <div className="w-10 h-10 flex items-center justify-center">
                <BarChart2 size={22} strokeWidth={view === 'stats' ? 2.5 : 1.8} />
              </div>
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
                <div className={`border rounded-2xl p-4 mb-5 transition-all ${innerItemBg}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <Clock size={14} style={{ color: currentAccent.primary }} />
                      <span>Kiedy wypito napój?</span>
                    </div>
                    {isCustomTimeOpen && (
                      <button
                        type="button"
                        onClick={() => setIsCustomTimeOpen(false)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md border ${cardClasses}`}
                      >
                        Ukryj
                      </button>
                    )}
                  </div>

                  {!isCustomTimeOpen && (
                    <button
                      type="button"
                      onClick={() => setIsCustomTimeOpen(true)}
                      className="w-full py-3.5 rounded-xl text-xs font-bold border transition-all active:scale-[0.98] flex justify-center items-center gap-2 mb-2 shadow-sm"
                      style={{ 
                        backgroundColor: currentAccent.badgeBg,
                        color: currentAccent.primary,
                        borderColor: currentAccent.badgeBorder
                      }}
                    >
                      <Clock size={16} />
                      Ustaw dokładną godzinę spożycia
                    </button>
                  )}

                  {/* Datetime Pickers */}
                  <AnimatePresence>
                    {isCustomTimeOpen && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        {/* Quick offset buttons */}
                        <div className="flex flex-wrap gap-2 mb-3 mt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const nowD = new Date();
                              setCustomTimeDate(format(nowD, 'yyyy-MM-dd'));
                              setCustomTimeHour(format(nowD, 'HH:mm'));
                            }}
                            className={`text-[11px] px-3 py-1.5 rounded-xl border font-semibold ${cardClasses} hover:border-zinc-500`}
                          >
                            Teraz
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTimeOffset(15)}
                            className={`text-[11px] px-2.5 py-1.5 rounded-xl border ${cardClasses} hover:border-zinc-500`}
                          >
                            -15 min
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTimeOffset(60)}
                            className={`text-[11px] px-2.5 py-1.5 rounded-xl border ${cardClasses} hover:border-zinc-500`}
                          >
                            -1 godz
                          </button>
                          <button
                            type="button"
                            onClick={() => applyTimeOffset(120)}
                            className={`text-[11px] px-2.5 py-1.5 rounded-xl border ${cardClasses} hover:border-zinc-500`}
                          >
                            -2 godz
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-500/20">
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
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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

        {/* POP-UP MODAL: SZYBKIE UZUPEŁNIANIE KALENDARZA (SIATKA 60 DNI NA JEDNYM EKRANIE) */}
        <AnimatePresence>
          {showQuickFillModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`w-full max-w-5xl border sm:rounded-3xl p-4 sm:p-6 shadow-2xl relative max-h-[92vh] flex flex-col ${modalBg}`}
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between pb-3 border-b border-zinc-500/20 mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border text-xl font-black shrink-0"
                      style={{
                        backgroundColor: currentAccent.badgeBg,
                        color: currentAccent.primary,
                        borderColor: currentAccent.badgeBorder
                      }}
                    >
                      <CalendarDays size={24} />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-xl font-bold tracking-tight">Szybkie Uzupełnianie Kalendarza (60 Dni)</h2>
                      <p className={`text-xs mt-0.5 ${subTextClasses}`}>
                        Przeglądaj dziesiątki dni na jednym ekranie. Kliknij <strong>+</strong> lub <strong>-</strong> przy odpowiednim dniu.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowQuickFillModal(false)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${innerItemBg} hover:opacity-80 transition-opacity shrink-0 ml-2`}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Drink & Sort Selector Bar */}
                <div className="mb-3 bg-zinc-500/5 p-3 rounded-2xl border border-zinc-500/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Drink Selector */}
                  <div className="flex-1 min-w-0">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${muteTextClasses}`}>
                      1. Wybierz napój przypisywany przyciskiem (+):
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {DRINKS.map(drink => {
                        const isSelected = quickFillDrinkId === drink.id;
                        const DrinkIcon = drink.icon;
                        return (
                          <button
                            key={`quick-modal-sel-${drink.id}`}
                            type="button"
                            onClick={() => setQuickFillDrinkId(drink.id)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                              isSelected
                                ? 'text-white shadow-md'
                                : `${innerItemBg} ${muteTextClasses} hover:text-zinc-200`
                            }`}
                            style={{
                              backgroundColor: isSelected ? currentAccent.primary : undefined,
                              borderColor: isSelected ? currentAccent.primary : undefined,
                            }}
                          >
                            <DrinkIcon size={14} />
                            <span>{drink.name}</span>
                            <span className="text-[10px] opacity-80">({drink.mg}mg)</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sort Selector */}
                  <div className="shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-500/10">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${muteTextClasses}`}>
                      2. Kolejność dni:
                    </span>
                    <div className="flex items-center gap-1.5 bg-zinc-500/10 p-1 rounded-xl border border-zinc-500/10">
                      <button
                        type="button"
                        onClick={() => setQuickFillSortOrder('newest')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          quickFillSortOrder === 'newest'
                            ? 'bg-zinc-800 text-white shadow-sm'
                            : `${muteTextClasses} hover:text-white`
                        }`}
                        style={{
                          backgroundColor: quickFillSortOrder === 'newest' ? currentAccent.primary : undefined,
                        }}
                      >
                        Od Dziś (Najnowsze)
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickFillSortOrder('oldest')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          quickFillSortOrder === 'oldest'
                            ? 'bg-zinc-800 text-white shadow-sm'
                            : `${muteTextClasses} hover:text-white`
                        }`}
                        style={{
                          backgroundColor: quickFillSortOrder === 'oldest' ? currentAccent.primary : undefined,
                        }}
                      >
                        Chronologicznie (Od 60 dni)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dense Grid of 60 Days (Robust & Perfectly Aligned) */}
                <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-2.5">
                    {(quickFillSortOrder === 'newest' ? [...chartData60].reverse() : chartData60).map((dayItem) => {
                      const { date, mg, drinksCount, isToday, relativeLabel, shortDate } = dayItem;
                      const formattedDateStr = format(date, 'd MMM', { locale: pl });
                      const isClean = mg === 0;

                      return (
                        <div
                          key={`quick-grid-${formattedDateStr}-${date.getTime()}`}
                          className={`h-[124px] p-2.5 rounded-2xl border flex flex-col justify-between transition-all relative ${
                            isToday
                              ? 'ring-2 shadow-md'
                              : `${innerItemBg}`
                          }`}
                          style={
                            isToday
                              ? {
                                  borderColor: currentAccent.primary,
                                  backgroundColor: currentAccent.badgeBg,
                                  boxShadow: `0 0 10px ${currentAccent.glow}`,
                                }
                              : {}
                          }
                        >
                          {/* Day Header */}
                          <div className="text-center w-full pb-1 border-b border-zinc-500/15">
                            <span 
                              className={`text-[9px] uppercase tracking-wider font-extrabold block truncate ${isToday ? '' : muteTextClasses}`} 
                              style={isToday ? { color: currentAccent.primary } : {}}
                            >
                              {relativeLabel}
                            </span>
                            <span className="text-xs font-extrabold tracking-tight block truncate">
                              {shortDate}
                            </span>
                          </div>

                          {/* Drinks Count & Mg */}
                          <div className="text-center my-0.5">
                            <span className={`text-xs font-extrabold block truncate ${isClean ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {drinksCount} {drinksCount === 1 ? 'kawa' : drinksCount > 1 && drinksCount < 5 ? 'kawy' : 'kaw'}
                            </span>
                            <span className={`text-[10px] block font-medium truncate ${muteTextClasses}`}>
                              {mg} mg
                            </span>
                          </div>

                          {/* Plus & Minus Incrementor Controls */}
                          <div className="flex items-center justify-between w-full gap-1 pt-1 border-t border-zinc-500/15">
                            <button
                              type="button"
                              onClick={() => removeDrinkFromDate(date)}
                              disabled={drinksCount === 0}
                              className={`h-7 flex-1 rounded-xl border flex items-center justify-center transition-all ${
                                drinksCount === 0
                                  ? 'opacity-20 cursor-not-allowed border-zinc-700 text-zinc-500'
                                  : 'bg-red-500/15 border-red-500/40 text-red-400 hover:bg-red-500/30 active:scale-90 shadow-sm'
                              }`}
                              title="Odejmij 1 napój z tego dnia"
                            >
                              <Minus size={13} strokeWidth={2.5} />
                            </button>

                            <button
                              type="button"
                              onClick={() => addDrinkToDate(date)}
                              className="h-7 flex-1 rounded-xl text-white flex items-center justify-center gap-0.5 font-bold text-xs transition-all shadow-md active:scale-90"
                              style={{
                                backgroundColor: currentAccent.primary,
                                boxShadow: `0 0 6px ${currentAccent.glow}`,
                              }}
                              title="Dodaj 1 wybrany napój do tego dnia"
                            >
                              <Plus size={13} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="mt-3 pt-3 border-t border-zinc-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    <span className={subTextClasses}>
                      Czyste dni: <strong className="text-emerald-400">{cleanDays60} z 60</strong> | Suma kofeiny: <strong className="text-white">{total60DayMg} mg</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowQuickFillModal(false)}
                    className="w-full sm:w-auto py-2 px-6 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-95"
                    style={{ backgroundColor: currentAccent.primary }}
                  >
                    Gotowe, zamknij okno
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

        {/* EXIT CONFIRMATION MODAL (SYSTEM BACK BUTTON HANDLER) */}
        <AnimatePresence>
          {showExitConfirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`w-full max-w-sm rounded-3xl border p-6 shadow-2xl ${modalBg}`}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm"
                    style={{
                      backgroundColor: currentAccent.badgeBg,
                      borderColor: currentAccent.badgeBorder,
                      color: currentAccent.primary
                    }}
                  >
                    <LogOut size={22} />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">Czy chcesz wyjść z aplikacji?</h3>
                    <p className={`text-xs mt-1.5 leading-relaxed ${subTextClasses}`}>
                      Twój licznik detoksu i postępy działają nieprzerwanie w tle.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full pt-2">
                    <button
                      onClick={() => setShowExitConfirmModal(false)}
                      className={`py-3 rounded-2xl border text-xs font-bold transition-all active:scale-95 ${innerItemBg} hover:border-zinc-500`}
                    >
                      Zostań w aplikacji
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowExitConfirmModal(false);
                        if (typeof window !== 'undefined') {
                          try {
                            window.close();
                          } catch {}
                          // Navigate back in history if possible
                          if (window.history.length > 1) {
                            window.history.back();
                          }
                        }
                      }}
                      className="py-3 rounded-2xl text-white text-xs font-bold shadow-md transition-all active:scale-95"
                      style={{ backgroundColor: currentAccent.primary }}
                    >
                      Wyjdź
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
