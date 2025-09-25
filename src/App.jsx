import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Single-file mobile-first treasure hunt website
// - Home page with description + Start button
// - Clue pages: clue text, answer input, Check Answer button
// - Wrong answer: show a helpful message
// - Correct answer: go to next clue automatically
// - Final page: simple celebration + restart option
// - Optimized for phones: big tap targets, legible text, sticky CTA, fast
// - Progress is saved in localStorage so players can resume

const CLUES  = [
  {
    text: "I speak without a mouth and hear without ears. I have nobody, but I come alive with wind. What am I?",
    answer: "echo",
    hint: "A repeating sound",
  },
  {
    text: "The more of this there is, the less you see. What is it?",
    answer: "darkness",
    hint: "Opposite of light",
  },
  {
    text: "What has to be broken before you can use it?",
    answer: "egg",
    hint: "Breakfast staple",
  },
];

function normalize(s) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

const STORAGE_KEY = "treasure_hunt_progress_v1";

export default function TreasureHuntApp() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0); // which clue
const [value, setValue] = useState("");
const [feedback, setFeedback] = useState(null);
const [shake, setShake] = useState(false);
const inputRef = useRef(null);


  // Load progress
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.index === "number" && typeof parsed.started === "boolean") {
          setStarted(parsed.started);
          setIndex(Math.min(parsed.index, CLUES.length - 1));
        }
      } catch {}
    }
  }, []);

  // Save progress
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ started, index })
    );
  }, [started, index]);

  // Reset UI for each clue
  useEffect(() => {
    setValue("");
    setFeedback(null);
    setShake(false);
    if (started) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [index, started]);

  const isLast = index >= CLUES.length - 1;
  const progressPct = useMemo(() => ((index) / CLUES.length) * 100, [index]);

  function checkAnswer() {
    const expected = normalize(CLUES[index].answer);
    const got = normalize(value);
    if (!got) {
      setFeedback("Type an answer first ✍️");
      setShake(true); setTimeout(() => setShake(false), 350);
      return;
    }
    if (got === expected) {
      setFeedback(null);
      if (isLast) {
        setIndex(index + 1); // move past last to trigger finish screen
      } else {
        setIndex(index + 1);
      }
    } else {
      setFeedback("Not quite. Try again! ✨");
      setShake(true); setTimeout(() => setShake(false), 350);
    }
  }

  function restart() {
    setStarted(false);
    setIndex(0);
    setValue("");
    setFeedback(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  // Simple page variants for transitions
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-white to-slate-50 text-slate-900 flex flex-col">
      {/* App Bar */}
      <div className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-screen-sm px-4 py-3 flex items-center justify-between">
          <div className="font-semibold tracking-tight">Treasure Hunt</div>
          <button
            onClick={restart}
            className="text-sm px-3 py-1 rounded-xl border border-slate-300 active:scale-[0.98]"
            aria-label="Restart"
          >
            Restart
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-slate-200">
          <div
            className="h-1 bg-sky-500 transition-all duration-300"
            style={{ width: `${started ? Math.min(100, Math.max(2, progressPct)) : 0}%` }}
          />
        </div>
      </div>

      <main className="mx-auto w-full max-w-screen-sm flex-1 px-4 pb-28 pt-6">
        <AnimatePresence mode="wait">
          {!started ? (
            <motion.section
              key="home"
              variants={pageVariants}
              initial="initial" animate="animate" exit="exit"
              className="text-center"
            >
              <h1 className="text-2xl font-bold leading-tight">Ready for a Treasure Hunt?</h1>
              <p className="mt-3 text-slate-600">
                Solve each clue to advance. Enter the correct answer and tap <span className="font-medium">Check</span>.
                Perfect for playing on your phone.
              </p>
              <ul className="mt-4 inline-flex items-center gap-2 text-sm text-slate-500">
                <li>🔐 Progress auto-saves</li>
                <li>📱 Mobile-optimized</li>
                <li>✨ Smooth transitions</li>
              </ul>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setStarted(true)}
                className="mt-8 w-full rounded-2xl bg-sky-600 text-white text-lg font-semibold py-4 shadow-md active:shadow-sm"
              >
                Start
              </motion.button>
            </motion.section>
          ) : index <= CLUES.length - 1 ? (
            <motion.section
              key={`clue-${index}`}
              variants={pageVariants}
              initial="initial" animate="animate" exit="exit"
            >
              <div className="text-xs uppercase tracking-wide text-slate-500">Clue {index + 1} of {CLUES.length}</div>
              <h2 className="mt-2 text-xl font-semibold leading-snug">{CLUES[index].text}</h2>

              {CLUES[index].hint && (
                <details className="mt-3 text-sm text-slate-600">
                  <summary className="cursor-pointer select-none inline-flex items-center gap-1">Need a hint?</summary>
                  <div className="mt-1">💡 {CLUES[index].hint}</div>
                </details>
              )}

              <label htmlFor="answer" className="sr-only">Your answer</label>
              <input
                id="answer"
                ref={inputRef}
                inputMode="text"
                autoCapitalize="none"
                autoComplete="off"
                spellCheck={false}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); checkAnswer(); } }}
                placeholder="Type your answer here…"
                className={`mt-6 w-full rounded-2xl border px-4 py-4 text-base outline-none shadow-sm focus:ring-2 focus:ring-sky-400 border-slate-300 bg-white ${
                  shake ? "animate-[shake_0.35s_ease-in-out]" : ""
                }`}
                aria-invalid={feedback ? true : false}
                aria-describedby={feedback ? "feedback" : undefined}
              />

              <p id="feedback" className="min-h-6 mt-2 text-sm text-rose-600">{feedback}</p>

              <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
                <span>Tip: Press Enter to check</span>
                <button
                  className="underline"
                  onClick={() => setValue("")}
                >
                  Clear
                </button>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="finish"
              variants={pageVariants}
              initial="initial" animate="animate" exit="exit"
              className="text-center"
            >
              <h2 className="text-2xl font-bold">You found the treasure! 🎉</h2>
              <p className="mt-2 text-slate-600">Great job solving all the clues.</p>
              <div className="mt-6 grid gap-3">
                <button
                  onClick={restart}
                  className="w-full rounded-2xl border border-slate-300 bg-white py-4 font-medium shadow-sm active:scale-[0.99]"
                >
                  Play Again
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Sticky Bottom Bar */}
      {started && index <= CLUES.length && (
        <div className="fixed inset-x-0 bottom-0 z-10 bg-white/90 backdrop-blur border-t border-slate-200">
          <div className="mx-auto max-w-screen-sm px-4 py-3">
            {index <= CLUES.length - 1 ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={checkAnswer}
                className="w-full rounded-2xl bg-sky-600 text-white text-lg font-semibold py-4 shadow-md active:shadow-sm"
              >
                Check Answer
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={restart}
                className="w-full rounded-2xl bg-sky-600 text-white text-lg font-semibold py-4 shadow-md"
              >
                Restart
              </motion.button>
            )}
          </div>
        </div>
      )}

      {/* Tiny CSS keyframes for shake */}
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

/*
============================
How to customize:
- Edit the CLUES array above. Each item has { text, answer, hint? }.
- Answers are matched case-insensitively; whitespace is ignored.
- This single file can be dropped into any React + Tailwind project.

If you prefer a plain HTML file instead of React, ask me and I'll provide it.
============================
*/
