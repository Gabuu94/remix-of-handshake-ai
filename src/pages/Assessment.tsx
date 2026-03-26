import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const questions = [
  {
    title: "Arrange the Sentence",
    instruction: "Put these words in the correct order to form a sentence:",
    words: ["is", "the", "cat", "sleeping"],
    answer: "the cat is sleeping",
  },
  {
    title: "Classify the Text",
    instruction: "What category best describes this text: 'The stock market rose 3% today'",
    words: ["Sports", "Finance", "Technology", "Health"],
    answer: "Finance",
    isMCQ: true,
  },
  {
    title: "Identify the Error",
    instruction: "Which word is misspelled?",
    words: ["Beautiful", "Recieve", "Tomorrow", "Separate"],
    answer: "Recieve",
    isMCQ: true,
  },
  {
    title: "Complete the Pattern",
    instruction: "What comes next: 2, 4, 8, 16, ?",
    words: ["24", "32", "28", "36"],
    answer: "32",
    isMCQ: true,
  },
  {
    title: "Label the Sentiment",
    instruction: "Is this sentence positive, negative, or neutral: 'The weather is absolutely wonderful today!'",
    words: ["Positive", "Negative", "Neutral", "Mixed"],
    answer: "Positive",
    isMCQ: true,
  },
];

type Phase = "intro" | "quiz" | "result" | "bonus";

export default function Assessment() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("intro");
  const [current, setCurrent] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleWordTap = (word: string) => {
    const q = questions[current];
    if (q.isMCQ) {
      setSelectedWords([word]);
    } else {
      if (selectedWords.includes(word)) {
        setSelectedWords(selectedWords.filter((w) => w !== word));
      } else {
        setSelectedWords([...selectedWords, word]);
      }
    }
  };

  const handleNext = () => {
    const q = questions[current];
    let userAnswer: string;
    if (q.isMCQ) {
      userAnswer = selectedWords[0] || "";
    } else {
      userAnswer = selectedWords.join(" ");
    }
    const newAnswers = [...answers, userAnswer];
    setAnswers(newAnswers);

    const isCorrect = userAnswer.toLowerCase() === q.answer.toLowerCase();
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelectedWords([]);
    } else {
      setPhase("result");
    }
  };

  const percentage = Math.round((score / questions.length) * 100);

  if (phase === "intro") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-purple-500/30 shadow-lg">
          <span className="text-6xl">🎯</span>
        </div>
        <h1 className="mt-6 text-center text-2xl font-bold">Welcome to<br />AI Training Assessment</h1>
        <div className="mt-6 w-full max-w-md rounded-2xl border border-border bg-card p-6">
          <p className="mb-4 text-muted-foreground">Complete this quick assessment to verify your skills in:</p>
          <div className="space-y-2">
            {["Text annotation & labeling", "Sentence arrangement", "Content classification", "Data categorization", "Pattern recognition"].map((s) => (
              <p key={s} className="flex items-center gap-2 text-sm">
                <span className="text-green-400">✓</span> {s}
              </p>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">This will only take 2-3 minutes!</p>
        </div>
        <button
          onClick={() => setPhase("quiz")}
          className="mt-6 w-full max-w-md rounded-2xl bg-purple-500 py-4 text-lg font-bold text-white hover:bg-purple-600"
        >
          Start Assessment →
        </button>
      </div>
    );
  }

  if (phase === "quiz") {
    const q = questions[current];
    return (
      <div className="flex min-h-screen flex-col bg-background px-4 py-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 rounded-2xl bg-secondary/50 py-3 text-center font-semibold">
            Question {current + 1} of {questions.length}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 text-lg font-bold text-white">
              {current + 1}
            </div>
            <h2 className="mb-2 text-xl font-bold">{q.title}</h2>
            <p className="mb-6 text-sm text-muted-foreground">{q.instruction}</p>

            <p className="mb-3 text-sm text-muted-foreground">
              {q.isMCQ ? "Select the correct answer:" : "Tap the words in the correct order:"}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {q.words.map((word) => (
                <button
                  key={word}
                  onClick={() => handleWordTap(word)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    selectedWords.includes(word)
                      ? "border-purple-500 bg-purple-500/20 text-purple-300"
                      : "border-border bg-secondary/50 text-foreground hover:border-muted-foreground"
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>

            {!q.isMCQ && (
              <div className="mt-4 rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 text-center text-sm text-muted-foreground">
                Your answer: {selectedWords.length > 0 ? selectedWords.join(" ") : "(tap words above)"}
              </div>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={selectedWords.length === 0}
            className="mt-6 w-full rounded-2xl bg-green-500 py-4 text-lg font-bold text-white transition-opacity disabled:opacity-40 hover:bg-green-600"
          >
            {current < questions.length - 1 ? "Next Question →" : "Finish Assessment →"}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-green-500">
          <span className="text-5xl text-white font-bold">✓</span>
        </div>
        <h1 className="mt-6 text-center text-2xl font-bold">Congratulations!<br />Screening Passed!</h1>

        <div className="mt-6 w-full max-w-md rounded-2xl border border-green-500/30 bg-card p-6 text-center">
          <p className="text-muted-foreground">Your Score</p>
          <p className="mt-2 text-5xl font-bold text-green-400">{percentage}%</p>
          <p className="mt-2 text-sm text-muted-foreground">{score} out of {questions.length} questions correct</p>
          <p className="mt-2 flex items-center justify-center gap-2 text-sm text-green-400">
            <CheckCircle className="h-4 w-4" /> Qualified for AI Training Tasks
          </p>
        </div>

        <button
          onClick={() => setPhase("bonus")}
          className="mt-6 w-full max-w-md rounded-2xl bg-green-500 py-4 text-lg font-bold text-white hover:bg-green-600"
        >
          Continue →
        </button>
      </div>
    );
  }

  // Bonus phase
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
            <span className="text-5xl">🏆</span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <span className="inline-block rounded-full border border-green-500/40 bg-green-500/10 px-4 py-1 text-sm font-semibold text-green-400">
            🎉 CONGRATULATIONS
          </span>
        </div>

        <h2 className="mt-4 text-center text-2xl font-bold">Welcome Bonus</h2>

        <div className="mt-4 rounded-xl border border-border bg-secondary/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">KES</p>
          <p className="text-5xl font-bold text-green-400">KES 600.00</p>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">Credited to your account</p>

        <div className="mt-4 space-y-2">
          {["Available for instant use", "No withdrawal maximum", "Start earning immediately"].map((t) => (
            <p key={t} className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span> {t}
            </p>
          ))}
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 w-full rounded-2xl bg-green-500 py-4 text-lg font-bold text-white hover:bg-green-600"
        >
          Claim & Continue →
        </button>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">🔒 Secure • Instant • Guaranteed • One-Time Offer</p>
    </div>
  );
}
