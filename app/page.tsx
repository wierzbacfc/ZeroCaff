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
  Heart, Compass, ArrowRight, ArrowLeft, BatteryCharging,
  Bell, BellOff, BellRing, Target, AlertCircle,
  Download, RefreshCw, Smartphone, CheckCircle, Wifi, ArrowUpCircle, Sliders, LogOut,
  CalendarDays, CalendarClock, History, Eye, EyeOff
} from 'lucide-react';
import { format, subDays, isSameDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { D3CaffeineChart } from '../components/D3CaffeineChart';

// --- Types ---
type ThemeMode = 'dark' | 'gray' | 'light';
type AccentColorKey = 'orange' | 'emerald' | 'amber' | 'cyan' | 'violet' | 'rose' | 'blue' | 'teal' | 'lime' | 'sunset';
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
  teal: {
    key: 'teal',
    name: 'Morski',
    primary: '#14b8a6',
    primaryHover: '#0d9488',
    glow: 'rgba(20, 184, 166, 0.35)',
    ring: '#14b8a6',
    badgeBg: 'rgba(20, 184, 166, 0.12)',
    badgeText: '#2dd4bf',
    badgeBorder: 'rgba(20, 184, 166, 0.3)',
    btnGradient: 'from-teal-500 to-emerald-500',
  },
  lime: {
    key: 'lime',
    name: 'Limonkowy',
    primary: '#84cc16',
    primaryHover: '#65a30d',
    glow: 'rgba(132, 204, 22, 0.35)',
    ring: '#84cc16',
    badgeBg: 'rgba(132, 204, 22, 0.12)',
    badgeText: '#a3e635',
    badgeBorder: 'rgba(132, 204, 22, 0.3)',
    btnGradient: 'from-lime-500 to-emerald-500',
  },
  sunset: {
    key: 'sunset',
    name: 'Sunset',
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    glow: 'rgba(124, 58, 237, 0.4)',
    ring: '#7c3aed',
    badgeBg: 'rgba(124, 58, 237, 0.14)',
    badgeText: '#fbbf24',
    badgeBorder: 'rgba(245, 158, 11, 0.4)',
    btnGradient: 'from-violet-700 via-purple-600 to-amber-500',
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

// --- Comprehensive Milestones (Rich First Week Stages + Intermediate + Long Term) ---
const MILESTONES: Milestone[] = [
  {
    id: 'm-30m',
    code: '30M',
    name: '30 Minut',
    seconds: 30 * 60,
    phase: 'Faza 1: Szczyt Wchłaniania',
    benefit: 'Mobilizacja wątroby do neutralizacji',
    description: 'Stężenie kofeiny w Twojej krwi osiąga punkt krytyczny. Związki wchłonęły się w żołądku i jelicie cienkim, a wątroba natychmiastowo aktywuje enzym CYP1A2, rozpoczynając intensywną pracę nad filtrowaniem ksenobiotyku.',
    symptoms: 'Maksymalne pobudzenie receptorów, przyspieszona akcja serca, delikatne podwyższenie temperatury ciała.',
    tips: 'Wypij natychmiast szklankę niegazowanej wody, aby wspomóc nerki w przygotowaniu do filtracji metabolitów.',
    mentalBoost: 'To absolutny szczyt intoksykacji stymulantem – od teraz w Twoim ciele będzie już tylko mniej kofeiny!'
  },
  {
    id: 'm-1h',
    code: '1H',
    name: '1 Godzina',
    seconds: 1 * 3600,
    phase: 'Faza 1: Początek Filtracji Wątrobowej',
    benefit: 'Rozbijanie cząsteczek na metabolity',
    description: 'Enzymy wątrobowe pracują na najwyższych obrotach, rozszczepiając kofeinę na paraksantynę, teobrominę i teofilinę. Rozpoczyna się systemowe odtruwanie krwioobiegu.',
    symptoms: 'Utrzymujące się sztuczne pobudzenie, lekkie zwężenie naczyń krwionośnych w mózgu.',
    tips: 'Unikaj stresowych bodźców i pozwól organizmowi skupić energię metaboliczną na oczyszczaniu.',
    mentalBoost: 'Twoja wątroba już teraz aktywnie usuwa stymulant. Pierwsza godzina czystości została osiągnięta.'
  },
  {
    id: 'm-2h',
    code: '2H',
    name: '2 Godziny',
    seconds: 2 * 3600,
    phase: 'Faza 1: Spadek Szczytowego Stężenia',
    benefit: 'Spadek pulsu i pierwsze uspokojenie',
    description: 'Najwyższa fala pobudzenia opada. Naczynia wieńcowe powoli wracają do optymalnej elastyczności, a układ krążenia redukuje podwyższone ciśnienie tętnicze.',
    symptoms: 'Pierwsze subtelne uspokojenie pulsu, spadek euforycznego wyrzutu dopaminy.',
    tips: 'Wykonaj 5 głębokich oddechów przeponowych, by aktywować przywspółczulny układ nerwowy.',
    mentalBoost: 'Twoje serce zwalnia bieg i dziękuje Ci za zdjęcie chemicznego bata stymulacji.'
  },
  {
    id: 'm-3h',
    code: '3H',
    name: '3 Godziny',
    seconds: 3 * 3600,
    phase: 'Faza 1: Uwalnianie Receptorów A1',
    benefit: 'Poluzowanie blokady receptorów snu',
    description: 'Cząsteczki kofeiny powoli odłączają się od receptorów adenozynowych A1 w korze mózgowej. Naturalna adenozyna zaczyna docierać do neuronów, ujawniając prawdziwy poziom energii.',
    symptoms: 'Lekki spadek energii, początek rozluźnienia napiętych mięśni karku i barków.',
    tips: 'Nie sięgaj po słodkie przekąski – napij się wody z cytryną lub herbaty miętowej.',
    mentalBoost: 'Prawdziwa biologia powoli przejmuje stery. Odkrywasz autentyczny stan swojego ciała.'
  },
  {
    id: 'm-4h',
    code: '4H',
    name: '4 Godziny',
    seconds: 4 * 3600,
    phase: 'Faza 1: Demaskowanie Zmęczenia',
    benefit: 'Prawdziwa informacja o zasobach energii',
    description: 'Adenozyna gwałtownie łączy się z uwolnionymi receptorami. Mózg otrzymuje niezakłóconą informację o rzeczywistym zmęczeniu biologicznym bez fałszywych sygnałów.',
    symptoms: 'Wyraźne ziewanie, chęć sięgnięcia po kolejną porcję kofeiny (odruch nawykowy).',
    tips: 'Wstań, zrób 10 przysiadów lub wyjdź na 3-minutowy spacer na świeże powietrze.',
    mentalBoost: 'To zmęczenie to nie Twoja słabość – to Twoje neurony odzyskujące wolność i prawdziwy głos.'
  },
  {
    id: 'm-6h',
    code: '6H',
    name: '6 Godzin',
    seconds: 6 * 3600,
    phase: 'Faza 1: Okres Półtrwania (T½)',
    benefit: '50% kofeiny całkowicie zneutralizowane',
    description: 'Połowa przyjętej dawki kofeiny została trwale przefiltrowana i wydalona. Naczynia krwionośne w mózgu rozszerzają się, zwiększając dotlenienie kory mózgowej.',
    symptoms: 'Uczucie ociężałości, możliwy lekki ból głowy związany z rozszerzaniem naczyń.',
    tips: 'Zjedz garść orzechów lub migdałów bogatych w magnez, by wesprzeć stabilność naczyniową.',
    mentalBoost: 'Przełomowy punkt! Połowa trucizny opuściła Twój organizm bezpowrotnie.'
  },
  {
    id: 'm-8h',
    code: '8H',
    name: '8 Godzin',
    seconds: 8 * 3600,
    phase: 'Faza 1: Równowaga Krążenia',
    benefit: 'Normalizacja ciśnienia i ulga dla nadnerczy',
    description: 'Układ współczulny przechodzi w stan spoczynku. Nadnercza przestają produkować nadmiarowy kortyzol pod dyktando stymulanta, a tętno spoczynkowe osiąga wzorcowy poziom.',
    symptoms: 'Głęboki spokój mięśniowy, odprężenie żuchwy, wolniejszy i głębszy oddech.',
    tips: 'Jeśli odczuwasz napięcie, zastosuj ciepły prysznic lub delikatny masaż skroni.',
    mentalBoost: 'Twoje serce bije spokojnym, naturalnym rytmem. Dajesz mu bezcenny odpoczynek.'
  },
  {
    id: 'm-10h',
    code: '10H',
    name: '10 Godzin',
    seconds: 10 * 3600,
    phase: 'Faza 2: Głębokie Oczyszczanie',
    benefit: '75% kofeiny zneutralizowane z tkanek',
    description: 'Trzy czwarte substancji zostało całkowicie usunięte. Narządy wewnętrzne odzyskują pełną równowagę elektrolitową, a w naczyniach krwionośnych płynie czystsza krew.',
    symptoms: 'Naturalne wyciszenie układu nerwowego, spadek nerwowości i natłoku myśli.',
    tips: 'Zadbaj o lekką kolację bez cukrów prostych, by przygotować ciało do snu.',
    mentalBoost: 'Jesteś o krok od pełnego, biologicznego oczyszczenia krwi. Wytrwałość przynosi owoce.'
  },
  {
    id: 'm-12h',
    code: '12H',
    name: '12 Godzin',
    seconds: 12 * 3600,
    phase: 'Faza 2: Start Syntezy Melatoniny',
    benefit: 'Uwolnienie szyszynki i głęboki sen',
    description: 'Śladowe ilości kofeiny przestają blokować szyszynkę. Mózg bez zakłóceń wydziela melatoninę – kluczowy hormon snu i silny antyoksydant naprawiający komórki.',
    symptoms: 'Głęboka, zdrowa senność wieczorna bez niepokoju i gonitwy myśli.',
    tips: 'Zredukuj światło niebieskie (ekrany), wywietrz sypialnię i przygotuj się na regenerujący sen.',
    mentalBoost: 'Dziś w nocy Twój mózg doświadczy czystego, prawdziwie regenerującego snu!'
  },
  {
    id: 'm-18h',
    code: '18H',
    name: '18 Godzin',
    seconds: 18 * 3600,
    phase: 'Faza 2: Regeneracja Naczyniowa Mózgu',
    benefit: 'Pełny powrót przepływu mózgowego',
    description: 'Naczynia krwionośne w mózgu rozszerzyły się do naturalnej średnicy. Tlen i glukoza swobodnie docierają do wszystkich obszarów kory mózgowej.',
    symptoms: 'Możliwe napięcie naczyniowe (ból głowy związany z odstawieniem), które jest dowodem gojenia.',
    tips: 'Pij dużo wody mineralnej z odrobiną soli kłodawskiej lub cytryny dla optymalnego nawodnienia.',
    mentalBoost: 'Ból głowy to nie wróg – to namacalny dowód, że naczynia mózgowe odzyskują naturalne ukrwienie.'
  },
  {
    id: 'm-24h',
    code: '24H',
    name: '1 Doba',
    seconds: 24 * 3600,
    phase: 'Faza 2: Szczyt Odstawienia & 100% Czystości',
    benefit: '100% kofeiny wyeliminowane z krwioobiegu',
    description: 'Po 24 godzinach stężenie kofeiny w Twojej krwi wynosi absolutne ZERO. Organizm jest wolny chemicznie. Rozpoczyna się fascynujący proces neuroadaptacji.',
    symptoms: 'Kulminacja objawów odstawiennych: pulsujące bóle głowy, drażliwość, zmęczenie.',
    tips: 'Zastosuj zimny okład na czoło i kark, utnij 20-minutową drzemkę i daj sobie prawo do spokoju.',
    mentalBoost: 'Przetrwałeś najtrudniejszą dobę! W Twoich żyłach nie ma już ani jednej cząsteczki kofeiny.'
  },
  {
    id: 'm-36h',
    code: '36H',
    name: '36 Godzin',
    seconds: 36 * 3600,
    phase: 'Faza 3: Przełom Neuroadaptacji',
    benefit: 'Spadek intensywności bólu naczyniowego',
    description: 'Szczytowa fala rozszerzania naczyń mózgowych powoli stabilizuje się. Mózg rozpoczyna reorganizację przekaźnictwa nerwowego bez zewnętrznego stymulanta.',
    symptoms: 'Bóle głowy zaczynają wyraźnie tracić na sile, pojawia się głęboki, stabilniejszy oddech.',
    tips: 'Spacer na świeżym powietrzu przyspieszy wymianę gazową i dotlenienie komórek nerwowych.',
    mentalBoost: 'Najostrzejsza fizyczna burza powoli mija. Z każdą godziną Twoje ciało zyskuje przewagę.'
  },
  {
    id: 'm-48h',
    code: '48H',
    name: '2 Doby',
    seconds: 48 * 3600,
    phase: 'Faza 3: Przebudowa Receptorów (Down-regulation)',
    benefit: 'Inicjacja neuroplastyczności mózgu',
    description: 'Mózg zauważa brak stymulanta i zaczyna demontować nadmiarowe receptory adenozynowe, które stworzył w obronie przed kofeiną. Chemia neuronów wraca do normy.',
    symptoms: 'Przejściowy spadek nastroju z powodu braku sztucznej dopaminy, wygasanie bólu głowy.',
    tips: 'Lekka aktywność fizyczna (joga, spacer) pobudzi naturalną produkcję endorfin i dopaminy.',
    mentalBoost: 'Twój mózg przeprowadza zaawansowaną reinżynierię biologiczną. Budujesz nową siłę!'
  },
  {
    id: 'm-60h',
    code: '60H',
    name: '60 Godzin',
    seconds: 60 * 3600,
    phase: 'Faza 3: Nawodnienie & Równowaga Tkanek',
    benefit: 'Odzyskiwanie głębokiego nawilżenia komórkowego',
    description: 'Diuretyczne działanie kofeiny zostało całkowicie zneutralizowane. Nerki i komórki ciała zatrzymują optymalną ilość wody i minerałów (magnez, potas, cynk).',
    symptoms: 'Poprawa elastyczności skóry, brak uczucia suchości w ustach i oczach.',
    tips: 'Sięgnij po wodę kokosową lub sok pomidorowy dla uzupełnienia potasu.',
    mentalBoost: 'Twoje ciało nawadnia się od środka. Komórki pracują w idealnym środowisku biologicznym.'
  },
  {
    id: 'm-3d',
    code: '3D',
    name: '3 Doby',
    seconds: 3 * 24 * 3600,
    phase: 'Faza 3: Fizyczna Wolność',
    benefit: 'Ustabilizowanie przepływu krwi w mózgu',
    description: 'Po 72 godzinach przepływ krwi i tlenu w naczyniach mózgowych wraca do trwałej normy. Ostre fizyczne objawy odstawienia niemal całkowicie ustępują.',
    symptoms: 'Wygaszenie bólu głowy, pojawienie się psychologicznej pustki po dawnym rytuale kawowym.',
    tips: 'Zastąp nawyk: przygotuj rano napar imbirowy, kawę zbożową lub ciepłą wodę z cytryną.',
    mentalBoost: 'Fizyczny głód pokonany! Najtrudniejszy etap odstawienia masz już za sobą.'
  },
  {
    id: 'm-4d',
    code: '4D',
    name: '4 Doby',
    seconds: 4 * 24 * 3600,
    phase: 'Faza 4: Odnowa Żołądka & Mikrobiomu',
    benefit: 'Regeneracja błony śluzowej przewodu pokarmowego',
    description: 'Brak drażniących kwasów kawowych i sztucznego wyrzutu kwasu solnego pozwala na szybką odbudowę nabłonka żołądka oraz wzmocnienie flory bakteryjnej jelit.',
    symptoms: 'Zanik zgagi, refluksu, brak porannych skurczów żołądka, lepsze trawienie posiłków.',
    tips: 'Włącz do diety produkty fermentowane (kefir, kiszonki), by wesprzeć odbudowę mikrobiomu.',
    mentalBoost: 'Twój układ trawienny odzyskuje spokój. Zdrowe jelita to lepszy nastrój i odporność!'
  },
  {
    id: 'm-5d',
    code: '5D',
    name: '5 Dni',
    seconds: 5 * 24 * 3600,
    phase: 'Faza 4: Regeneracja Nadnerczy',
    benefit: 'Koniec zjazdów energetycznych po południu',
    description: 'Nadnercza regenerują swoje zasoby. Krzywa kortyzolu w ciągu dnia ulega wygładzeniu. Popołudniowy, obezwładniający zjazd energetyczny (afternoon crash) znika.',
    symptoms: 'Stabilna energia od rana do wieczora, zanik nagłych napadów senności o 14:00.',
    tips: 'Zauważ, jak równomiernie pracuje Twój umysł bez konieczności ciągłego "doładowywania".',
    mentalBoost: 'Odkrywasz prawdziwą, stabilną energię. Nie pożyczasz już energii na procent z przyszłości!'
  },
  {
    id: 'm-6d',
    code: '6D',
    name: '6 Dni',
    seconds: 6 * 24 * 3600,
    phase: 'Faza 4: Przebudzenie Naturalnej Witalności',
    benefit: 'Wzrost klarowności umysłu i koncentracji',
    description: 'Neuroprzekaźniki (GABA, glutaminian, serotonina) odzyskują harmonijną równowagę. Znika mgła mózgowa (brain fog), a koncentracja staje się głęboka i stabilna.',
    symptoms: 'Poczucie lekkości, łatwiejsze wchodzenie w stan skupienia przy pracy umysłowej.',
    tips: 'Zaplanuj wymagające zadanie intelektualne i zobacz, jak płynnie pracuje Twój umysł.',
    mentalBoost: 'Jesteś o krok od zamknięcia pierwszego pełnego tygodnia absolutnej wolności!'
  },
  {
    id: 'm-1w',
    code: '1W',
    name: '1 Tydzień',
    seconds: 7 * 24 * 3600,
    phase: 'Faza 4: Reset Architektury Snu (NREM / REM)',
    benefit: 'Drastyczny wzrost fazy snu głębokiego',
    description: 'Znaczący wzrost udziału snu głębokiego (Slow-Wave Sleep) w nocy. Następuje intensywna odnowa komórkowa mózgu, wzmocnienie odporności i pełna konsolidacja pamięci.',
    symptoms: 'Świeżość po przebudzeniu bez potrzeby budzika, stabilny nastrój przez cały dzień.',
    tips: 'Wykorzystaj poranną świeżość na medytację, czytanie lub poranny rozruch fizyczny.',
    mentalBoost: 'Cały tydzień wolności! Przełamałeś jeden z najsilniejszych nawyków współczesnego świata.'
  },
  {
    id: 'm-10d',
    code: '10D',
    name: '10 Dni',
    seconds: 10 * 24 * 3600,
    phase: 'Faza 5: Spadek Stanów Lękowych',
    benefit: 'Głęboki spokój układu nerwowego',
    description: 'Brak ciągłej stymulacji receptorów noradrenergicznych powoduje wyraźny spadek ogólnego poziomu napięcia, natłoku myśli i mikrostresów w codziennych sytuacjach.',
    symptoms: 'Zmniejszona reaktywność na stresory w pracy, opanowanie, niższe tętno spoczynkowe.',
    tips: 'Zauważ, o ile spokojniej reagujesz na trudne sytuacje i niespodziewane wyzwania.',
    mentalBoost: 'Spokój, którego szukałeś latami, był blokowany przez niewinną filiżankę kawy.'
  },
  {
    id: 'm-2w',
    code: '2W',
    name: '2 Tygodnie',
    seconds: 14 * 24 * 3600,
    phase: 'Faza 5: Homeostaza Dopaminowa',
    benefit: 'Uwrażliwienie receptorów dopaminy D2',
    description: 'Układ nagrody odzyskuje pełną, naturalną wrażliwość. Zaczynasz odczuwać autentyczną satysfakcję i motywację ze zwykłych, codziennych czynności.',
    symptoms: 'Radość z drobnych osiągnięć, głęboki sen, wysoka odporność psychiczna.',
    tips: 'Nagródź się za ten sukces – wyjście do kina, dobra kolacja lub wycieczka w naturę.',
    mentalBoost: '14 dni czystości! Twój mózg znowu potrafi cieszyć się życiem w sposób w 100% naturalny.'
  },
  {
    id: 'm-3w',
    code: '3W',
    name: '3 Tygodnie',
    seconds: 21 * 24 * 3600,
    phase: 'Faza 5: Trwały Nowy Nawyk',
    benefit: 'Ugruntowanie nowych ścieżek neuronalnych',
    description: 'Po 21 dniach mózg utrwala nowe automatyzmy. Poranna rutyna bez kawy jest naturalna i komfortowa. Zwiększyło się przyswajanie żelaza, wapnia i magnezu.',
    symptoms: 'Całkowity brak pociągu do kofeiny, doskonała kondycja cery, stabilna witalność.',
    tips: 'Bądź czujny w wyjątkowo stresujących momentach – to jedyne sytuacje, gdy dawny nawyk może zapukać.',
    mentalBoost: 'Trzy tygodnie! Stałeś się panem własnej biochemii i zbudowałeś żelazny nawyk.'
  },
  {
    id: 'm-1m',
    code: '1M',
    name: '1 Miesiąc',
    seconds: 30 * 24 * 3600,
    phase: 'Faza 6: Pełny Reset Metaboliczny',
    benefit: 'Całkowity reset metaboliczny i fizjologiczny',
    description: '30 dni pełnej wolności. Osiągnąłeś stan, w którym Twoje ciało perfekcyjnie samodzielnie syntetyzuje energię ATP. Kora przedczołowa pracuje w rytmie pełnej jasności.',
    symptoms: 'Naturalne budzenie się z energią, głęboki spokój wewnętrzny, zero stanów lękowych.',
    tips: 'Podziel się swoim sukcesem z innymi – jesteś inspiracją i żywym dowodem, że można żyć bez kofeiny.',
    mentalBoost: 'Miesiąc wolności! Wygrałeś zdrowie, odporność i krystaliczny spokój umysłu.'
  },
  {
    id: 'm-45d',
    code: '45D',
    name: '45 Dni',
    seconds: 45 * 24 * 3600,
    phase: 'Faza 6: Równowaga Kortyzolowa',
    benefit: 'Optymalny rytm dobowy i świeżość o poranku',
    description: 'Naturalna krzywa kortyzolu osiąga modelowy przebieg. Poziom energii w ciągu dnia jest w 100% zsynchronizowany z naturalnym światłem słonecznym.',
    symptoms: 'Natychmiastowa gotowość do działania po wstaniu z łóżka, brak ospałości porannej.',
    tips: 'Utrzymuj stałe pory snu i wstawania, by wzmocnić ten doskonały stan biologiczny.',
    mentalBoost: 'Półtora miesiąca niezłomności. Twoje ciało funkcjonuje jak szwajcarski zegarek!'
  },
  {
    id: 'm-2m',
    code: '2M',
    name: '2 Miesiące',
    seconds: 60 * 24 * 3600,
    phase: 'Faza 7: Nowa Tożsamość Wolności',
    benefit: 'Trwała transformacja stylu życia',
    description: 'Nie jesteś już osobą, która "odstawia kofeinę" – jesteś osobą, która jest naturalnie wolna. Dawne skojarzenia społeczne i nawykowe przestały mieć jakąkolwiek moc.',
    symptoms: 'Wysoka stabilność emocjonalna, głęboka regeneracja serca, żołądka i układu nerwowego.',
    tips: 'Pielęgnuj swoje nowe nawyki i ciesz się stabilną energią każdego pojedynczego dnia.',
    mentalBoost: '60 dni bez kofeiny! Zbudowałeś nową tożsamość człowieka w pełni niezależnego.'
  },
  {
    id: 'm-3m',
    code: '3M',
    name: '3 Miesiące',
    seconds: 90 * 24 * 3600,
    phase: 'Faza 7: Mistrzostwo Biochemii Mózgu',
    benefit: 'Kompletna neuroplastyczna stabilizacja',
    description: 'Pełny kwartał wolności. Gęstość receptorów w mózgu i wrażliwość układu nagrody osiągnęły stan sprzed jakiegokolwiek kontaktu z nałogiem. Absolutne mistrzostwo.',
    symptoms: 'Krystaliczna jasność myśli, optymalne ciśnienie krwi, doskonała jakość snu i regeneracji.',
    tips: 'Świętuj ten niezwykły kamień milowy z bliskimi. Twój sukces jest trwały i głęboki.',
    mentalBoost: 'Trzy miesiące! Należysz do elity osób, które odzyskały 100% kontroli nad własnym życiem.'
  },
  {
    id: 'm-6m',
    code: '6M',
    name: 'Pół Roku',
    seconds: 180 * 24 * 3600,
    phase: 'Faza 8: Żelazna Odporność & Wolność',
    benefit: 'Pół roku całkowitej niezależności',
    description: 'Pół roku życia w pełnej homeostazie. Twoje serce, układ trawienny, nadnercza i mózg funkcjonują w optymalnym zdrowiu bez żadnych sztucznych stymulantów.',
    symptoms: 'Wybitna odporność na stres, zrównoważony poziom energii w każdej porze roku.',
    tips: 'Zapisz swoje przemyślenia z tych 6 miesięcy jako drogowskaz na całe przyszłe życie.',
    mentalBoost: 'Pół roku wolności! Jesteś niezłomnym wzorem dyscypliny i troski o własne zdrowie.'
  },
  {
    id: 'm-1y',
    code: '1Y',
    name: '1 Rok',
    seconds: 365 * 24 * 3600,
    phase: 'Faza 8: Złoty Laur Całkowitej Wolności',
    benefit: 'Roczny cykl życia w absolutnej czystości',
    description: 'Pełny rok – 365 dni życia w autentycznej energii. Przetrwałeś każdą porę roku, każdy stresujący projekt i każdą okazję towarzyską bez sięgania po chemiczne wsparcie.',
    symptoms: 'Niezrównany spokój, optymalne zdrowie układu krążenia, perfekcyjna jakość snu.',
    tips: 'Jesteś żywą legendą wolności od stymulantów. Bądź dumny ze swojej niezwykłej drogi.',
    mentalBoost: '365 dni absolutnej wolności! Osiągnąłeś szczyt – to Twoje największe zwycięstwo!'
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

function getMilestoneCountdownInfo(milestoneSeconds: number, diffSeconds: number, lastIntake: number) {
  const isUnlocked = diffSeconds >= milestoneSeconds;
  if (isUnlocked) {
    return {
      isUnlocked: true,
      badgeText: 'Zdobyte! ✓',
      timeRemainingStr: 'Zdobyte!',
      targetDateStr: 'Etap zrealizowany',
      progressPercent: 100,
      remainingSec: 0,
    };
  }

  const remainingSec = Math.max(0, milestoneSeconds - diffSeconds);
  const targetDate = new Date(lastIntake + milestoneSeconds * 1000);
  const targetDateStr = format(targetDate, 'd MMMM yyyy, HH:mm', { locale: pl });
  
  const d = Math.floor(remainingSec / (3600 * 24));
  const h = Math.floor((remainingSec % (3600 * 24)) / 3600);
  const m = Math.floor((remainingSec % 3600) / 60);

  let badgeText = '';
  let timeRemainingStr = '';

  if (d > 0) {
    badgeText = `za ${d}d ${h > 0 ? `${h}h` : ''}`;
    timeRemainingStr = `${d} ${d === 1 ? 'dzień' : (d >= 2 && d <= 4) ? 'dni' : 'dni'}${h > 0 ? ` i ${h} godz.` : ''}`;
  } else if (h > 0) {
    badgeText = `za ${h}h ${m > 0 ? `${m}m` : ''}`;
    timeRemainingStr = `${h} ${h === 1 ? 'godzinę' : (h >= 2 && h <= 4) ? 'godziny' : 'godzin'}${m > 0 ? ` ${m} min` : ''}`;
  } else {
    badgeText = `za ${Math.max(1, m)} min`;
    timeRemainingStr = `${Math.max(1, m)} min`;
  }

  const progressPercent = Math.min(99, Math.max(0, Math.floor((diffSeconds / milestoneSeconds) * 100)));

  return {
    isUnlocked: false,
    badgeText,
    timeRemainingStr,
    targetDateStr,
    progressPercent,
    remainingSec,
  };
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
  const [isRingCardsCollapsed, setIsRingCardsCollapsed] = useState<boolean>(true);
  const [isTimePatternsCollapsed, setIsTimePatternsCollapsed] = useState<boolean>(true);
  const [showMilestoneCard, setShowMilestoneCard] = useState<boolean>(true);
  const quickFillScrollRef = useRef<HTMLDivElement>(null);

  // Settings Collapsible Accordions State
  const [openSettingsSections, setOpenSettingsSections] = useState<Record<string, boolean>>({
    theme: true,
    accent: false,
    milestone: false,
    notifications: false,
    pwa: false,
    statsStart: false,
    danger: false,
  });

  const toggleSettingsSection = (key: string) => {
    setOpenSettingsSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const expandAllSettings = () => {
    setOpenSettingsSections({
      theme: true,
      accent: true,
      milestone: true,
      notifications: true,
      pwa: true,
      statsStart: true,
      danger: true,
    });
  };

  const collapseAllSettings = () => {
    setOpenSettingsSections({
      theme: false,
      accent: false,
      milestone: false,
      notifications: false,
      pwa: false,
      statsStart: false,
      danger: false,
    });
  };

  // Modals & Sheets
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  // Stats Start Date & Reset State
  const [statsStartDate, setStatsStartDate] = useState<number>(Date.now() - 38 * 3600 * 1000);
  const [showStartDateModal, setShowStartDateModal] = useState<boolean>(false);
  const [customStartInputDate, setCustomStartInputDate] = useState<string>('');
  const [customStartInputHour, setCustomStartInputHour] = useState<string>('00:00');

  // Reset & Clear Data Modal State
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [resetModalType, setResetModalType] = useState<'factory' | 'logs' | 'timer' | null>(null);

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
    showStartDateModal,
    showResetConfirmModal,
  });

  useEffect(() => {
    navStateRef.current = {
      view,
      showAddModal,
      selectedMilestone,
      showInstallGuideModal,
      showStartDateModal,
      showResetConfirmModal,
    };
  }, [view, showAddModal, selectedMilestone, showInstallGuideModal, showStartDateModal, showResetConfirmModal]);

  useEffect(() => {
    const savedLogs = localStorage.getItem('zerocaff_logs') || localStorage.getItem('caffeine_logs');
    const savedIntake = localStorage.getItem('zerocaff_last_intake') || localStorage.getItem('caffeine_last_intake');
    const savedStatsStart = localStorage.getItem('zerocaff_stats_start_date');
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

    if (savedStatsStart) {
      setStatsStartDate(parseInt(savedStatsStart, 10));
    } else if (savedIntake) {
      setStatsStartDate(parseInt(savedIntake, 10));
    } else {
      const initialStart = Date.now() - 38 * 3600 * 1000;
      setStatsStartDate(initialStart);
      localStorage.setItem('zerocaff_stats_start_date', initialStart.toString());
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
    const savedShowMilestone = localStorage.getItem('zerocaff_show_milestone_card');
    if (savedShowMilestone !== null) {
      setShowMilestoneCard(savedShowMilestone === 'true');
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

    const handlePopState = () => {
      const state = navStateRef.current;

      // 1. If Milestone Detail Modal is open -> close it
      if (state.selectedMilestone) {
        setSelectedMilestone(null);
        navStateRef.current.selectedMilestone = null;
        return;
      }

      // 2. If Reset Confirm Modal is open -> close it
      if (state.showResetConfirmModal) {
        setShowResetConfirmModal(false);
        navStateRef.current.showResetConfirmModal = false;
        return;
      }

      // 3. If Start Date Modal is open -> close it
      if (state.showStartDateModal) {
        setShowStartDateModal(false);
        navStateRef.current.showStartDateModal = false;
        return;
      }

      // 4. If Install Guide Modal is open -> close it
      if (state.showInstallGuideModal) {
        setShowInstallGuideModal(false);
        navStateRef.current.showInstallGuideModal = false;
        return;
      }

      // 5. If Add Drink Modal is open -> close it
      if (state.showAddModal) {
        setShowAddModal(false);
        navStateRef.current.showAddModal = false;
        return;
      }

      // 6. If in subview ('stats' or 'settings') -> navigate back to 'home'
      if (state.view !== 'home') {
        setView('home');
        navStateRef.current.view = 'home';
        return;
      }
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

  const toggleShowMilestoneCard = (val?: boolean) => {
    const nextVal = typeof val === 'boolean' ? val : !showMilestoneCard;
    setShowMilestoneCard(nextVal);
    localStorage.setItem('zerocaff_show_milestone_card', nextVal.toString());
    showToast(nextVal ? "Karta następnego kamienia milowego jest widoczna" : "Ukryto kartę kamienia milowego na ekranie głównym");
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

  // Open add modal initialized with current date/time
  const handleOpenAddModal = () => {
    const currentDate = new Date();
    setCustomTimeDate(format(currentDate, 'yyyy-MM-dd'));
    setCustomTimeHour(format(currentDate, 'HH:mm'));
    setIsCustomTimeOpen(false);
    setShowAddModal(true);
    navStateRef.current.showAddModal = true;
  };

  const handleOpenMilestone = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    navStateRef.current.selectedMilestone = milestone;
  };

  const handleCloseMilestone = () => {
    setSelectedMilestone(null);
    navStateRef.current.selectedMilestone = null;
  };

  const handleOpenInstallGuide = () => {
    setShowInstallGuideModal(true);
    navStateRef.current.showInstallGuideModal = true;
  };

  const handleCloseInstallGuide = () => {
    setShowInstallGuideModal(false);
    navStateRef.current.showInstallGuideModal = false;
  };

  const handleOpenStartDateModal = () => {
    const d = new Date(statsStartDate);
    setCustomStartInputDate(format(d, 'yyyy-MM-dd'));
    setCustomStartInputHour(format(d, 'HH:mm'));
    setShowStartDateModal(true);
    navStateRef.current.showStartDateModal = true;
  };

  const handleCloseStartDateModal = () => {
    setShowStartDateModal(false);
    navStateRef.current.showStartDateModal = false;
  };

  const handleResetStatsToToday = (resetTimerToo = false) => {
    const todayZero = new Date();
    todayZero.setHours(0, 0, 0, 0);
    const startTimestamp = todayZero.getTime();
    
    setStatsStartDate(startTimestamp);
    localStorage.setItem('zerocaff_stats_start_date', startTimestamp.toString());
    
    if (resetTimerToo) {
      const nowTime = Date.now();
      setLastIntake(nowTime);
      localStorage.setItem('zerocaff_last_intake', nowTime.toString());
    }
    
    showToast("Statystyki i czyste dni liczone od dzisiaj!");
    setShowStartDateModal(false);
  };

  const handleSaveCustomStartDate = () => {
    if (!customStartInputDate) return;
    const [h, m] = (customStartInputHour || '00:00').split(':').map(Number);
    const chosenDate = new Date(customStartInputDate);
    chosenDate.setHours(h || 0, m || 0, 0, 0);
    const startTimestamp = chosenDate.getTime();
    
    setStatsStartDate(startTimestamp);
    localStorage.setItem('zerocaff_stats_start_date', startTimestamp.toString());
    showToast(`Punkt startowy zaktualizowany: ${format(chosenDate, 'd MMMM yyyy', { locale: pl })}`);
    setShowStartDateModal(false);
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

  const handleOpenResetModal = (type: 'factory' | 'logs' | 'timer') => {
    setResetModalType(type);
    setShowResetConfirmModal(true);
    navStateRef.current.showResetConfirmModal = true;
  };

  const handleCloseResetModal = () => {
    setShowResetConfirmModal(false);
    setResetModalType(null);
    navStateRef.current.showResetConfirmModal = false;
  };

  const executeClearLogs = () => {
    setLogs([]);
    localStorage.setItem('zerocaff_logs', '[]');
    handleCloseResetModal();
    showToast("Historia wszystkich wpisów napojów została pomyślnie wyczyszczona.");
  };

  const executeResetTimer = () => {
    const nowTs = Date.now();
    setLastIntake(nowTs);
    localStorage.setItem('zerocaff_last_intake', nowTs.toString());
    handleCloseResetModal();
    showToast("Licznik abstynencji został pomyślnie zresetowany do teraz (00:00:00).");
  };

  const executeFactoryReset = () => {
    localStorage.clear();
    setLogs([]);
    const start = Date.now();
    setLastIntake(start);
    setStatsStartDate(start);
    setTheme('dark');
    setAccentKey('orange');
    setAddBtnStyle('pill');
    setNotificationsEnabled(true);
    setShowMilestoneCard(true);
    
    // Explicitly write clean fresh defaults to localStorage
    localStorage.setItem('zerocaff_last_intake', start.toString());
    localStorage.setItem('zerocaff_stats_start_date', start.toString());
    localStorage.setItem('zerocaff_logs', '[]');
    localStorage.setItem('zerocaff_theme', 'dark');
    localStorage.setItem('zerocaff_accent', 'orange');
    localStorage.setItem('zerocaff_add_btn_style', 'pill');
    localStorage.setItem('zerocaff_notif_enabled', 'true');
    localStorage.setItem('zerocaff_show_milestone_card', 'true');
    
    handleCloseResetModal();
    showToast("Pomyślnie wyczyszczono wszystkie dane i zresetowano aplikację do stanu fabrycznego.");
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
  const statsStartDateZero = new Date(statsStartDate);
  statsStartDateZero.setHours(0, 0, 0, 0);

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

    const isBeforeStatsStart = date.getTime() < statsStartDateZero.getTime();

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
      isBeforeStatsStart,
    };
  });

  const trackedChartDays = chartData60.filter(d => !d.isBeforeStatsStart);
  const totalTrackedDaysCount = Math.max(1, trackedChartDays.length);
  const cleanDaysSinceStart = trackedChartDays.filter(d => d.mg === 0).length;
  const cleanDaysSinceStartPercent = Math.round((cleanDaysSinceStart / totalTrackedDaysCount) * 100);
  const totalMgSinceStart = trackedChartDays.reduce((sum, d) => sum + d.mg, 0);
  const avgDailyMgSinceStart = Math.round(totalMgSinceStart / totalTrackedDaysCount);

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

          {/* PRZYCISK USTAWIEŃ I OPCJI NA GÓRZE */}
          <button
            id="nav-settings-btn"
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

                {/* EXPLICIT RING VALUE CARDS (COLLAPSIBLE / EXPANDABLE) */}
                <div className="w-full mb-4">
                  <div className="flex items-center justify-between px-1 mb-1.5 text-[11px] font-semibold text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <span>Odczyt pierścieni czasu</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsRingCardsCollapsed(!isRingCardsCollapsed)}
                      className={`text-[11px] px-2 py-0.5 rounded-lg border flex items-center gap-1 font-semibold transition-all ${innerItemBg} hover:border-zinc-500`}
                      style={{ color: currentAccent.primary }}
                    >
                      <span>{isRingCardsCollapsed ? 'Rozwiń szczegóły' : 'Zwiń'}</span>
                      {isRingCardsCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                    </button>
                  </div>

                  {isRingCardsCollapsed ? (
                    /* Compact Summary Strip when Collapsed */
                    <div 
                      onClick={() => setIsRingCardsCollapsed(false)}
                      className={`w-full p-2.5 rounded-2xl border flex items-center justify-around cursor-pointer backdrop-blur-sm transition-all hover:border-zinc-500 active:scale-[0.99] ${cardClasses}`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: currentAccent.primary }} />
                        <span className={muteTextClasses}>Dni:</span>
                        <span className="font-bold">{days}d</span>
                        <span className={`text-[10px] ${muteTextClasses}`}>({Math.round(daysCycleProgress)}%)</span>
                      </div>
                      <div className="h-3 w-[1px] bg-zinc-700/50" />
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                        <span className={muteTextClasses}>Godz:</span>
                        <span className="font-bold">{hours}h</span>
                        <span className={`text-[10px] ${muteTextClasses}`}>({Math.round(hoursProgress)}%)</span>
                      </div>
                      <div className="h-3 w-[1px] bg-zinc-700/50" />
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
                        <span className={muteTextClasses}>Min:</span>
                        <span className="font-bold">{minutes}m</span>
                      </div>
                    </div>
                  ) : (
                    /* Expanded 3 Detail Cards */
                    <div className="grid grid-cols-3 gap-2 w-full animate-in fade-in duration-200">
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
                  )}
                </div>

                {/* CURRENT / NEXT MILESTONE ACTIVE CARD (COLLAPSIBLE / TOGGLEABLE) */}
                {showMilestoneCard ? (
                  <div 
                    onClick={() => handleOpenMilestone(nextMilestone)}
                    className={`w-full rounded-3xl p-5 border relative overflow-hidden backdrop-blur-md cursor-pointer transition-all group ${cardClasses}`}
                  >
                    <div 
                      className="absolute top-0 right-0 w-36 h-36 blur-3xl rounded-full opacity-20"
                      style={{ backgroundColor: currentAccent.primary }}
                    />
                    
                    <div className="flex justify-between items-start mb-3 relative z-10">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div 
                          className="w-8 h-8 rounded-xl flex items-center justify-center border shrink-0"
                          style={{
                            backgroundColor: currentAccent.badgeBg,
                            color: currentAccent.primary,
                            borderColor: currentAccent.badgeBorder
                          }}
                        >
                          <Trophy size={16} />
                        </div>
                        <div className="min-w-0">
                          <span 
                            className="text-[10px] font-bold uppercase tracking-wider block"
                            style={{ color: currentAccent.primary }}
                          >
                            Następny Kamień Milowy
                          </span>
                          <h3 className="text-base font-semibold flex items-center gap-1.5 truncate">
                            {nextMilestone.name}
                            <ChevronRight size={14} className={`${muteTextClasses} group-hover:translate-x-0.5 transition-transform shrink-0`} />
                          </h3>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right pb-0.5">
                          <p className={`text-[10px] font-bold ${muteTextClasses}`}>
                            {remainingDays > 0 ? `${remainingDays}d ${remainingHours}h` : `${remainingHours}h ${remainingMins}m`} do celu
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleShowMilestoneCard(false);
                          }}
                          className={`p-1.5 rounded-xl border transition-all ${innerItemBg} hover:border-zinc-500 text-zinc-400 hover:text-zinc-200`}
                          title="Zwiń / wyłącz tę kartę"
                        >
                          <EyeOff size={13} />
                        </button>
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
                      <span className="text-[10px] font-semibold text-cyan-400 shrink-0 ml-2">Szczegóły ▾</span>
                    </div>
                  </div>
                ) : (
                  /* Compact Ribbon when Card is Disabled/Collapsed */
                  <div className={`w-full p-3 px-4 rounded-2xl border flex items-center justify-between backdrop-blur-sm transition-all ${cardClasses}`}>
                    <div 
                      onClick={() => handleOpenMilestone(nextMilestone)}
                      className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                    >
                      <Trophy size={16} style={{ color: currentAccent.primary }} className="shrink-0" />
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-xs font-semibold truncate">
                          Następny cel: <strong style={{ color: currentAccent.primary }}>{nextMilestone.name}</strong>
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border shrink-0 ${theme === 'light' ? 'bg-zinc-100 border-zinc-300' : 'bg-zinc-800 border-zinc-700'}`}>
                          {Math.floor(milestoneProgress)}%
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleShowMilestoneCard(true)}
                      className={`text-[11px] px-2.5 py-1 rounded-xl border flex items-center gap-1.5 font-semibold transition-all shrink-0 ${innerItemBg} hover:border-zinc-500 active:scale-95`}
                      style={{ color: currentAccent.primary }}
                    >
                      <Eye size={12} />
                      <span>Rozwiń kartę</span>
                    </button>
                  </div>
                )}

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
                            const info = getMilestoneCountdownInfo(milestone.seconds, diffSeconds, lastIntake);

                            return (
                              <motion.button
                                key={milestone.id}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleOpenMilestone(milestone)}
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

                                {/* Countdown / Status Micro Badge */}
                                <span 
                                  className={`text-[8px] font-bold mt-1 px-1.5 py-0.5 rounded-md truncate max-w-full border ${
                                    isUnlocked 
                                      ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                                      : isNext
                                      ? 'border-cyan-500/40 text-cyan-400 bg-cyan-500/15'
                                      : 'border-zinc-500/20 text-zinc-400 bg-zinc-500/10'
                                  }`}
                                >
                                  {info.badgeText}
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
                    <p className={`text-xs ${muteTextClasses}`}>
                      Liczone od {format(new Date(statsStartDate), 'd MMMM yyyy', { locale: pl })} • <span className="font-semibold text-emerald-400">{cleanDaysSinceStart} czystych dni ({cleanDaysSinceStartPercent}%)</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateToView('settings')}
                    className="px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all hover:opacity-80 active:scale-95 shadow-sm"
                    style={{
                      backgroundColor: currentAccent.badgeBg,
                      color: currentAccent.primary,
                      borderColor: currentAccent.badgeBorder
                    }}
                    title="Przejdź do ustawień, aby zmienić punkt startowy"
                  >
                    <Sliders size={13} />
                    <span>Ustawienia</span>
                  </button>
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
                        {chartViewMode === 'daily' ? 'Czyste dni (od startu)' : 'Czyste tygodnie'}
                      </div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">
                        {chartViewMode === 'daily' ? `${cleanDaysSinceStart} / ${totalTrackedDaysCount}` : `${cleanWeeksCount} / 12`}
                      </div>
                    </div>
                    <div className={`p-2.5 rounded-2xl border text-center ${innerItemBg}`}>
                      <div className={`text-[9px] font-bold uppercase tracking-wider ${muteTextClasses}`}>
                        {chartViewMode === 'daily' ? 'Śr. dzienna (od startu)' : 'Śr. tygodniowa'}
                      </div>
                      <div className="text-sm font-bold mt-0.5" style={{ color: currentAccent.primary }}>
                        {chartViewMode === 'daily' ? `~${avgDailyMgSinceStart} mg` : `~${avgWeeklyMg} mg`}
                      </div>
                    </div>
                    <div className={`p-2.5 rounded-2xl border text-center ${innerItemBg}`}>
                      <div className={`text-[9px] font-bold uppercase tracking-wider ${muteTextClasses}`}>
                        {chartViewMode === 'daily' ? 'Suma (od startu)' : 'Suma kofeiny'}
                      </div>
                      <div className="text-sm font-bold mt-0.5">
                        {chartViewMode === 'daily' ? `${totalMgSinceStart} mg` : `${totalWeeklyMg} mg`}
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

                  {/* D3-Powered Chart Rendering Container */}
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
                        <D3CaffeineChart
                          viewMode="daily"
                          dailyData={chartData60WithTrend}
                          weeklyData={weeklyChartDataWithTrend}
                          accentColor={currentAccent.primary}
                          accentGlow={currentAccent.glow}
                          badgeBg={currentAccent.badgeBg}
                          badgeBorder={currentAccent.badgeBorder}
                          theme={theme}
                          isDeclining={isDeclining60}
                          isIncreasing={isIncreasing60}
                          totalMg={total60DayMg}
                          modalBgClass={modalBg}
                          subTextClass={subTextClasses}
                          muteTextClass={muteTextClasses}
                          scrollContainerRef={dailyChartScrollRef}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-[230px]">
                      <D3CaffeineChart
                        viewMode="weekly"
                        dailyData={chartData60WithTrend}
                        weeklyData={weeklyChartDataWithTrend}
                        accentColor={currentAccent.primary}
                        accentGlow={currentAccent.glow}
                        badgeBg={currentAccent.badgeBg}
                        badgeBorder={currentAccent.badgeBorder}
                        theme={theme}
                        isDeclining={isDecliningW}
                        isIncreasing={isIncreasingW}
                        totalMg={totalWeeklyMg}
                        modalBgClass={modalBg}
                        subTextClass={subTextClasses}
                        muteTextClass={muteTextClasses}
                      />
                    </div>
                  )}
                </div>

                {/* SZYBKIE UZUPEŁNIANIE KALENDARZA (60 DNI) - ZWARTA KARTA AKCJI */}
                <div 
                  id="quick-calendar-filler-card"
                  onClick={() => setShowQuickFillModal(true)}
                  className={`border rounded-2xl p-3 sm:px-4 backdrop-blur-sm cursor-pointer group transition-all relative overflow-hidden active:scale-[0.99] hover:border-zinc-500/50 ${cardClasses}`}
                >
                  <div 
                    className="absolute -right-8 -top-8 w-28 h-28 blur-2xl rounded-full opacity-15 pointer-events-none transition-opacity group-hover:opacity-30"
                    style={{ backgroundColor: currentAccent.primary }}
                  />

                  <div className="flex items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: currentAccent.badgeBg,
                          borderColor: currentAccent.badgeBorder,
                          color: currentAccent.primary,
                        }}
                      >
                        <CalendarDays size={18} />
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="text-sm font-bold tracking-tight truncate">
                          Szybkie Uzupełnianie Kalendarza
                        </h3>
                        <span 
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0"
                          style={{
                            backgroundColor: currentAccent.badgeBg,
                            borderColor: currentAccent.badgeBorder,
                            color: currentAccent.primary,
                          }}
                        >
                          60 dni
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <span 
                        className="text-xs font-semibold hidden sm:inline-block transition-colors group-hover:text-white"
                        style={{ color: currentAccent.primary }}
                      >
                        Otwórz
                      </span>
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all group-hover:translate-x-0.5"
                        style={{
                          backgroundColor: currentAccent.badgeBg,
                          borderColor: currentAccent.badgeBorder,
                          color: currentAccent.primary,
                        }}
                      >
                        <ChevronRight size={15} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* NAJCZĘSTSZE PORY SPOŻYCIA (COLLAPSIBLE / EXPANDABLE) */}
                <div className={`border rounded-3xl p-5 backdrop-blur-sm ${cardClasses}`}>
                  <div 
                    onClick={() => setIsTimePatternsCollapsed(!isTimePatternsCollapsed)}
                    className="flex items-center justify-between cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={16} style={{ color: currentAccent.primary }} />
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider">
                          Najczęstsze Pory Spożycia
                        </h3>
                        <span className={`text-[10px] ${muteTextClasses}`}>
                          {peakBucket && peakBucket.count > 0 
                            ? `Główne okno: ${peakBucket.label} (${peakBucket.timeRange})` 
                            : 'Analiza rytmu dobowego'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTimePatternsCollapsed(!isTimePatternsCollapsed);
                      }}
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl border transition-all ${innerItemBg} hover:opacity-90`}
                      style={{ color: currentAccent.primary }}
                    >
                      <span>{isTimePatternsCollapsed ? 'Rozwiń' : 'Zwiń'}</span>
                      {isTimePatternsCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                  </div>

                  {/* Collapsed Compact View */}
                  {isTimePatternsCollapsed && (
                    <div 
                      onClick={() => setIsTimePatternsCollapsed(false)}
                      className={`mt-3 p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:border-zinc-500 active:scale-[0.99] ${innerItemBg}`}
                    >
                      <div className="flex items-center gap-2 text-xs">
                        {peakBucket && peakBucket.count > 0 ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                            <span className="font-semibold">Szczyt: {peakBucket.label} ({peakBucket.count}x napojów)</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                            <span className={subTextClasses}>Brak utrwalonych godzin ryzyka</span>
                          </>
                        )}
                      </div>
                      <span className={`text-[10px] font-semibold ${muteTextClasses}`}>Pokaż 4 pory dnia ▾</span>
                    </div>
                  )}

                  {/* Expanded Full View */}
                  {!isTimePatternsCollapsed && (
                    <div className="mt-4 space-y-3 animate-in fade-in duration-200">
                      <p className={`text-xs ${muteTextClasses}`}>
                        Analiza historii wskazuje momenty dnia, w których najczęściej sięgasz po kofeinę, ułatwiając przełamanie nawyku.
                      </p>

                      {/* Critical Window Diagnosis Card (if entries exist) */}
                      {peakBucket && peakBucket.count > 0 ? (
                        <div className="p-3.5 rounded-2xl border bg-orange-500/10 border-orange-500/30">
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
                        <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2">
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
                  )}
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

            {/* VIEW 3: COMPACT COLLAPSIBLE SETTINGS MENU */}
            {view === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="px-6 space-y-3.5"
              >
                {/* Header with Quick Expand / Collapse all */}
                <div className="flex items-end justify-between pt-1 pb-1">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Ustawienia</h2>
                    <p className={`text-xs ${muteTextClasses}`}>Dostosuj motyw, powiadomienia i preferencje</p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={expandAllSettings}
                      className={`${muteTextClasses} hover:text-zinc-200 transition-colors px-1.5 py-0.5`}
                    >
                      Rozwiń
                    </button>
                    <span className={muteTextClasses}>•</span>
                    <button
                      type="button"
                      onClick={collapseAllSettings}
                      className={`${muteTextClasses} hover:text-zinc-200 transition-colors px-1.5 py-0.5`}
                    >
                      Zwiń
                    </button>
                  </div>
                </div>

                {/* 1. ACCORDION ITEM: MOTYW WIZUALNY */}
                <div className={`border rounded-3xl backdrop-blur-sm transition-all overflow-hidden ${cardClasses}`}>
                  <button
                    type="button"
                    onClick={() => toggleSettingsSection('theme')}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-white/[0.02] focus:outline-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: currentAccent.badgeBg,
                          color: currentAccent.primary,
                          borderColor: currentAccent.badgeBorder
                        }}
                      >
                        <Palette size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold tracking-tight truncate">Motyw Wizualny</h3>
                        <p className={`text-[11px] truncate ${muteTextClasses}`}>Styl tła i kontrastu interfejsu</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: currentAccent.badgeBg,
                          color: currentAccent.badgeText,
                          borderColor: currentAccent.badgeBorder
                        }}
                      >
                        {theme === 'dark' ? 'Ciemny' : theme === 'gray' ? 'Szary' : 'Jasny'}
                      </span>
                      <ChevronDown 
                        size={17} 
                        className={`transition-transform duration-300 ${muteTextClasses} ${openSettingsSections.theme ? 'rotate-180 text-zinc-200' : ''}`} 
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {openSettingsSections.theme && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 border-t border-zinc-500/10 space-y-3">
                          <p className={`text-xs ${muteTextClasses}`}>
                            Wybierz styl tła dopasowany do Twojego wzroku i oświetlenia.
                          </p>

                          <div className="grid grid-cols-3 gap-2">
                            {/* Dark Theme */}
                            <button
                              onClick={() => handleThemeChange('dark')}
                              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${
                                theme === 'dark' 
                                  ? 'border-2 bg-zinc-950 text-white shadow-md'
                                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                              }`}
                              style={theme === 'dark' ? { borderColor: currentAccent.primary, boxShadow: `0 0 12px ${currentAccent.glow}` } : {}}
                            >
                              <Moon size={18} className={theme === 'dark' ? 'text-white' : 'text-zinc-500'} />
                              <span className="text-xs font-bold">Ciemny</span>
                            </button>

                            {/* Gray (Pośredni) Theme */}
                            <button
                              onClick={() => handleThemeChange('gray')}
                              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${
                                theme === 'gray' 
                                  ? 'border-2 bg-[#20222c] text-white shadow-md'
                                  : 'bg-[#20222c]/50 border-slate-700 text-slate-400 hover:text-slate-200'
                              }`}
                              style={theme === 'gray' ? { borderColor: currentAccent.primary, boxShadow: `0 0 12px ${currentAccent.glow}` } : {}}
                            >
                              <Monitor size={18} className={theme === 'gray' ? 'text-white' : 'text-slate-400'} />
                              <span className="text-xs font-bold">Szary</span>
                            </button>

                            {/* Light Theme */}
                            <button
                              onClick={() => handleThemeChange('light')}
                              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${
                                theme === 'light' 
                                  ? 'border-2 bg-white text-zinc-900 shadow-md'
                                  : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900'
                              }`}
                              style={theme === 'light' ? { borderColor: currentAccent.primary, boxShadow: `0 0 12px ${currentAccent.glow}` } : {}}
                            >
                              <Sun size={18} className={theme === 'light' ? 'text-amber-500' : 'text-zinc-400'} />
                              <span className="text-xs font-bold">Jasny</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Subtle horizontal divider between Theme and Accent */}
                <div className="flex items-center px-4 py-0.5">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-500/20 to-transparent" />
                </div>

                {/* 2. ACCORDION ITEM: KOLOR WIODĄCY (Z NOWYMI KOLORAMI) */}
                <div className={`border rounded-3xl backdrop-blur-sm transition-all overflow-hidden ${cardClasses}`}>
                  <button
                    type="button"
                    onClick={() => toggleSettingsSection('accent')}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-white/[0.02] focus:outline-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: currentAccent.badgeBg,
                          color: currentAccent.primary,
                          borderColor: currentAccent.badgeBorder
                        }}
                      >
                        <Sparkles size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold tracking-tight truncate">Kolor Wiodący</h3>
                        <p className={`text-[11px] truncate ${muteTextClasses}`}>Kolor pierścienia dni, wykresów i akcentów</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border" style={{ backgroundColor: currentAccent.badgeBg, borderColor: currentAccent.badgeBorder }}>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentAccent.primary }} />
                        <span className="text-[10px] font-bold" style={{ color: currentAccent.badgeText }}>
                          {currentAccent.name}
                        </span>
                      </div>
                      <ChevronDown 
                        size={17} 
                        className={`transition-transform duration-300 ${muteTextClasses} ${openSettingsSections.accent ? 'rotate-180 text-zinc-200' : ''}`} 
                        />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {openSettingsSections.accent && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 border-t border-zinc-500/10 space-y-3">
                          <p className={`text-xs ${muteTextClasses}`}>
                            Wybierz jeden z 10 wyrazistych wariantów kolorystycznych:
                          </p>

                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {Object.values(ACCENT_PALETTES).map((pal) => {
                              const isSelected = accentKey === pal.key;
                              return (
                                <button
                                  key={pal.key}
                                  id={`accent-btn-${pal.key}`}
                                  onClick={() => handleAccentChange(pal.key)}
                                  className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] relative ${
                                    isSelected 
                                      ? 'border-2 font-bold shadow-md' 
                                      : `${innerItemBg} hover:border-zinc-500`
                                  }`}
                                  style={isSelected ? { borderColor: pal.primary } : {}}
                                >
                                  <div 
                                    className="w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                                    style={{ 
                                      background: pal.key === 'sunset' 
                                        ? 'linear-gradient(135deg, #7c3aed 0%, #d946ef 50%, #f59e0b 100%)' 
                                        : pal.primary 
                                    }}
                                  >
                                    {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                                  </div>
                                  <span className="text-[11px] truncate max-w-full font-medium">{pal.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Subtle horizontal divider between Accent and Milestone */}
                <div className="flex items-center px-4 py-0.5">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-500/20 to-transparent" />
                </div>

                {/* 3. ACCORDION ITEM: KARTA KAMIENIA MILOWEGO */}
                <div className={`border rounded-3xl backdrop-blur-sm transition-all overflow-hidden ${cardClasses}`}>
                  <button
                    type="button"
                    onClick={() => toggleSettingsSection('milestone')}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-white/[0.02] focus:outline-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: currentAccent.badgeBg,
                          color: currentAccent.primary,
                          borderColor: currentAccent.badgeBorder
                        }}
                      >
                        <Trophy size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold tracking-tight truncate">Kamienie Milowe</h3>
                        <p className={`text-[11px] truncate ${muteTextClasses}`}>Karta aktywnego celu na ekranie głównym</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span 
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          !showMilestoneCard ? (theme === 'light' ? 'bg-zinc-100 border-zinc-300 text-zinc-600' : 'bg-zinc-800 border-zinc-700 text-zinc-400') : ''
                        }`}
                        style={showMilestoneCard ? {
                          backgroundColor: currentAccent.badgeBg,
                          color: currentAccent.primary,
                          borderColor: currentAccent.badgeBorder,
                        } : {}}
                      >
                        {showMilestoneCard ? 'Widoczna' : 'Ukryta'}
                      </span>
                      <ChevronDown 
                        size={17} 
                        className={`transition-transform duration-300 ${muteTextClasses} ${openSettingsSections.milestone ? 'rotate-180 text-zinc-200' : ''}`} 
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {openSettingsSections.milestone && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 border-t border-zinc-500/10 space-y-3">
                          <p className={`text-xs ${muteTextClasses}`}>
                            Steruj widocznością dużej karty aktywnego kamienia milowego i paska postępu na ekranie głównym.
                          </p>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => toggleShowMilestoneCard(true)}
                              className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                                showMilestoneCard 
                                  ? 'border-2 text-white shadow-md' 
                                  : `${innerItemBg} hover:border-zinc-500`
                              }`}
                              style={showMilestoneCard ? { backgroundColor: currentAccent.primary, borderColor: currentAccent.primary } : {}}
                            >
                              <Eye size={14} />
                              <span>Włączona</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleShowMilestoneCard(false)}
                              className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                                !showMilestoneCard 
                                  ? 'border-2 border-zinc-500 font-bold bg-zinc-800/80 text-white' 
                                  : `${innerItemBg} hover:border-zinc-500`
                              }`}
                            >
                              <EyeOff size={14} />
                              <span>Ukryta</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 4. ACCORDION ITEM: POWIADOMIENIA SYSTEMOWE */}
                <div className={`border rounded-3xl backdrop-blur-sm transition-all overflow-hidden ${cardClasses}`}>
                  <button
                    type="button"
                    onClick={() => toggleSettingsSection('notifications')}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-white/[0.02] focus:outline-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: currentAccent.badgeBg,
                          color: currentAccent.primary,
                          borderColor: currentAccent.badgeBorder
                        }}
                      >
                        <Bell size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold tracking-tight truncate">Powiadomienia</h3>
                        <p className={`text-[11px] truncate ${muteTextClasses}`}>Alerty o kamieniach i rekordach detoksu</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span 
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          notificationPermission === 'granted'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : notificationPermission === 'denied'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {notificationPermission === 'granted' ? 'Aktywne' : notificationPermission === 'denied' ? 'Zablokowane' : 'Wymaga Zgody'}
                      </span>
                      <ChevronDown 
                        size={17} 
                        className={`transition-transform duration-300 ${muteTextClasses} ${openSettingsSections.notifications ? 'rotate-180 text-zinc-200' : ''}`} 
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {openSettingsSections.notifications && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 border-t border-zinc-500/10 space-y-3">
                          <p className={`text-xs ${muteTextClasses}`}>
                            Otrzymuj natychmiastowe powiadomienia na telefonie lub komputerze, gdy osiągniesz nowy kamień milowy lub pobijesz swój rekord.
                          </p>

                          <div className="space-y-2">
                            {notificationPermission !== 'granted' && (
                              <button
                                onClick={requestNotificationPermission}
                                className="w-full py-2.5 px-3.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                                style={{
                                  backgroundColor: currentAccent.primary,
                                  boxShadow: `0 0 12px ${currentAccent.glow}`
                                }}
                              >
                                <BellRing size={15} />
                                Włącz powiadomienia w przeglądarce
                              </button>
                            )}

                            <button
                              onClick={sendTestNotification}
                              className={`w-full py-2 px-3.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${innerItemBg} hover:border-zinc-500`}
                            >
                              <Sparkles size={14} style={{ color: currentAccent.primary }} />
                              Wyślij testowe powiadomienie
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 5. ACCORDION ITEM: PWA & AKTUALIZACJE */}
                <div className={`border rounded-3xl backdrop-blur-sm transition-all overflow-hidden ${cardClasses}`}>
                  <button
                    type="button"
                    onClick={() => toggleSettingsSection('pwa')}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-white/[0.02] focus:outline-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: currentAccent.badgeBg,
                          color: currentAccent.primary,
                          borderColor: currentAccent.badgeBorder
                        }}
                      >
                        <Smartphone size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold tracking-tight truncate">Aplikacja & PWA</h3>
                        <p className={`text-[11px] truncate ${muteTextClasses}`}>Wersja v{APP_VERSION} • 100% Offline</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
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
                      <ChevronDown 
                        size={17} 
                        className={`transition-transform duration-300 ${muteTextClasses} ${openSettingsSections.pwa ? 'rotate-180 text-zinc-200' : ''}`} 
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {openSettingsSections.pwa && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 border-t border-zinc-500/10 space-y-3">
                          <p className={`text-xs ${muteTextClasses}`}>
                            ZeroCaff działa w pełni offline i jest przystosowana do instalacji na telefonie jako natywna aplikacja PWA.
                          </p>

                          {updateAvailable && (
                            <div 
                              className="p-3 rounded-xl border flex flex-col gap-2"
                              style={{
                                backgroundColor: currentAccent.badgeBg,
                                borderColor: currentAccent.primary
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <ArrowUpCircle size={16} style={{ color: currentAccent.primary }} className="animate-bounce" />
                                <span className="text-xs font-bold" style={{ color: currentAccent.badgeText }}>
                                  Dostępna nowa wersja!
                                </span>
                              </div>
                              <p className={`text-[11px] ${subTextClasses}`}>
                                {serverVersionInfo?.description || "Kliknij poniżej, aby natychmiast zaktualizować aplikację."}
                              </p>
                              <button
                                onClick={applyUpdate}
                                className="w-full py-2 px-3 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-95"
                                style={{
                                  backgroundColor: currentAccent.primary,
                                  boxShadow: `0 0 10px ${currentAccent.glow}`
                                }}
                              >
                                <RefreshCw size={13} className="animate-spin" />
                                Zaktualizuj teraz
                              </button>
                            </div>
                          )}

                          <div className="space-y-2">
                            <button
                              onClick={() => checkForUpdate(true)}
                              disabled={isCheckingUpdate}
                              className={`w-full py-2 px-3.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${innerItemBg} hover:border-zinc-500 disabled:opacity-50`}
                            >
                              <RefreshCw size={13} className={isCheckingUpdate ? "animate-spin" : ""} style={{ color: currentAccent.primary }} />
                              {isCheckingUpdate ? "Sprawdzanie serwera..." : "Sprawdź dostępność aktualizacji"}
                            </button>

                            {!isStandalone ? (
                              <button
                                onClick={handleInstallPWA}
                                className="w-full py-2 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] hover:opacity-90 active:scale-95"
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
                              <div className={`w-full py-2 px-3 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-2 ${innerItemBg} text-emerald-400 border-emerald-500/20`}>
                                <CheckCircle size={14} />
                                Aplikacja działa jako zainstalowana PWA
                              </div>
                            )}

                            <button
                              onClick={() => {
                                setUpdateAvailable(true);
                                setUpdateBannerDismissed(false);
                                showToast("Włączono testowe okienko aktualizacji!");
                              }}
                              className={`w-full py-1.5 px-3 rounded-lg text-[10px] ${muteTextClasses} hover:text-zinc-300 transition-all duration-200 hover:scale-[1.01] flex items-center justify-center gap-1.5`}
                            >
                              <Sparkles size={11} />
                              Przetestuj okienko wykrycia nowej wersji
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 6. ACCORDION ITEM: PUNKT STARTOWY STATYSTYK */}
                <div className={`border rounded-3xl backdrop-blur-sm transition-all overflow-hidden ${cardClasses}`}>
                  <button
                    type="button"
                    onClick={() => toggleSettingsSection('statsStart')}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-white/[0.02] focus:outline-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: currentAccent.badgeBg,
                          color: currentAccent.primary,
                          borderColor: currentAccent.badgeBorder
                        }}
                      >
                        <CalendarClock size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold tracking-tight truncate">Punkt Startowy Statystyk</h3>
                        <p className={`text-[11px] truncate ${muteTextClasses}`}>Zakres zliczania czystych dni i średnich</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: currentAccent.badgeBg,
                          color: currentAccent.badgeText,
                          borderColor: currentAccent.badgeBorder
                        }}
                      >
                        {totalTrackedDaysCount} {totalTrackedDaysCount === 1 ? 'dzień' : 'dni'}
                      </span>
                      <ChevronDown 
                        size={17} 
                        className={`transition-transform duration-300 ${muteTextClasses} ${openSettingsSections.statsStart ? 'rotate-180 text-zinc-200' : ''}`} 
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {openSettingsSections.statsStart && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 border-t border-zinc-500/10 space-y-3">
                          <p className={`text-xs ${muteTextClasses}`}>
                            Określa, od jakiej daty aplikacja zlicza Twoje statystyki, czyste dni i średnie bez potrzeby cofania się o 60 dni.
                          </p>

                          <div className={`p-3 rounded-2xl border flex items-center justify-between ${innerItemBg}`}>
                            <div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider block ${muteTextClasses}`}>
                                Aktualny start
                              </span>
                              <span className="text-xs font-bold">
                                {format(new Date(statsStartDate), 'd MMMM yyyy, HH:mm', { locale: pl })}
                              </span>
                            </div>
                            <span 
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                              style={{
                                backgroundColor: currentAccent.badgeBg,
                                color: currentAccent.badgeText,
                                borderColor: currentAccent.badgeBorder
                              }}
                            >
                              {totalTrackedDaysCount} dni
                            </span>
                          </div>

                          <div className="space-y-2">
                            <button
                              onClick={() => handleResetStatsToToday(false)}
                              className="w-full py-2.5 px-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                              style={{ backgroundColor: currentAccent.primary }}
                            >
                              <Sparkles size={15} />
                              Licz statystyki od dziś (00:00)
                            </button>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleResetStatsToToday(true)}
                                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-95 ${innerItemBg} hover:border-zinc-500`}
                                title="Zresetuj punkt startowy oraz timer główny do teraz"
                              >
                                <RotateCcw size={13} style={{ color: currentAccent.primary }} />
                                <span>Od teraz + timer</span>
                              </button>

                              <button
                                onClick={handleOpenStartDateModal}
                                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 hover:scale-[1.02] active:scale-95 ${innerItemBg} hover:border-zinc-500`}
                              >
                                <Calendar size={13} style={{ color: currentAccent.primary }} />
                                <span>Własna data</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 7. ACCORDION ITEM: ZARZĄDZANIE DANYMI I RESET */}
                <div className={`border border-red-500/25 rounded-3xl backdrop-blur-sm transition-all overflow-hidden ${cardClasses}`}>
                  <button
                    type="button"
                    onClick={() => toggleSettingsSection('danger')}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left transition-colors hover:bg-white/[0.02] focus:outline-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border bg-red-500/10 text-red-500 border-red-500/25">
                        <AlertTriangle size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold tracking-tight text-red-500 truncate">Zarządzanie Danymi</h3>
                        <p className={`text-[11px] truncate ${muteTextClasses}`}>Wyczyść historię, zresetuj licznik lub pamięć</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-red-500/10 text-red-400 border-red-500/30">
                        Reset
                      </span>
                      <ChevronDown 
                        size={17} 
                        className={`transition-transform duration-300 ${muteTextClasses} ${openSettingsSections.danger ? 'rotate-180 text-red-400' : ''}`} 
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {openSettingsSections.danger && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 border-t border-red-500/20 space-y-3">
                          <p className={`text-xs ${muteTextClasses} leading-relaxed`}>
                            Wybierz precyzyjny zakres resetu danych w aplikacji:
                          </p>

                          <div className="space-y-2">
                            {/* Opcja 1: Wyczyść tylko wpisy / napoje */}
                            <button
                              type="button"
                              onClick={() => handleOpenResetModal('logs')}
                              className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-2.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] ${innerItemBg} hover:border-amber-500/50`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                                  <History size={14} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold truncate">Wyczyść historię wpisów ({logs.length})</div>
                                  <div className={`text-[10px] truncate ${muteTextClasses}`}>Usuwa napoje, zachowuje timer i motyw</div>
                                </div>
                              </div>
                              <ChevronRight size={13} className={muteTextClasses} />
                            </button>

                            {/* Opcja 2: Zresetuj licznik abstynencji */}
                            <button
                              type="button"
                              onClick={() => handleOpenResetModal('timer')}
                              className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-2.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] ${innerItemBg} hover:border-orange-500/50`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 border border-orange-500/20">
                                  <RotateCcw size={14} />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold truncate">Zresetuj licznik abstynencji (0h)</div>
                                  <div className={`text-[10px] truncate ${muteTextClasses}`}>Zeruje czas od ostatniej kofeiny do teraz</div>
                                </div>
                              </div>
                              <ChevronRight size={13} className={muteTextClasses} />
                            </button>

                            {/* Opcja 3: Pełny reset fabryczny */}
                            <button
                              type="button"
                              onClick={() => handleOpenResetModal('factory')}
                              className="w-full p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 flex items-center justify-between gap-2.5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 border border-red-500/30">
                                  <Trash2 size={14} />
                                </div>
                                <div className="min-w-0 text-left">
                                  <div className="text-xs font-bold truncate">Pełny reset do stanu fabrycznego</div>
                                  <div className="text-[10px] text-red-400/80 truncate">Czyści wszystko: logi, licznik, pamięć i motyw</div>
                                </div>
                              </div>
                              <ChevronRight size={13} className="text-red-500/70" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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

        {/* ROZBUDOWANY MODAL SZCZEGÓŁÓW KAMIENIA MILOWEGO (GEST PRZECIĄGNIĘCIA W DÓŁ + JEDEN PRZYCISK ZAMKNIJ) */}
        <AnimatePresence>
          {selectedMilestone && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseMilestone}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
            >
              <motion.div 
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.05, bottom: 0.7 }}
                onDragEnd={(_e, info) => {
                  if (info.offset.y > 60 || info.velocity.y > 250) {
                    handleCloseMilestone();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`w-full max-w-md border-t sm:rounded-3xl sm:border p-5 pb-8 sm:pb-6 shadow-2xl relative max-h-[92vh] overflow-y-auto ${modalBg}`}
              >
                {/* Visual drag handle for swipe-down to dismiss on touchscreens */}
                <div className="flex flex-col items-center justify-center pt-0 pb-3 cursor-grab active:cursor-grabbing select-none">
                  <div className="w-12 h-1.5 rounded-full bg-zinc-500/40 hover:bg-zinc-400/60 transition-colors" />
                </div>

                {/* Header with Icon, Name & Phase */}
                <div className="flex items-start gap-3.5 mb-4">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center border text-2xl font-black shrink-0 shadow-md"
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

                {/* COUNTDOWN & MOTIVATION TARGET CARD */}
                {(() => {
                  const info = getMilestoneCountdownInfo(selectedMilestone.seconds, diffSeconds, lastIntake);
                  return (
                    <div className={`p-4 rounded-2xl border mb-5 backdrop-blur-sm ${innerItemBg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${muteTextClasses}`}>
                          {info.isUnlocked ? 'Status Osiągnięcia' : 'Czas do Osiągnięcia Kamienia'}
                        </span>
                        <span 
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            info.isUnlocked 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                          }`}
                        >
                          {info.badgeText}
                        </span>
                      </div>

                      {/* Progress Bar towards this specific milestone */}
                      <div className={`w-full h-3.5 rounded-full p-0.5 border relative mb-2.5 flex items-center ${theme === 'light' ? 'bg-zinc-200 border-zinc-300' : 'bg-black/40 border-zinc-800'}`}>
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${info.progressPercent}%`,
                            backgroundColor: info.isUnlocked ? '#10b981' : currentAccent.primary,
                            boxShadow: `0 0 10px ${info.isUnlocked ? 'rgba(16,185,129,0.4)' : currentAccent.glow}`
                          }}
                        />
                        <span className="absolute right-2 text-[9px] font-extrabold text-zinc-400">
                          {info.progressPercent}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className={muteTextClasses}>
                          {info.isUnlocked ? 'Wymagany czas:' : 'Pozostało do celu:'}
                        </span>
                        <span className="font-bold">
                          {info.isUnlocked ? formatDuration(selectedMilestone.seconds * 1000) : info.timeRemainingStr}
                        </span>
                      </div>

                      {!info.isUnlocked && (
                        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-zinc-500/15 mt-2">
                          <span className={muteTextClasses}>Przewidywana data zaliczenia:</span>
                          <span className="font-bold text-cyan-400">
                            {info.targetDateStr}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

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

                {/* SINGLE ACTION BUTTON TO CLOSE MODAL */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCloseMilestone}
                    className="w-full py-3.5 px-6 rounded-2xl text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                    style={{ 
                      backgroundColor: currentAccent.primary,
                      boxShadow: `0 0 16px ${currentAccent.glow}`
                    }}
                  >
                    <span>Zamknij</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL: WYBÓR PUNKTU STARTOWEGO STATYSTYK (RESET OD DZIŚ LUB WŁASNA DATA) */}
        <AnimatePresence>
          {showStartDateModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseStartDateModal}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
            >
              <motion.div 
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.05, bottom: 0.7 }}
                onDragEnd={(_e, info) => {
                  if (info.offset.y > 100 || info.velocity.y > 400) {
                    handleCloseStartDateModal();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`w-full max-w-md border-t sm:rounded-3xl sm:border p-5 pb-8 sm:pb-6 shadow-2xl relative max-h-[92vh] overflow-y-auto ${modalBg}`}
              >
                {/* Visual drag handle for swipe-down to dismiss */}
                <div className="w-12 h-1.5 rounded-full bg-zinc-500/30 mx-auto mb-3 cursor-grab active:cursor-grabbing" />

                {/* Header with Back button and Close */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-500/15">
                  <button 
                    type="button"
                    onClick={handleCloseStartDateModal}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${innerItemBg} hover:border-zinc-500 active:scale-95`}
                  >
                    <ArrowLeft size={16} />
                    <span>Wróć</span>
                  </button>

                  <span className={`text-[10px] font-bold uppercase tracking-wider ${muteTextClasses}`}>
                    Punkt Startowy
                  </span>

                  <button 
                    type="button"
                    onClick={handleCloseStartDateModal}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${innerItemBg} hover:opacity-80 transition-opacity`}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 shadow-md"
                    style={{
                      backgroundColor: currentAccent.badgeBg,
                      color: currentAccent.primary,
                      borderColor: currentAccent.badgeBorder
                    }}
                  >
                    <CalendarClock size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">Od kiedy zliczać statystyki?</h3>
                    <p className={`text-xs ${muteTextClasses}`}>
                      Aplikacja wyliczy czyste dni i wykresy od wskazanego momentu.
                    </p>
                  </div>
                </div>

                {/* Current Start Date Info Box */}
                <div className={`p-3.5 rounded-2xl border mb-4 text-xs ${innerItemBg}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${muteTextClasses}`}>
                    Obecnie ustawiony punkt startowy:
                  </span>
                  <span className="font-bold text-sm" style={{ color: currentAccent.primary }}>
                    {format(new Date(statsStartDate), 'EEEE, d MMMM yyyy', { locale: pl })} (godz. {format(new Date(statsStartDate), 'HH:mm')})
                  </span>
                </div>

                {/* 1-Click Fast Presets */}
                <div className="space-y-2 mb-5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block px-1 ${muteTextClasses}`}>
                    Szybkie opcje:
                  </span>

                  <button
                    type="button"
                    onClick={() => handleResetStatsToToday(false)}
                    className="w-full p-3.5 rounded-2xl text-left border flex items-center justify-between transition-all group active:scale-[0.98]"
                    style={{
                      backgroundColor: currentAccent.badgeBg,
                      borderColor: currentAccent.primary
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles size={18} style={{ color: currentAccent.primary }} />
                      <div>
                        <p className="text-xs font-bold" style={{ color: currentAccent.badgeText }}>
                          Licz wszystko od dziś (00:00)
                        </p>
                        <p className={`text-[11px] ${subTextClasses}`}>
                          Zaczyna statystyki od początku dzisiejszego dnia
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: currentAccent.primary }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResetStatsToToday(true)}
                    className={`w-full p-3 rounded-2xl text-left border flex items-center justify-between transition-all ${innerItemBg} hover:border-zinc-500 active:scale-[0.98]`}
                  >
                    <div className="flex items-center gap-3">
                      <RotateCcw size={16} style={{ color: currentAccent.primary }} />
                      <div>
                        <p className="text-xs font-semibold">Od teraz + reset timera</p>
                        <p className={`text-[10px] ${muteTextClasses}`}>
                          Zeruje główny licznik i zaczyna czystość od tej chwili
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className={muteTextClasses} />
                  </button>
                </div>

                {/* Custom Date & Hour Picker Form */}
                <div className={`p-4 rounded-2xl border mb-5 ${innerItemBg}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block mb-3 ${muteTextClasses}`}>
                    Lub wybierz dokładną datę i godzinę:
                  </span>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${muteTextClasses}`}>
                        Data startu
                      </label>
                      <input 
                        type="date"
                        value={customStartInputDate}
                        onChange={(e) => setCustomStartInputDate(e.target.value)}
                        className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${cardClasses}`}
                      />
                    </div>
                    <div>
                      <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${muteTextClasses}`}>
                        Godzina
                      </label>
                      <input 
                        type="time"
                        value={customStartInputHour}
                        onChange={(e) => setCustomStartInputHour(e.target.value)}
                        className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none ${cardClasses}`}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveCustomStartDate}
                    disabled={!customStartInputDate}
                    className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
                    style={{ backgroundColor: currentAccent.primary }}
                  >
                    Zapisz wybrany punkt startowy
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCloseStartDateModal}
                  className={`w-full py-3 rounded-2xl border text-xs font-semibold ${innerItemBg} hover:border-zinc-500`}
                >
                  Anuluj i zamknij
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

        {/* RESET / CLEAR DATA CONFIRMATION MODAL */}
        <AnimatePresence>
          {showResetConfirmModal && resetModalType && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseResetModal}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-sm rounded-3xl border p-6 shadow-2xl ${modalBg}`}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div 
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${
                      resetModalType === 'factory' 
                        ? 'bg-red-500/15 border-red-500/30 text-red-500' 
                        : resetModalType === 'logs'
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                        : 'bg-orange-500/15 border-orange-500/30 text-orange-500'
                    }`}
                  >
                    {resetModalType === 'factory' && <Trash2 size={24} />}
                    {resetModalType === 'logs' && <History size={24} />}
                    {resetModalType === 'timer' && <RotateCcw size={24} />}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold tracking-tight">
                      {resetModalType === 'factory' && 'Zresetować do ustawień fabrycznych?'}
                      {resetModalType === 'logs' && 'Wyczyścić historię wpisów?'}
                      {resetModalType === 'timer' && 'Zresetować licznik abstynencji?'}
                    </h3>
                    <p className={`text-xs mt-2 leading-relaxed ${subTextClasses}`}>
                      {resetModalType === 'factory' && (
                        'Ta operacja usunie wszystkie zalogowane napoje, zresetuje licznik i punkt startowy statystyk oraz przywróci domyślny motyw i preferencje aplikacji.'
                      )}
                      {resetModalType === 'logs' && (
                        `Usuniesz wszystkie zapisane napoje (${logs.length} wpisów). Wykresy zostaną wyzerowane. Twój aktualny licznik abstynencji i motyw pozostaną bez zmian.`
                      )}
                      {resetModalType === 'timer' && (
                        'Główny zegar czystości od kofeiny zostanie ustawiony na 0h 00m 00s (czas liczony od bieżącej chwili). Historia wcześniejszych wpisów nie zostanie usunięta.'
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full pt-3">
                    <button
                      type="button"
                      onClick={handleCloseResetModal}
                      className={`py-3 rounded-2xl border text-xs font-bold transition-all active:scale-95 ${innerItemBg} hover:border-zinc-500`}
                    >
                      Anuluj
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (resetModalType === 'factory') executeFactoryReset();
                        else if (resetModalType === 'logs') executeClearLogs();
                        else if (resetModalType === 'timer') executeResetTimer();
                      }}
                      className={`py-3 rounded-2xl text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                        resetModalType === 'factory'
                          ? 'bg-red-600 hover:bg-red-700'
                          : resetModalType === 'logs'
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-orange-600 hover:bg-orange-700'
                      }`}
                    >
                      Potwierdź
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
