import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialSummary } from "@/hooks/useFinancialData";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Loader2, Sparkles, TrendingUp, PiggyBank, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AICoach = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const financialSummary = useFinancialSummary();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: newMessages,
            financialContext: {
              monthlyIncome: financialSummary.monthlyIncome,
              totalExpenses: financialSummary.totalExpenses,
              totalSavings: financialSummary.totalSavings,
              healthScore: financialSummary.healthScore,
              activeGoals: financialSummary.activeGoals,
              budgetCategories: financialSummary.budgetCategories,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI response");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";

      // Add empty assistant message
      setMessages([...newMessages, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages([...newMessages, { role: 'assistant', content: assistantContent }]);
            }
          } catch {
            // Incomplete JSON, put back and wait for more data
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save messages to database
      if (user) {
        await supabase.from('chat_messages').insert([
          { user_id: user.id, role: 'user', content: userMessage },
          { user_id: user.id, role: 'assistant', content: assistantContent },
        ]);
      }
    } catch (error: any) {
      console.error("AI Coach error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive",
      });
      // Remove the user message if we failed
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    streamChat(input.trim());
  };

  const quickPrompts = [
    { icon: TrendingUp, text: "How can I improve my savings?" },
    { icon: PiggyBank, text: "Create a budget plan for me" },
    { icon: Target, text: "Help me set financial goals" },
    { icon: Sparkles, text: "Analyze my spending habits" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-4 flex flex-col">
        <div className="container mx-auto px-4 flex-1 flex flex-col max-w-4xl">
          {/* Header */}
          <div className="py-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20 glow-effect">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold">AI Financial Coach</h1>
                <p className="text-sm text-muted-foreground">
                  Powered by advanced AI • Real-time personalized advice
                </p>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto py-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-8">
                <div className="text-center space-y-3">
                  <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto">
                    <Bot className="h-12 w-12 text-primary" />
                  </div>
                  <h2 className="text-xl font-display font-semibold">
                    Hi! I'm your AI Financial Coach
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    I can help you with budgeting, savings tips, financial planning, and understanding your spending patterns. What would you like to discuss?
                  </p>
                </div>

                {/* Quick Prompts */}
                <div className="grid sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt.text}
                      onClick={() => streamChat(prompt.text)}
                      disabled={isLoading}
                      className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-primary/50 transition-all text-left"
                    >
                      <prompt.icon className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-sm">{prompt.text}</span>
                    </button>
                  ))}
                </div>

                {/* Financial Context Card */}
                <div className="glass-card p-4 w-full max-w-lg">
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">Your Financial Snapshot</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Health Score</p>
                      <p className="text-lg font-bold text-primary">{financialSummary.healthScore}/100</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly Savings</p>
                      <p className={`text-lg font-bold ${financialSummary.totalSavings >= 0 ? 'text-success' : 'text-destructive'}`}>
                        ₹{financialSummary.totalSavings.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Active Goals</p>
                      <p className="text-lg font-bold">{financialSummary.activeGoals}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Budget Categories</p>
                      <p className="text-lg font-bold">{financialSummary.budgetCategories.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="p-2 rounded-lg bg-primary/20 h-fit">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-4 ${
                        message.role === 'user'
                          ? 'chat-bubble-user'
                          : 'chat-bubble-ai'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content || (isLoading && index === messages.length - 1 ? '...' : '')}</p>
                    </div>
                    {message.role === 'user' && (
                      <div className="p-2 rounded-lg bg-secondary h-fit">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="py-4 border-t border-border">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about budgeting, savings, investments..."
                disabled={isLoading}
                className="flex-1 h-12 bg-secondary/50"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                variant="glow"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-3">
              AI advice is for educational purposes. Consult a financial advisor for major decisions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AICoach;
