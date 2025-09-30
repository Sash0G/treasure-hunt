import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CLUES = [
  {
    text: "Сметката е лесна,\nспирката (към УАСГ) чудесна,\nмесецът е ясен,\nрожденикът - опасен\nдеца песни правят,\nи с кранове играят,\nно сестрите ги не траят",
    answer: "Финиъс и Фърб"
  },
  {
    text: "На голям софийски площад,\nбаща и син спокойно седят,\nа на периферията близо до ръба\nсе крие храната за деня",
    answer: "Макдоналдс",
  },
  {
    text: "В градската градина на тревата,\nняколко човека гледат небесата,\nизмежду босите им крака,\nкои слети букви съзря?",
    answer: "ШМ"    
  },
  {
    text: "В софийски древни времена,\nбез метро тракийски племена\nимали целта света да покорят,\nи град като Варна да съградят",
    answer: "9000"
  },
  {
    text: "Бибиди бобиди БУМ,\nцар наш със много ум,\nкаляската запалил,\nно часът пък го забравил,\nи така споменът за този ден,\nв който закъснелият бил спасен\nдва образа спокойно пазят,\nи комунистите долни плашат",
    answer: "лъвове"    
  },
  {
    text: "Оранжевото знаем е любимият ти цвят,\nно не вярвай на софиянец като на брат.\nЩе намериш там стар документ,\nа до него стая от картини в комплект.",
    answer: "Галерий",
    image: import.meta.env.BASE_URL + "images/gerb.jpg" 
  }
];

function normalize(s) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

const STORAGE_KEY = "treasure_hunt_progress_v1";

export default function TreasureHuntApp() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [shake, setShake] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed.index === "number" &&
          typeof parsed.started === "boolean"
        ) {
          setStarted(parsed.started);
          setIndex(Math.min(parsed.index, CLUES.length - 1));
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ started, index }));
  }, [started, index]);

  useEffect(() => {
    setValue("");
    setFeedback(null);
    setShake(false);
    if (started) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [index, started]);

  const progressPct = useMemo(() => (index / CLUES.length) * 100, [index]);

  function checkAnswer() {
    const expected = normalize(CLUES[index].answer);
    const got = normalize(value);
    if (!got) {
      setFeedback("Type an answer first ✍️");
      setShake(true);
      setTimeout(() => setShake(false), 350);
      return;
    }
    if (got === expected) {
      setFeedback(null);
      setIndex(index + 1);
    } else {
      setFeedback("Да бе да, банан!");
      setShake(true);
      setTimeout(() => setShake(false), 350);
    }
  }

  function restart() {
    setStarted(false);
    setIndex(0);
    setValue("");
    setFeedback(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="min-h-dvh w-full bg-gradient-to-b from-white to-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-slate-200 w-full">
        <div className="w-full px-4 py-3 flex items-center justify-between">
          <div className="font-semibold tracking-tight">🎉Изненада🎉</div>
        </div>
        <div className="h-1 bg-slate-200 w-full">
          <div
            className="h-1 bg-sky-500 transition-all duration-300"
            style={{
              width: `${started ? Math.min(100, Math.max(2, progressPct)) : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex">
        <AnimatePresence mode="wait">
          {!started ? (
            // Home Page
            <motion.section
              key="home"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex-1 flex flex-col items-center justify-center text-center px-4"
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setStarted(true)}
                className="mt-8 w-full max-w-sm rounded-2xl bg-sky-600 text-white text-lg font-semibold py-4 shadow-md active:shadow-sm"
              >
                Натисни на твой риск
              </motion.button>
            </motion.section>
          ) : index <= CLUES.length - 1 ? (
            // Clue Page
            <motion.section
              key={`clue-${index}`}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex-1 flex flex-col items-center justify-center px-4 text-center"
            >

              {CLUES[index].image && (
                <div className="mt-4 w-full max-w-md">
                  <img
                    src={CLUES[index].image}
                    alt="Clue illustration"
                    className="rounded-lg shadow-md cursor-zoom-in w-full"
                    onClick={() => setZoomImage(CLUES[index].image)}
                  />
                </div>
              )}

              <h2 className="mt-4 text-xl font-semibold leading-snug whitespace-pre-line max-w-lg">
                {CLUES[index].text}
              </h2>

              <input
                id="answer"
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    checkAnswer();
                  }
                }}
                placeholder="Напиши отговор"
                className={`mt-6 w-full max-w-md rounded-2xl border px-4 py-4 text-base outline-none shadow-sm focus:ring-2 focus:ring-sky-400 border-slate-300 bg-white ${
                  shake ? "animate-[shake_0.35s_ease-in-out]" : ""
                }`}
              />

              <p id="feedback" className="min-h-6 mt-2 text-sm text-rose-600">
                {feedback}
              </p>
            </motion.section>
          ) : (
            // Finish Page
            <motion.section
              key="finish"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex-1 flex flex-col items-center justify-center text-center px-4"
            >
              <h2 className="text-2xl font-bold whitespace-pre-line">
                В бърлогата на приятели добри,{"\n"}
                скрити вдън гори,{"\n"}
                подарък намери,{"\n"}
                сготви и си го вземи  
              </h2>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer button */}
      {started && index <= CLUES.length && (
        <div className="fixed inset-x-0 bottom-0 z-10 bg-white/90 backdrop-blur border-t border-slate-200 w-full">
          <div className="w-full py-3 px-4">
            {index <= CLUES.length - 1 ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={checkAnswer}
                className="w-full rounded-2xl bg-sky-600 text-white text-lg font-semibold py-4 shadow-md active:shadow-sm"
              >
                Провери
              </motion.button>
            ) : <></>}
          </div>
        </div>
      )}

      {/* Image zoom modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Zoomed clue"
            className="max-h-[90%] max-w-[90%] rounded-lg shadow-lg cursor-zoom-out"
          />
        </div>
      )}

      <style>{`
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}