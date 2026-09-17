import { useState, useEffect, useCallback } from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface QuizResult {
  name: string;
  gender: 'male' | 'female';
  score: number;
  correct: number;
  total: number;
  bestStreak: number;
  timeSeconds: number;
  grade: string;
  date: string;
}

const STORAGE_KEY = 'power-quiz-history';

function getHistory(): QuizResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveResult(result: QuizResult) {
  const history = getHistory();
  history.unshift(result);
  // Keep last 50 results
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
}

const ALL_QUESTIONS: Question[] = [
  // EASY
  { id: 1, question: "What is India's total installed power capacity as of FY24-25?", options: ['320 GW', '450 GW', '580 GW', '210 GW'], correctIndex: 1, explanation: "India's total installed capacity reached 450.29 GW by March 2025 (CEA data).", difficulty: 'easy', category: 'Capacity' },
  { id: 2, question: "Which energy source has the highest installed capacity in India?", options: ['Solar', 'Wind', 'Coal', 'Large Hydro'], correctIndex: 2, explanation: "Coal dominates with 2,11,540 MW (47% of total capacity).", difficulty: 'easy', category: 'Capacity' },
  { id: 3, question: "What does PLF stand for in power sector terminology?", options: ['Power Load Function', 'Plant Load Factor', 'Peak Level Frequency', 'Power Line Failure'], correctIndex: 1, explanation: "PLF = Plant Load Factor — measures how efficiently a thermal plant converts installed capacity to actual generation.", difficulty: 'easy', category: 'Technical' },
  { id: 4, question: "Which sector owns the majority of India's power capacity?", options: ['Central PSU', 'State PSU', 'Private Sector', 'Joint Ventures'], correctIndex: 2, explanation: "Private sector owns 53.5% (241 GW) of India's total installed capacity.", difficulty: 'easy', category: 'Ownership' },
  { id: 5, question: "What is India's target for non-fossil fuel capacity by 2030?", options: ['300 GW', '400 GW', '500 GW', '750 GW'], correctIndex: 2, explanation: "India committed to 500 GW non-fossil fuel capacity by 2030 at COP26 Glasgow.", difficulty: 'easy', category: 'Policy' },
  { id: 6, question: "What percentage of India's generation comes from coal?", options: ['47%', '55%', '67%', '78%'], correctIndex: 2, explanation: "Coal generates 1,189.7 BU = 67.2% of total generation despite having only 47% capacity share.", difficulty: 'easy', category: 'Generation' },
  { id: 7, question: "Which company is India's largest renewable energy producer?", options: ['Tata Power', 'NTPC', 'Adani Green (AGEL)', 'ReNew Energy'], correctIndex: 2, explanation: "AGEL surpassed 20 GW operational RE capacity in 2026 — the first in India.", difficulty: 'easy', category: 'Market' },
  { id: 8, question: "What is BU in electricity measurement?", options: ['Billion Watts', 'Billion Units (kWh)', 'Base Utility', 'Bulk Usage'], correctIndex: 1, explanation: "BU = Billion Units = 1 billion kWh. India generated 1,771.7 BU in FY24-25.", difficulty: 'easy', category: 'Technical' },

  // MEDIUM
  { id: 9, question: "What is the CUF (Capacity Utilization Factor) of solar in India?", options: ['8.2%', '18.2%', '28.2%', '38.2%'], correctIndex: 1, explanation: "Solar CUF is 18.2% because panels only generate during daylight hours (~5-6 effective hours/day).", difficulty: 'medium', category: 'Generation' },
  { id: 10, question: "Which year did India's non-fossil capacity first cross 100 GW?", options: ['2014', '2017', '2020', '2022'], correctIndex: 1, explanation: "In 2017, non-fossil capacity reached 101.25 GW — a historic milestone.", difficulty: 'medium', category: 'Timeline' },
  { id: 11, question: "What is the EMV range for a cyclone damage claim on a wind farm?", options: ['₹5–10 Cr', '₹20–50 Cr', '₹50–200 Cr', '₹500+ Cr'], correctIndex: 2, explanation: "Cyclone damage EMV ranges ₹50–200 Cr. Cyclone Tauktae (2021) caused ₹180 Cr loss to Gujarat wind farms.", difficulty: 'medium', category: 'Risk' },
  { id: 12, question: "Nuclear power has the highest CUF in India. What is it?", options: ['58.4%', '64.2%', '78.6%', '92.1%'], correctIndex: 2, explanation: "Nuclear CUF = 78.6% — highest of all sources because it operates as continuous base load.", difficulty: 'medium', category: 'Generation' },
  { id: 13, question: "Which Act deregulated India's electricity sector?", options: ['Energy Conservation Act 2001', 'Electricity Act 2003', 'Power Reform Act 2005', 'Renewable Energy Act 2010'], correctIndex: 1, explanation: "The Electricity Act 2003 brought deregulation, open access, power trading, and ended state monopolies.", difficulty: 'medium', category: 'Policy' },
  { id: 14, question: "What is MLOP in insurance terminology?", options: ['Maximum Load Output Parameter', 'Machinery Loss of Profit', 'Machine Level Operating Pressure', 'Mechanical Leverage Output'], correctIndex: 1, explanation: "MLOP = Machinery Loss of Profit — covers revenue loss during equipment breakdown/repair period.", difficulty: 'medium', category: 'Risk' },
  { id: 15, question: "How much did India's power capacity grow from 1975 to 2025?", options: ['5x', '10x', '22x', '50x'], correctIndex: 2, explanation: "From 20.1 GW (1975) to 450.3 GW (2025) = 22x growth in 50 years.", difficulty: 'medium', category: 'Timeline' },
  { id: 16, question: "Which state has the highest solar capacity in India?", options: ['Gujarat', 'Rajasthan', 'Tamil Nadu', 'Karnataka'], correctIndex: 1, explanation: "Rajasthan leads in solar capacity due to high irradiance (5.5-6 kWh/m²/day) and vast desert land.", difficulty: 'medium', category: 'Geography' },
  { id: 17, question: "What does LPS stand for in wind turbine safety?", options: ['Low Power Supply', 'Lightning Protection System', 'Load Power Stabilizer', 'Linear Performance Sensor'], correctIndex: 1, explanation: "LPS = Lightning Protection System (IEC 62305). Protects nacelle and blades from lightning strikes — ROI is 3 years.", difficulty: 'medium', category: 'Risk' },
  { id: 18, question: "What is India's annual electricity demand projected to be by 2030?", options: ['1,800 BU', '2,100 BU', '2,320 BU', '3,000 BU'], correctIndex: 2, explanation: "Projected demand by 2030 is ~2,320 BU, requiring ~680 GW total installed capacity.", difficulty: 'medium', category: 'Projections' },

  // HARD
  { id: 19, question: "What was the financial impact of Cyclone Tauktae on Gujarat wind farms in 2021?", options: ['₹45 Cr', '₹95 Cr', '₹180 Cr', '₹320 Cr'], correctIndex: 2, explanation: "Cyclone Tauktae caused ₹180 Cr loss with 47 turbines damaged — highlighting need for cyclone-rated towers.", difficulty: 'hard', category: 'Risk' },
  { id: 20, question: "What is the CAGR of non-fossil capacity growth in India (2014–2025)?", options: ['5.2%', '9.8%', '15.2%', '22.4%'], correctIndex: 2, explanation: "Non-fossil grew at 15.2% CAGR (2014–25) vs fossil at only 1.5% — the energy transition in numbers.", difficulty: 'hard', category: 'Timeline' },
  { id: 21, question: "Which ISO standard is used for Risk Management framework?", options: ['ISO 9001', 'ISO 14001', 'ISO 31000', 'ISO 45001'], correctIndex: 2, explanation: "ISO 31000:2018 provides principles and guidelines for risk management. Used globally for enterprise risk assessment.", difficulty: 'hard', category: 'Risk' },
  { id: 22, question: "What percentage of wind capacity is owned by the private sector?", options: ['45%', '67%', '79%', '91%'], correctIndex: 3, explanation: "Private sector owns 91% of all wind capacity (42,350 MW out of 46,650 MW). Only 11% is PSU-owned.", difficulty: 'hard', category: 'Ownership' },
  { id: 23, question: "What is NDT in the context of boiler maintenance?", options: ['National Design Testing', 'Non-Destructive Testing', 'Neutral Drift Tolerance', 'Network Data Transfer'], correctIndex: 1, explanation: "NDT = Non-Destructive Testing — ultrasonic/radiographic inspection of boiler tubes without cutting them. Critical after 15+ years.", difficulty: 'hard', category: 'Risk' },
  { id: 24, question: "India's estimated power sector insurance premium market size is:", options: ['₹1,000–2,000 Cr/year', '₹4,000–5,000 Cr/year', '₹8,000–10,000 Cr/year', '₹20,000+ Cr/year'], correctIndex: 2, explanation: "₹8,000–10,000 Cr annual premium pool with 15–20% growth expected through 2030 due to 50+ GW/year additions.", difficulty: 'hard', category: 'Market' },
  { id: 25, question: "What is the PLF of gas-based power plants in India?", options: ['12.8%', '22.8%', '42.8%', '64.2%'], correctIndex: 1, explanation: "Gas PLF is only 22.8% — expensive imported LNG makes it uneconomical for base load; used for peak demand only.", difficulty: 'hard', category: 'Generation' },
  { id: 26, question: "Which year was the National Solar Mission launched?", options: ['2005', '2008', '2010', '2014'], correctIndex: 2, explanation: "Jawaharlal Nehru National Solar Mission launched in 2010 with initial target of 20 GW by 2022 (later revised to 100 GW).", difficulty: 'hard', category: 'Policy' },
  { id: 27, question: "What is CMS in wind turbine monitoring?", options: ['Central Management Server', 'Condition Monitoring System', 'Carbon Measurement Standard', 'Circuit Maintenance Schedule'], correctIndex: 1, explanation: "CMS = Condition Monitoring System — continuous gearbox/bearing vibration monitoring with auto-shutdown triggers for wind turbines.", difficulty: 'hard', category: 'Technical' },
  { id: 28, question: "AGEL's market share of India's total RE capacity is approximately:", options: ['3.5%', '5.5%', '8.5%', '12.5%'], correctIndex: 2, explanation: "AGEL has 20,000 MW of 236,500 MW total RE = 8.5% market share — India's largest RE player.", difficulty: 'hard', category: 'Market' },

  // MORE EASY
  { id: 29, question: "What does RE stand for in India's energy context?", options: ['Regulated Energy', 'Renewable Energy', 'Regional Electricity', 'Reserve Exchange'], correctIndex: 1, explanation: "RE = Renewable Energy — includes solar, wind, biomass, small hydro (excludes large hydro per MNRE).", difficulty: 'easy', category: 'Technical' },
  { id: 30, question: "Which government body oversees India's electricity generation data?", options: ['NITI Aayog', 'MNRE', 'CEA', 'SEBI'], correctIndex: 2, explanation: "CEA = Central Electricity Authority (cea.nic.in) maintains all generation, capacity, and PLF/CUF data.", difficulty: 'easy', category: 'Policy' },
  { id: 31, question: "What is the approximate share of non-fossil in India's generation?", options: ['28%', '46%', '55%', '65%'], correctIndex: 0, explanation: "Non-fossil contributes only 28.1% of actual generation despite 45.8% capacity — due to lower CUF of renewables.", difficulty: 'easy', category: 'Generation' },
  { id: 32, question: "India's total electricity generation in FY24-25 was approximately:", options: ['1,200 BU', '1,550 BU', '1,772 BU', '2,100 BU'], correctIndex: 2, explanation: "India generated 1,771.7 BU in FY2024-25 — a 5% increase over previous year.", difficulty: 'easy', category: 'Generation' },
  { id: 33, question: "What is the full form of NTPC?", options: ['National Thermal Power Company', 'National Transmission Power Corporation', 'Northern Thermal Power Centre', 'Nuclear & Thermal Power Corp'], correctIndex: 0, explanation: "NTPC = National Thermal Power Corporation — India's largest power utility with 73+ GW capacity.", difficulty: 'easy', category: 'Market' },
  { id: 34, question: "Which fuel source is considered the cleanest among fossils?", options: ['Coal', 'Diesel', 'Natural Gas', 'Lignite'], correctIndex: 2, explanation: "Natural Gas produces ~50% less CO2 than coal and negligible particulates — cleanest fossil fuel.", difficulty: 'easy', category: 'Technical' },

  // MORE MEDIUM
  { id: 35, question: "What is the target year for India to achieve Net Zero emissions?", options: ['2030', '2050', '2060', '2070'], correctIndex: 3, explanation: "India committed to Net Zero by 2070 at COP26 Glasgow — longer timeline than Western nations (2050).", difficulty: 'medium', category: 'Policy' },
  { id: 36, question: "What percentage of India's coal capacity is owned by private sector?", options: ['35%', '50%', '65%', '80%'], correctIndex: 1, explanation: "Private sector owns ~50% of coal capacity (1,06,240 MW of 2,11,540 MW). State + Central PSU own the other half.", difficulty: 'medium', category: 'Ownership' },
  { id: 37, question: "BESS stands for:", options: ['Base Energy Supply System', 'Battery Energy Storage System', 'Bulk Electricity Station Setup', 'Bio-Energy Solar Station'], correctIndex: 1, explanation: "BESS = Battery Energy Storage System — critical for storing solar/wind energy for use after sunset/calm.", difficulty: 'medium', category: 'Technical' },
  { id: 38, question: "What is the approximate cost of solar power in India per unit (2025)?", options: ['₹1.5–2.5/kWh', '₹3–4/kWh', '₹5–6/kWh', '₹8–10/kWh'], correctIndex: 0, explanation: "Solar tariffs have dropped to ₹1.99–2.50/kWh in recent auctions — cheaper than new coal (₹4–5/kWh).", difficulty: 'medium', category: 'Market' },
  { id: 39, question: "Which state leads in wind energy capacity?", options: ['Gujarat', 'Rajasthan', 'Tamil Nadu', 'Maharashtra'], correctIndex: 2, explanation: "Tamil Nadu leads wind capacity with ~10 GW due to strong monsoon winds along the southern coast.", difficulty: 'medium', category: 'Geography' },
  { id: 40, question: "What does CAR/EAR mean in construction insurance?", options: ['Central Assessment Report', 'Contractors All Risk / Erection All Risk', 'Capacity Addition Review', 'Cost Analysis Report'], correctIndex: 1, explanation: "CAR/EAR = Contractors All Risk / Erection All Risk — insurance covering construction-phase damages.", difficulty: 'medium', category: 'Risk' },
  { id: 41, question: "India's largest solar park is located in:", options: ['Rajasthan', 'Gujarat (Kutch)', 'Madhya Pradesh', 'Karnataka (Pavagada)'], correctIndex: 0, explanation: "Bhadla Solar Park in Rajasthan is India's largest at 2,245 MW, spread over 14,000 acres.", difficulty: 'medium', category: 'Geography' },
  { id: 42, question: "What is pumped hydro storage?", options: ['Storing water in tanks for cooling', 'Pumping water uphill to store energy, releasing downhill to generate', 'Using pumps to increase dam height', 'Hydrogen storage using water electrolysis'], correctIndex: 1, explanation: "Pumped Hydro stores energy by pumping water to upper reservoir; releases it through turbines when needed. Greenko is a major player.", difficulty: 'medium', category: 'Technical' },

  // MORE HARD
  { id: 43, question: "What is DGA in transformer monitoring?", options: ['Digital Grid Assessment', 'Dissolved Gas Analysis', 'Demand Generation Audit', 'Dynamic Grid Algorithm'], correctIndex: 1, explanation: "DGA = Dissolved Gas Analysis — detects insulation degradation in transformer oil before failure. Key predictive tool.", difficulty: 'hard', category: 'Technical' },
  { id: 44, question: "India's coal PLF has declined from 78% (2007) to 64% (2025). Why?", options: ['Less coal available', 'Cheaper gas imports', 'Renewable must-run status displaces coal during daytime', 'Lower electricity demand'], correctIndex: 2, explanation: "RE has 'must-run' priority on the grid. During daytime solar floods the grid, pushing coal plants to back down — reducing PLF.", difficulty: 'hard', category: 'Generation' },
  { id: 45, question: "What is India's Green Hydrogen production target by 2030?", options: ['0.5 MMT', '2 MMT', '5 MMT', '10 MMT'], correctIndex: 2, explanation: "National Green Hydrogen Mission targets 5 Million Metric Tonnes/year by 2030 — requiring ~125 GW of electrolyzers.", difficulty: 'hard', category: 'Projections' },
  { id: 46, question: "What was the Ramagundam boiler explosion loss in 2022?", options: ['₹25 Cr', '₹55 Cr', '₹95 Cr', '₹180 Cr'], correctIndex: 2, explanation: "₹95 Cr loss + 6 months outage. Key learning: NDT frequency must increase after 15 years of operation.", difficulty: 'hard', category: 'Risk' },
  { id: 47, question: "India's offshore wind target for first auction is:", options: ['500 MW', '1 GW', '4 GW', '8 GW'], correctIndex: 2, explanation: "India plans 4 GW offshore wind by 2030 off Gujarat coast; first 1 GW tender already issued by MNRE.", difficulty: 'hard', category: 'Projections' },
  { id: 48, question: "What is the thermal runaway risk in BESS?", options: ['Battery overheating → uncontrollable chain reaction → fire', 'Power grid overload from battery', 'Chemical leakage into soil', 'Battery freezing in cold weather'], correctIndex: 0, explanation: "Thermal runaway occurs when a battery cell overheats, triggering adjacent cells — can cause major fires. Key BESS insurance challenge.", difficulty: 'hard', category: 'Risk' },
];

