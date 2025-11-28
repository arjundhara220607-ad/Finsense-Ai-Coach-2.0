import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, TrendingUp, Shield, Target, PieChart, Zap, ChevronDown } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="floating-particles"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
              animationDelay: `${i * 1.2}s`,
            }}
          />
        ))}

        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              AI-Powered Financial Coaching
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
              Your Financial{" "}
              <span className="gradient-text">Pulse</span>
              <br />
              Stays Healthy
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              AI-powered financial coaching designed for gig workers, freelancers, and anyone with irregular income. Get personalized insights, smart budgeting, and proactive guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/dashboard">
                <Button variant="hero" size="xl">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/ai-coach">
                <Button variant="heroOutline" size="xl">
                  <Bot className="mr-2 h-5 w-5" />
                  Meet AI Coach
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative animate-slide-up delay-200">
            <div className="glass-card p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
              
              {/* Mock Dashboard */}
              <div className="relative space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last 7 Days</span>
                  <div className="flex items-center gap-2 text-success">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+12.5%</span>
                  </div>
                </div>
                
                {/* Chart mockup */}
                <div className="h-40 flex items-end gap-2">
                  {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-primary/60 to-primary rounded-t-md"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="stat-card">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-success/20">
                        <TrendingUp className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Monthly Savings</p>
                        <p className="text-lg font-bold text-success">+₹12,500</p>
                      </div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Health Score</p>
                        <p className="text-lg font-bold text-primary">85</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              Built for Your Financial Journey
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features that adapt to your unique financial situation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-6 hover:border-primary/50 transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold">
                Ready to Take Control of Your Finances?
              </h2>
              <p className="text-muted-foreground">
                Join thousands of gig workers and freelancers who are building better financial habits with FinSense.
              </p>
              <Link to="/auth">
                <Button variant="glow" size="xl">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const features = [
  {
    icon: Bot,
    title: "AI-Powered Insights",
    description: "Get personalized recommendations based on your spending patterns and income fluctuations.",
  },
  {
    icon: Target,
    title: "Smart Health Score",
    description: "Real-time dynamic score that reflects your financial wellness and guides better habits.",
  },
  {
    icon: Zap,
    title: "Proactive Nudges",
    description: "Timely reminders and context-aware alerts that help you stay on track with goals.",
  },
  {
    icon: Shield,
    title: "Risk Detection",
    description: "Advanced algorithms detect overspending and upcoming financial risks before they happen.",
  },
  {
    icon: PieChart,
    title: "Adaptive Budgeting",
    description: "Flexible budgets that automatically adjust to your irregular income patterns.",
  },
  {
    icon: TrendingUp,
    title: "Visual Analytics",
    description: "Beautiful dashboards that make understanding your finances effortless and actionable.",
  },
];

export default Index;
