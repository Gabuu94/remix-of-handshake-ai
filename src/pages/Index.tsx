import { Link } from "react-router-dom";
import { ArrowRight, Users, TrendingUp, CheckCircle, Shield, Clock, Globe, Zap, Brain, Code, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { icon: Users, value: "10K+", label: "Active Trainers" },
  { icon: TrendingUp, value: "$2.4M+", label: "Paid Out" },
  { icon: CheckCircle, value: "150K+", label: "Tasks Completed" },
];

const features = [
  { icon: Brain, title: "AI Evaluation", description: "Rate model outputs for accuracy, coherence, and helpfulness across domains." },
  { icon: Code, title: "Code Review", description: "Assess code quality, identify bugs, and evaluate best practices in generated code." },
  { icon: FileText, title: "Research & Writing", description: "Verify facts, cross-reference sources, and write expert-level essays." },
  { icon: Shield, title: "Safety & Alignment", description: "Review AI outputs for bias, safety violations, and ethical concerns." },
];

const steps = [
  { step: "01", title: "Create Your Account", description: "Sign up with your email and complete your profile with your areas of expertise." },
  { step: "02", title: "Choose a Plan", description: "Select a subscription plan that matches your availability and earning goals." },
  { step: "03", title: "Complete Tasks", description: "Browse available tasks, submit quality responses, and upload evidence when required." },
  { step: "04", title: "Get Paid", description: "Earn per task with instant M-Pesa withdrawals. No minimum payout threshold." },
];

const benefits = [
  { icon: Zap, title: "Competitive Pay", description: "Earn top rates per task with transparent pricing and no hidden fees." },
  { icon: Globe, title: "Work Anywhere", description: "All tasks are remote. Work from any location with an internet connection." },
  { icon: Clock, title: "Flexible Hours", description: "Choose your own schedule. Complete tasks when it suits you best." },
  { icon: TrendingUp, title: "Skill Growth", description: "Develop expertise in AI evaluation, safety, and cutting-edge research." },
  { icon: Eye, title: "Instant Payouts", description: "Withdraw earnings instantly via M-Pesa. No waiting periods." },
  { icon: Shield, title: "Meaningful Impact", description: "Your work directly shapes how AI models think, reason, and respond." },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">R</span>
            </div>
            <span className="text-xl font-bold">REMOTASK</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/signin">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gap-1">
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(187_92%_48%_/_0.08),_transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Users className="h-3.5 w-3.5" />
            Join 10,000+ AI trainers worldwide
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Train the future of{" "}
            <span className="text-gradient">AI</span>
          </h1>
          <p className="mb-4 text-xl text-muted-foreground md:text-2xl">and get paid for your expertise</p>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Help shape the next generation of AI models through expert evaluation, code review, and data annotation. Earn competitive rates while contributing to AI safety.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="gap-2 text-base">
                Start Earning Today <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="text-base">Learn More</Button>
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap justify-center gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-border bg-card px-6 py-4">
                <stat.icon className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">What You'll Do</h2>
            <p className="text-muted-foreground">Contribute to AI advancement through diverse, meaningful tasks that leverage your expertise.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-card/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="text-muted-foreground">Get started in minutes and begin earning from your first task.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.step} className="relative">
                <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">Step {s.step}</div>
                <h3 className="mb-2 font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">Why REMOTASK?</h2>
            <p className="text-muted-foreground">We're building the best platform for AI trainers worldwide.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-xl border border-border bg-card p-6">
                <b.icon className="mb-3 h-5 w-5 text-primary" />
                <h3 className="mb-2 font-semibold">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to shape the future of AI?</h2>
          <p className="mb-8 text-muted-foreground">
            Join thousands of experts earning competitive rates while contributing to AI safety and advancement.
          </p>
          <Link to="/signup">
            <Button size="lg" className="gap-2 text-base">
              Get Started Now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} REMOTASK. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