const QUIZ_SIZE = 10;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomQuestions(lastUsedIds: number[]): Question[] {
  // Prioritize questions NOT used in previous attempt
  const pickFromPool = (pool: Question[], count: number) => {
    const unseen = pool.filter(q => !lastUsedIds.includes(q.id));
    const seen = pool.filter(q => lastUsedIds.includes(q.id));
    // Take as many unseen as possible, fill remaining with seen (reshuffled)
    const picked = shuffleArray(unseen).slice(0, count);
    if (picked.length < count) {
      picked.push(...shuffleArray(seen).slice(0, count - picked.length));
    }
    return picked;
  };

  const easy = pickFromPool(ALL_QUESTIONS.filter(q => q.difficulty === 'easy'), 3);
  const medium = pickFromPool(ALL_QUESTIONS.filter(q => q.difficulty === 'medium'), 4);
  const hard = pickFromPool(ALL_QUESTIONS.filter(q => q.difficulty === 'hard'), 3);
  return shuffleArray([...easy, ...medium, ...hard]);
}

function getDifficultyColor(d: string) {
  if (d === 'easy') return 'bg-green-100 text-green-700 border-green-300';
  if (d === 'medium') return 'bg-amber-100 text-amber-700 border-amber-300';
  return 'bg-red-100 text-red-700 border-red-300';
}

