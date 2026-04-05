import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import PackagePopup from "@/components/PackagePopup";
import { formatMoney } from "@/lib/currency";

const TEXT_ANNOTATION_QUESTIONS = [
  {
    question: "Read the following passage and identify the primary sentiment expressed:\n\n\"Despite the company's record-breaking quarterly revenue, employees reported feeling increasingly disconnected from leadership, citing a lack of transparency in decision-making processes and growing concerns about job security amid restructuring plans.\"",
    options: [
      "Positive — the company achieved record revenue",
      "Mixed — financial success contrasted with employee dissatisfaction",
      "Negative — employees feel disconnected and insecure",
      "Neutral — it's a factual business report"
    ],
    correct: 1,
  },
  {
    question: "Classify the intent of this user query:\n\n\"I've been charged twice for my subscription this month and I need this resolved immediately or I'm switching to your competitor.\"",
    options: [
      "Information request — user wants to understand billing",
      "Complaint with churn risk — urgent billing issue with threat to leave",
      "Feature request — user wants better billing management",
      "General feedback — user sharing their experience"
    ],
    correct: 1,
  },
  {
    question: "Analyze this text and determine which Named Entity Recognition (NER) labels apply:\n\n\"Dr. Sarah Chen published her findings on neural plasticity in the Journal of Cognitive Neuroscience on March 15, 2024, while working at MIT's Brain and Cognitive Sciences department.\"",
    options: [
      "PERSON, DATE, ORGANIZATION only",
      "PERSON, WORK_OF_ART, DATE, ORGANIZATION",
      "PERSON, TOPIC, DATE, ORGANIZATION, PUBLICATION",
      "PERSON, FIELD, DATE, ORGANIZATION, JOURNAL"
    ],
    correct: 2,
  },
  {
    question: "Read both texts and determine the relationship:\n\nText A: \"Global temperatures rose by 1.2°C above pre-industrial levels in 2023.\"\nText B: \"The year 2023 saw unprecedented heatwaves across Southern Europe, with temperatures exceeding 45°C in multiple cities.\"",
    options: [
      "Contradiction — the texts present conflicting data",
      "Entailment — Text B is a direct consequence described in Text A",
      "Elaboration — Text B provides specific regional evidence supporting Text A's claim",
      "Unrelated — the texts discuss different phenomena"
    ],
    correct: 2,
  },
  {
    question: "Evaluate the following AI-generated response for factual accuracy and helpfulness:\n\nUser: \"What causes the Northern Lights?\"\nAI: \"The Northern Lights (Aurora Borealis) are caused by charged particles from the sun colliding with gases in Earth's atmosphere. These particles are guided by Earth's magnetic field toward the poles, where they excite nitrogen and oxygen molecules, causing them to emit photons of light in various colors.\"",
    options: [
      "Inaccurate — the sun doesn't emit charged particles",
      "Partially accurate — correct mechanism but wrong about the gases involved",
      "Accurate and helpful — scientifically correct explanation at an accessible level",
      "Accurate but unhelpful — too technical for the average user"
    ],
    correct: 2,
  },
  {
    question: "Identify the logical fallacy in this argument:\n\n\"Our new productivity software must be the best on the market because over 10,000 companies have already purchased it. If so many businesses chose our product, it clearly outperforms all alternatives.\"",
    options: [
      "Straw man — misrepresenting the competitor's position",
      "Ad populum (bandwagon) — equating popularity with quality",
      "False dilemma — presenting only two options",
      "Hasty generalization — drawing conclusions from insufficient data"
    ],
    correct: 1,
  },
];

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isActive } = useSubscription();
  const queryClient = useQueryClient();
  const [showPackage, setShowPackage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Quiz state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(TEXT_ANNOTATION_QUESTIONS.length).fill(null));
  const [quizDone, setQuizDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ score: number; passed: boolean } | null>(null);

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: existing } = useQuery({
    queryKey: ["completion", id, user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("task_completions").select("*").eq("task_id", id!).eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const isTextAnnotation = task?.category === "Data Annotation" && task?.title === "Text Annotation";
  const isFreeTask = task?.requires_subscription === false;
  const mustUpgrade = !isActive && !isFreeTask;

  const handleSelectAnswer = (optionIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQ < TEXT_ANNOTATION_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  const handleFinishQuiz = async () => {
    setAnalyzing(true);
    // Simulate analysis
    await new Promise(r => setTimeout(r, 2500));

    let correct = 0;
    TEXT_ANNOTATION_QUESTIONS.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    const score = Math.round((correct / TEXT_ANNOTATION_QUESTIONS.length) * 100);
    const passed = score >= 50; // pass at 50%+

    setAnalysisResult({ score, passed });
    setAnalyzing(false);

    if (passed) {
      // Submit to backend
      setSubmitting(true);
      try {
        const { data, error } = await supabase.functions.invoke("complete-task", {
          body: {
            task_id: id,
            submission_text: `Quiz completed: ${correct}/${TEXT_ANNOTATION_QUESTIONS.length} correct (${score}%)`,
          },
        });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || "Failed to submit");

        toast.success(`Task completed! You earned ${formatMoney(data.earned)}. Balance: ${formatMoney(data.balance)}`);
        queryClient.invalidateQueries({ queryKey: ["completion", id] });
        queryClient.invalidateQueries({ queryKey: ["my-completions"] });
        queryClient.invalidateQueries({ queryKey: ["profile-balance"] });
        queryClient.invalidateQueries({ queryKey: ["earnings"] });
        queryClient.invalidateQueries({ queryKey: ["completions-stats"] });
      } catch (err: any) {
        toast.error(err.message || "Submission failed");
      }
      setSubmitting(false);
    }
    setQuizDone(true);
  };

  // Non-annotation task: simple textarea submit
  const [submission, setSubmission] = useState("");
  const handleSimpleSubmit = async () => {
    if (mustUpgrade) { setShowPackage(true); return; }
    if (!submission.trim()) { toast.error("Please enter your submission"); return; }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("complete-task", {
        body: { task_id: id, submission_text: submission },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to submit");
      toast.success(`Task completed! You earned ${formatMoney(data.earned)}. Balance: ${formatMoney(data.balance)}`);
      queryClient.invalidateQueries({ queryKey: ["completion", id] });
      queryClient.invalidateQueries({ queryKey: ["my-completions"] });
      queryClient.invalidateQueries({ queryKey: ["profile-balance"] });
      queryClient.invalidateQueries({ queryKey: ["earnings"] });
      queryClient.invalidateQueries({ queryKey: ["completions-stats"] });
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    }
    setSubmitting(false);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  if (!task) {
    return <div className="py-20 text-center text-muted-foreground">Task not found</div>;
  }

  const currentQuestion = TEXT_ANNOTATION_QUESTIONS[currentQ];
  const allAnswered = answers.every(a => a !== null);

  return (
    <div className="mx-auto max-w-2xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Tasks
      </button>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Badge variant="outline">{task.category}</Badge>
          <Badge variant="outline">{task.difficulty}</Badge>
          {isFreeTask && <Badge className="bg-green-500/10 text-green-400 border-green-500/30">FREE</Badge>}
        </div>
        <h1 className="mb-2 text-2xl font-bold">{task.title}</h1>
        <p className="mb-4 text-muted-foreground">{task.description}</p>
        <div className="mb-6 text-2xl font-bold text-green-400">{formatMoney(task.reward)}</div>

        {mustUpgrade && !existing ? (
          <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-6 text-center">
            <Lock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h3 className="mb-2 font-semibold">Upgrade Required</h3>
            <p className="mb-4 text-sm text-muted-foreground">Upgrade your account to access this survey and start earning.</p>
            <Button onClick={() => setShowPackage(true)} className="bg-purple-500 hover:bg-purple-600">View Packages</Button>
          </div>
        ) : existing ? (
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
            <p className="font-medium text-green-400">✓ Completed — {formatMoney(existing.earned_amount || 0)} earned</p>
            {existing.submission_text && <p className="mt-2 text-sm text-muted-foreground">{existing.submission_text}</p>}
          </div>
        ) : isTextAnnotation ? (
          /* Interactive Quiz */
          analyzing ? (
            <div className="py-10 text-center">
              <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
              <h3 className="text-lg font-semibold mb-2">Analyzing Your Responses...</h3>
              <p className="text-sm text-muted-foreground">Verifying accuracy and processing results</p>
            </div>
          ) : quizDone && analysisResult ? (
            <div className="text-center py-6">
              {analysisResult.passed ? (
                <>
                  <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-400" />
                  <h3 className="text-xl font-bold text-green-400 mb-2">Survey Passed!</h3>
                  <p className="text-muted-foreground mb-2">Score: {analysisResult.score}%</p>
                  <p className="text-sm text-muted-foreground">Your earnings have been credited to your balance.</p>
                </>
              ) : (
                <>
                  <Lock className="mx-auto mb-3 h-12 w-12 text-red-400" />
                  <h3 className="text-xl font-bold text-red-400 mb-2">Score Too Low</h3>
                  <p className="text-muted-foreground mb-2">Score: {analysisResult.score}%</p>
                  <p className="text-sm text-muted-foreground">You need at least 50% to pass. This free survey can only be attempted once.</p>
                </>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Question {currentQ + 1} of {TEXT_ANNOTATION_QUESTIONS.length}</h3>
                <span className="text-xs text-muted-foreground">{answers.filter(a => a !== null).length}/{TEXT_ANNOTATION_QUESTIONS.length} answered</span>
              </div>

              {/* Progress bar */}
              <div className="mb-4 h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${((currentQ + 1) / TEXT_ANNOTATION_QUESTIONS.length) * 100}%` }}
                />
              </div>

              <p className="mb-4 text-sm whitespace-pre-line">{currentQuestion.question}</p>

              <div className="space-y-2 mb-6">
                {currentQuestion.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectAnswer(i)}
                    className={`w-full text-left rounded-lg border p-3 text-sm transition-colors ${
                      answers[currentQ] === i
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : "border-border hover:border-muted-foreground/50"
                    }`}
                  >
                    <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                {currentQ > 0 && (
                  <Button variant="outline" onClick={handlePrev}>Previous</Button>
                )}
                {currentQ < TEXT_ANNOTATION_QUESTIONS.length - 1 ? (
                  <Button onClick={handleNext} disabled={answers[currentQ] === null} className="bg-primary">
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinishQuiz}
                    disabled={!allAnswered || submitting}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    {submitting ? "Processing..." : "Submit Survey"}
                  </Button>
                )}
              </div>
            </div>
          )
        ) : (
          /* Regular task textarea */
          <div>
            <h3 className="mb-3 font-semibold">Submit Your Response</h3>
            <textarea
              placeholder="Enter your task submission here..."
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              className="mb-4 min-h-[150px] w-full rounded-lg border border-border bg-background p-3 text-sm"
            />
            <Button onClick={handleSimpleSubmit} disabled={!submission.trim() || submitting} className="bg-green-500 hover:bg-green-600">
              {submitting ? "Submitting..." : "Submit Task"}
            </Button>
          </div>
        )}
      </div>

      {showPackage && <PackagePopup onClose={() => setShowPackage(false)} />}
    </div>
  );
}