function getDifficultyPoints(d: string) {
  if (d === 'easy') return 10;
  if (d === 'medium') return 20;
  return 30;
}

function getGradeLabel(score: number, total: number) {
  const maxScore = total * 25;
  const pct = (score / maxScore) * 100;
  if (pct >= 80) return '🏆 Power Sector Expert';
  if (pct >= 60) return '⚡ Energy Champion';
  if (pct >= 40) return '💡 Rising Spark';
  return '🔌 Power Trainee';
}

// Fun reactions
const CORRECT_MESSAGES = ['⚡ Brilliant!', '🔥 On Fire!', '💪 Nailed It!', '🎯 Bullseye!', '✨ Perfect!', '🚀 Unstoppable!'];
const WRONG_MESSAGES = ['😅 Close one!', '🤔 Tricky!', '📚 Now you know!', '💡 Good try!'];
const STREAK_MESSAGES: Record<number, string> = { 3: '🔥 Hat-trick!', 5: '⚡ PENTAKILL!', 7: '🌟 LEGENDARY!', 10: '👑 PERFECT GAME!' };
const FUN_FACTS = [
  '💡 India adds more solar capacity per year than most countries have in total!',
  '⚡ One BU = 1 billion kWh = enough to power 25 million homes for a month!',
  '🌬️ India has 7,500 km of coastline — massive offshore wind potential!',
  '☀️ Rajasthan receives 300+ sunny days per year — ideal for solar!',
  '🔋 India plans 500 GW non-fossil by 2030 — the world\'s most ambitious target!',
  '🏭 NTPC alone can power entire countries like Bangladesh or Vietnam!',
  '💰 Solar is now cheaper than coal in India — ₹2/kWh vs ₹4/kWh!',
  '🌊 India\'s first offshore wind farm will be in Gujarat by 2028!',
  '⚛️ India is building 10 new nuclear reactors (7 GW) by 2031!',
  '🔌 India\'s peak demand hit 250 GW in summer 2025 — new record!',
];

type Screen = 'register' | 'quiz' | 'result' | 'history';

export function QuizSection() {
  // User info
  const [playerName, setPlayerName] = useState('');
  const [playerGender, setPlayerGender] = useState<'male' | 'female' | ''>('');
  const [screen, setScreen] = useState<Screen>('register');

  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [timerActive, setTimerActive] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>([]);
  const [lastUsedIds, setLastUsedIds] = useState<number[]>([]);

  // Engagement state
  const [reactionMsg, setReactionMsg] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [powerUps, setPowerUps] = useState({ fiftyFifty: 1, extraTime: 1, skip: 1 });
  const [funFact, setFunFact] = useState('');
  const [xpLevel, setXpLevel] = useState(0);

  // History
  const [history, setHistory] = useState<QuizResult[]>([]);

  useEffect(() => {
    setHistory(getHistory());
    // Calculate XP level from total games
    const h = getHistory();
    setXpLevel(h.length);
  }, []);

  const startQuiz = useCallback(() => {
    const newQuestions = getRandomQuestions(lastUsedIds);
    setLastUsedIds(newQuestions.map(q => q.id));
    setQuestions(newQuestions);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(20);
    setTimerActive(true);
    setTotalTime(0);
    setAnswers([]);
    setReactionMsg('');
    setShowConfetti(false);
    setShakeWrong(false);
    setEliminated([]);
    setPowerUps({ fiftyFifty: 1, extraTime: 1, skip: 1 });
    setFunFact('');
    setScreen('quiz');
  }, [lastUsedIds]);

  // Timer
  useEffect(() => {
    if (!timerActive || isAnswered || screen !== 'quiz') return;
    if (timeLeft <= 0) {
      setIsAnswered(true);
      setTimerActive(false);
      setStreak(0);
      setAnswers(prev => [...prev, null]);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(t => t - 1);
      setTotalTime(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, isAnswered, screen]);

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    setTimerActive(false);

    const q = questions[currentQ];
    if (index === q.correctIndex) {
      const points = getDifficultyPoints(q.difficulty);
      const bonusPoints = timeLeft > 10 ? 5 : timeLeft > 5 ? 2 : 0;
      const streakBonus = streak >= 2 ? streak * 2 : 0;
      setScore(s => s + points + bonusPoints + streakBonus);
      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        // Check for streak milestones
        if (STREAK_MESSAGES[newStreak]) {
          setReactionMsg(STREAK_MESSAGES[newStreak]);
        } else {
          setReactionMsg(CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)]);
        }
        return newStreak;
      });
      setAnswers(prev => [...prev, true]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    } else {
      setStreak(0);
      setAnswers(prev => [...prev, false]);
      setReactionMsg(WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)]);
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 600);
    }
  };

  // Power-up handlers
  const useFiftyFifty = () => {
    if (powerUps.fiftyFifty <= 0 || isAnswered) return;
    const q = questions[currentQ];
    const wrongIndices = q.options.map((_, i) => i).filter(i => i !== q.correctIndex);
    const toEliminate = shuffleArray(wrongIndices).slice(0, 2);
    setEliminated(toEliminate);
    setPowerUps(p => ({ ...p, fiftyFifty: p.fiftyFifty - 1 }));
  };

  const useExtraTime = () => {
    if (powerUps.extraTime <= 0 || isAnswered) return;
    setTimeLeft(t => t + 10);
    setPowerUps(p => ({ ...p, extraTime: p.extraTime - 1 }));
  };

  const useSkip = () => {
    if (powerUps.skip <= 0 || isAnswered) return;
    setPowerUps(p => ({ ...p, skip: p.skip - 1 }));
    setAnswers(prev => [...prev, null]);
    setReactionMsg('⏭️ Skipped!');
    // Move to next
    if (currentQ + 1 >= questions.length) {
      const correctCount = answers.filter(a => a === true).length;
      const grade = getGradeLabel(score, QUIZ_SIZE);
      const result: QuizResult = { name: playerName, gender: playerGender as 'male' | 'female', score, correct: correctCount, total: QUIZ_SIZE, bestStreak, timeSeconds: totalTime, grade, date: new Date().toLocaleString() };
      saveResult(result);
      setHistory(getHistory());
      setScreen('result');
    } else {
      setCurrentQ(c => c + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setEliminated([]);
      setTimeLeft(20);
      setTimerActive(true);
      setFunFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      const correctCount = answers.filter(a => a === true).length;
      const grade = getGradeLabel(score, QUIZ_SIZE);
      const result: QuizResult = { name: playerName, gender: playerGender as 'male' | 'female', score, correct: correctCount, total: QUIZ_SIZE, bestStreak, timeSeconds: totalTime, grade, date: new Date().toLocaleString() };
      saveResult(result);
      setHistory(getHistory());
      setXpLevel(getHistory().length);
      setScreen('result');
      return;
    }
    setCurrentQ(c => c + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setEliminated([]);
    setTimeLeft(20);
    setTimerActive(true);
    setReactionMsg('');
    // Show random fun fact between questions
    setFunFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
    setTimeout(() => setFunFact(''), 3000);
  };

  // ==================== REGISTER SCREEN ====================
  if (screen === 'register') {
    const myHistory = history.filter(h => h.name.toLowerCase() === playerName.toLowerCase());
    return (
      <div className="space-y-6">
        {/* Welcome Card */}
        <div className="icici-card p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-icici-maroon to-icici-navy" />
          <div className="text-5xl mb-4">⚡🎮</div>
          <h2 className="text-2xl font-black text-gray-800">Power Sector Quiz</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">Test your knowledge of India's power sector — capacity, generation, risks, policy, and market players!</p>

          <div className="mt-8 max-w-sm mx-auto space-y-4">
            {/* Name Input */}
            <div className="text-left">
              <label className="text-xs font-bold text-gray-600 block mb-1">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold focus:border-icici-maroon focus:outline-none transition-all"
              />
            </div>

            {/* Gender Selection */}
            <div className="text-left">
              <label className="text-xs font-bold text-gray-600 block mb-2">Gender</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setPlayerGender('male')}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                    playerGender === 'male'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  👨 Male
                </button>
                <button
                  onClick={() => setPlayerGender('female')}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                    playerGender === 'female'
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  👩 Female
                </button>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startQuiz}
              disabled={!playerName.trim() || !playerGender}
              className={`w-full py-4 rounded-xl font-bold text-white text-sm transition-all shadow-lg ${
                playerName.trim() && playerGender
                  ? 'bg-gradient-to-r from-icici-maroon to-icici-navy hover:opacity-90 hover:shadow-xl cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              ⚡ Start Quiz — 10 Random Questions
            </button>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 flex items-center justify-center gap-6 text-[14px] text-gray-400">
            <span>📝 10 Questions</span>
            <span>⏱️ 20s per question</span>
            <span>🎯 3 difficulty levels</span>
            <span>🏆 Score tracked</span>
          </div>
        </div>

        {/* View Past Scores button */}
        {history.length > 0 && (
          <button
            onClick={() => setScreen('history')}
            className="w-full icici-card p-4 text-center hover:shadow-md transition-all cursor-pointer"
          >
            <span className="text-sm font-bold text-icici-navy">📊 View Score History ({history.length} games played)</span>
          </button>
        )}

        {/* Player's past scores preview */}
        {playerName.trim() && myHistory.length > 0 && (
          <div className="icici-card p-5">
            <h3 className="text-xs font-bold text-gray-600 mb-3">📈 Your Past Scores — {playerName}</h3>
            <div className="space-y-2">
              {myHistory.slice(0, 5).map((h, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <span className="text-lg">{h.gender === 'male' ? '👨' : '👩'}</span>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-700">{h.grade}</div>
                    <div className="text-[14px] text-gray-400">{h.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-icici-maroon">{h.score} pts</div>
                    <div className="text-[14px] text-gray-400">{h.correct}/{h.total} correct</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==================== HISTORY SCREEN ====================
  if (screen === 'history') {
    const playerScores = playerName.trim()
      ? history.filter(h => h.name.toLowerCase() === playerName.toLowerCase())
      : [];
    const bestScore = playerScores.length > 0 ? Math.max(...playerScores.map(h => h.score)) : 0;
    const avgScore = playerScores.length > 0 ? Math.round(playerScores.reduce((s, h) => s + h.score, 0) / playerScores.length) : 0;
    const totalGames = playerScores.length;

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="icici-card p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-icici-navy via-icici-maroon to-icici-orange" />
          <div className="flex items-center justify-between mt-1">
            <div>
              <h2 className="text-lg font-black text-gray-800">📊 Score History</h2>
              <p className="text-[14px] text-gray-500">Track your improvement over time</p>
            </div>
            <button
              onClick={() => setScreen('register')}
              className="px-4 py-2 bg-icici-maroon text-white text-xs font-bold rounded-lg hover:opacity-90"
            >
              ← Back to Quiz
            </button>
          </div>
        </div>

        {/* Player summary (if name entered) */}
        {playerName.trim() && playerScores.length > 0 && (
          <div className="icici-card p-5">
            <h3 className="text-xs font-bold text-gray-600 mb-3">{playerGender === 'male' ? '👨' : '👩'} {playerName}'s Performance</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-white border border-green-200 text-center">
                <div className="text-xl font-black text-green-600">{bestScore}</div>
                <div className="text-[14px] text-gray-500 font-bold uppercase">Best Score</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-200 text-center">
                <div className="text-xl font-black text-blue-600">{avgScore}</div>
                <div className="text-[14px] text-gray-500 font-bold uppercase">Avg Score</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-200 text-center">
                <div className="text-xl font-black text-purple-600">{totalGames}</div>
                <div className="text-[14px] text-gray-500 font-bold uppercase">Games Played</div>
              </div>
            </div>
          </div>
        )}

        {/* All-time Leaderboard */}
        <div className="icici-card p-5">
          <h3 className="text-xs font-bold text-gray-600 mb-3">🏆 All-Time Leaderboard (Top Scores)</h3>
          <div className="space-y-2">
            {history
              .sort((a, b) => b.score - a.score)
              .slice(0, 15)
              .map((h, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                i < 3 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                  i === 0 ? 'bg-amber-500 text-white' :
                  i === 1 ? 'bg-gray-400 text-white' :
                  i === 2 ? 'bg-amber-700 text-white' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                </div>
                <span className="text-lg">{h.gender === 'male' ? '👨' : '👩'}</span>
                <div className="flex-1">
                  <div className="text-xs font-bold text-gray-800">{h.name}</div>
                  <div className="text-[14px] text-gray-400">{h.date} • {h.grade}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-icici-maroon">{h.score} pts</div>
                  <div className="text-[14px] text-gray-400">{h.correct}/{h.total} • {h.bestStreak}🔥 • {h.timeSeconds}s</div>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No games played yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== RESULT SCREEN ====================
  if (screen === 'result') {
    const correctCount = answers.filter(a => a === true).length;
    const grade = getGradeLabel(score, QUIZ_SIZE);
    const myHistory = history.filter(h => h.name.toLowerCase() === playerName.toLowerCase());
    const previousBest = myHistory.length > 1 ? Math.max(...myHistory.slice(1).map(h => h.score)) : 0;
    const isNewBest = score > previousBest && myHistory.length > 1;

    return (
      <div className="space-y-6">
        <div className="icici-card p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-icici-navy via-icici-maroon to-icici-orange" />
          <div className="text-5xl mb-3">{grade.includes('Expert') ? '🏆' : grade.includes('Champion') ? '⚡' : grade.includes('Spark') ? '💡' : '🔌'}</div>
          <h2 className="text-xl font-black text-gray-800">{grade}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {playerGender === 'male' ? '👨' : '👩'} {playerName} — Quiz Complete!
          </p>
          {isNewBest && (
            <div className="mt-2 inline-block px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-xs font-bold text-amber-700 animate-bounce">
              🎉 NEW PERSONAL BEST!
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 laptop:grid-cols-4 gap-3 mt-6 max-w-xl mx-auto">
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-white border border-green-200">
              <div className="text-2xl font-black text-green-600">{score}</div>
              <div className="text-[14px] text-gray-500 font-bold uppercase">Points</div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-200">
              <div className="text-2xl font-black text-blue-600">{correctCount}/{QUIZ_SIZE}</div>
              <div className="text-[14px] text-gray-500 font-bold uppercase">Correct</div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-200">
              <div className="text-2xl font-black text-amber-600">{bestStreak}🔥</div>
              <div className="text-[14px] text-gray-500 font-bold uppercase">Best Streak</div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-200">
              <div className="text-2xl font-black text-purple-600">{totalTime}s</div>
              <div className="text-[14px] text-gray-500 font-bold uppercase">Total Time</div>
            </div>
          </div>

          {/* Answer summary */}
          <div className="flex justify-center gap-1.5 mt-5">
            {answers.map((a, i) => (
              <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                a === true ? 'bg-green-500 text-white' : a === false ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {a === true ? '✓' : a === false ? '✗' : '—'}
              </div>
            ))}
          </div>

          {/* Previous score comparison */}
          {myHistory.length > 1 && (
            <div className="mt-5 p-3 rounded-xl bg-gray-50 border border-gray-200 max-w-xs mx-auto">
              <div className="text-[14px] font-bold text-gray-500 uppercase mb-1">Score Comparison</div>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-400">Previous Best</div>
                  <div className="text-lg font-black text-gray-600">{previousBest}</div>
                </div>
                <div className="text-lg">→</div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">Today</div>
                  <div className={`text-lg font-black ${score > previousBest ? 'text-green-600' : score < previousBest ? 'text-red-500' : 'text-gray-600'}`}>
                    {score} {score > previousBest ? '📈' : score < previousBest ? '📉' : '➡️'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={startQuiz}
              className="px-6 py-3 bg-gradient-to-r from-icici-maroon to-icici-navy text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg text-sm"
            >
              ⚡ Play Again
            </button>
            <button
              onClick={() => setScreen('history')}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-gray-400 transition-all text-sm"
            >
              📊 Score History
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== ACTIVE QUIZ SCREEN ====================
  if (questions.length === 0) return null;
  const q = questions[currentQ];
  const timerPct = (timeLeft / 20) * 100;
  const timerColor = timeLeft > 10 ? 'bg-green-500' : timeLeft > 5 ? 'bg-amber-500' : 'bg-red-500';
  const streakMultiplier = streak >= 2 ? `${streak}x` : '';

  return (
    <div className="space-y-4">
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="absolute animate-[fall_1.5s_ease-in_forwards]" style={{
              left: `${Math.random() * 100}%`,
              top: '-20px',
              animationDelay: `${Math.random() * 0.5}s`,
              fontSize: `${12 + Math.random() * 16}px`,
            }}>
              {['⚡','🌟','✨','🔥','💫','⭐'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      {/* Fun Fact Toast */}
      {funFact && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-white border-2 border-amber-300 shadow-xl rounded-xl px-5 py-3 max-w-md animate-fadeIn">
          <p className="text-xs font-semibold text-gray-700">{funFact}</p>
        </div>
      )}

      {/* Header: Player + Score + Streak + Power-ups */}
      <div className="icici-card p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-icici-navy via-icici-maroon to-icici-orange" />
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1">
              <span className="text-sm">{playerGender === 'male' ? '👨' : '👩'}</span>
              <span className="text-[14px] font-bold text-gray-600">{playerName}</span>
              {xpLevel > 0 && <span className="text-[14px] bg-icici-navy text-white px-1.5 rounded-full font-bold">LV.{Math.min(xpLevel, 99)}</span>}
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-icici-maroon">⚡{score}</div>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-amber-100 rounded-lg px-2 py-1 animate-pulse">
                <span className="text-sm font-black text-amber-600">{streak}🔥</span>
                {streakMultiplier && <span className="text-[14px] font-bold text-amber-500 bg-amber-200 px-1 rounded">{streakMultiplier} bonus</span>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-black text-gray-800">Q{currentQ + 1}/{QUIZ_SIZE}</div>
            </div>
            <button
              onClick={() => setScreen('register')}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-600 transition-all"
              title="Exit Quiz"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 mt-3">
          {questions.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition-all ${
              i < currentQ ? (answers[i] === true ? 'bg-green-500' : answers[i] === false ? 'bg-red-400' : 'bg-gray-300') :
              i === currentQ ? 'bg-icici-maroon' : 'bg-gray-200'
            }`} />
          ))}
        </div>
      </div>

      {/* Timer Bar — pulsing when low */}
      <div className={`w-full h-3 bg-gray-200 rounded-full overflow-hidden ${timeLeft <= 5 ? 'animate-pulse' : ''}`}>
        <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`} style={{ width: `${timerPct}%` }} />
      </div>

      {/* Power-Ups Bar */}
      {!isAnswered && (
        <div className="flex gap-2 justify-center">
          <button
            onClick={useFiftyFifty}
            disabled={powerUps.fiftyFifty <= 0}
            className={`px-3 py-2 rounded-lg border-2 text-xs font-bold transition-all ${
              powerUps.fiftyFifty > 0 ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:scale-105' : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            🎯 50:50 {powerUps.fiftyFifty > 0 ? `(${powerUps.fiftyFifty})` : '✗'}
          </button>
          <button
            onClick={useExtraTime}
            disabled={powerUps.extraTime <= 0}
            className={`px-3 py-2 rounded-lg border-2 text-xs font-bold transition-all ${
              powerUps.extraTime > 0 ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:scale-105' : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            ⏱️ +10s {powerUps.extraTime > 0 ? `(${powerUps.extraTime})` : '✗'}
          </button>
          <button
            onClick={useSkip}
            disabled={powerUps.skip <= 0}
            className={`px-3 py-2 rounded-lg border-2 text-xs font-bold transition-all ${
              powerUps.skip > 0 ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:scale-105' : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            ⏭️ Skip {powerUps.skip > 0 ? `(${powerUps.skip})` : '✗'}
          </button>
        </div>
      )}

      {/* Reaction Message */}
      {reactionMsg && isAnswered && (
        <div className="text-center animate-bounce">
          <span className="text-lg font-black">{reactionMsg}</span>
        </div>
      )}

      {/* Question Card */}
      <div className={`icici-card p-6 transition-all ${shakeWrong ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        {/* Difficulty + Category + Timer */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2.5 py-0.5 rounded-full text-[14px] font-bold border ${getDifficultyColor(q.difficulty)}`}>
            {q.difficulty.toUpperCase()} • +{getDifficultyPoints(q.difficulty)}pts
          </span>
          <span className="text-[14px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{q.category}</span>
          <span className={`ml-auto text-base font-black ${timeLeft <= 5 ? 'text-red-500 animate-pulse scale-110' : timeLeft <= 10 ? 'text-amber-500' : 'text-gray-600'}`}>
            ⏱️ {timeLeft}s
          </span>
        </div>

        {/* Question */}
        <h3 className="text-base font-black text-gray-800 mb-5 leading-relaxed">{q.question}</h3>

        {/* Options */}
        <div className="space-y-3">
          {q.options.map((option, index) => {
            const isEliminated = eliminated.includes(index);
            if (isEliminated && !isAnswered) return (
              <div key={index} className="p-4 rounded-xl border-2 border-dashed border-gray-200 opacity-30 text-center">
                <span className="text-xs text-gray-400 font-bold">❌ Eliminated</span>
              </div>
            );

            let optionStyle = 'bg-white border-gray-200 hover:border-icici-navy hover:bg-blue-50 hover:scale-[1.01] cursor-pointer';
            if (isAnswered) {
              if (index === q.correctIndex) {
                optionStyle = 'bg-green-50 border-green-500 ring-2 ring-green-200 scale-[1.02]';
              } else if (index === selectedAnswer && index !== q.correctIndex) {
                optionStyle = 'bg-red-50 border-red-500 ring-2 ring-red-200';
              } else {
                optionStyle = 'bg-gray-50 border-gray-200 opacity-40';
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isAnswered || isEliminated}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 transition-all ${
                    isAnswered && index === q.correctIndex ? 'bg-green-500 text-white scale-110' :
                    isAnswered && index === selectedAnswer && index !== q.correctIndex ? 'bg-red-500 text-white' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {isAnswered && index === q.correctIndex ? '✓' :
                     isAnswered && index === selectedAnswer && index !== q.correctIndex ? '✗' :
                     String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{option}</span>
                  {isAnswered && index === q.correctIndex && <span className="ml-auto text-green-600 text-xs font-bold">✓ Correct!</span>}
                  {isAnswered && index === selectedAnswer && index !== q.correctIndex && <span className="ml-auto text-red-500 text-xs font-bold">✗ Wrong</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation + Score earned */}
        {isAnswered && (
          <div className="mt-5 space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
              <p className="text-xs font-semibold text-gray-700">
                <span className="text-blue-600 font-bold">💡 Did you know?</span> {q.explanation}
              </p>
            </div>
            {selectedAnswer === q.correctIndex && (
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="text-green-600 font-bold">+{getDifficultyPoints(q.difficulty)}</span>
                {timeLeft > 10 && <span className="text-blue-500 font-bold">+5 speed</span>}
                {streak >= 2 && <span className="text-amber-500 font-bold">+{(streak) * 2} streak</span>}
              </div>
            )}
          </div>
        )}

        {/* Next button */}
        {isAnswered && (
          <button
            onClick={nextQuestion}
            className="mt-5 w-full py-3.5 bg-gradient-to-r from-icici-maroon to-icici-navy text-white font-bold rounded-xl hover:opacity-90 hover:scale-[1.01] transition-all shadow-lg text-sm"
          >
            {currentQ + 1 >= QUIZ_SIZE ? '🏆 See Results!' : '➡️ Next Question'}
          </button>
        )}
      </div>
    </div>
  );
}


