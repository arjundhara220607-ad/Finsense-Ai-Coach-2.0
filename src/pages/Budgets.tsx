import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBudgets, useAddBudget, useDeleteBudget, useTransactions } from "@/hooks/useFinancialData";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Trash2,
  PieChart,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const BUDGET_CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 
  'Healthcare', 'Education', 'Subscriptions', 'Utilities', 'Other'
];

const COLORS = [
  '#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6',
  '#10b981', '#3b82f6', '#ec4899', '#84cc16', '#06b6d4'
];

const Budgets = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: budgets = [], isLoading } = useBudgets();
  const { data: transactions = [] } = useTransactions();
  const addBudget = useAddBudget();
  const deleteBudget = useDeleteBudget();

  const [isOpen, setIsOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: '',
    limit_amount: '',
    period: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    color: COLORS[0],
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Calculate spending per category for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const categorySpending = transactions
    .filter((t) => {
      const date = new Date(t.date);
      return t.type === 'expense' && 
        date.getMonth() === currentMonth && 
        date.getFullYear() === currentYear;
    })
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.category || !newBudget.limit_amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check if budget for category already exists
    if (budgets.some((b) => b.category === newBudget.category)) {
      toast({
        title: "Error",
        description: "A budget for this category already exists",
        variant: "destructive",
      });
      return;
    }

    try {
      await addBudget.mutateAsync({
        category: newBudget.category,
        limit_amount: parseFloat(newBudget.limit_amount),
        period: newBudget.period,
        color: newBudget.color,
      });
      toast({
        title: "Success",
        description: "Budget created successfully",
      });
      setIsOpen(false);
      setNewBudget({
        category: '',
        limit_amount: '',
        period: 'monthly',
        color: COLORS[budgets.length % COLORS.length],
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create budget",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget.mutateAsync(id);
      toast({
        title: "Deleted",
        description: "Budget removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.limit_amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (categorySpending[b.category] || 0), 0);
  const overBudgetCount = budgets.filter((b) => (categorySpending[b.category] || 0) > Number(b.limit_amount)).length;

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold">Budgets</h1>
              <p className="text-muted-foreground">Manage your spending limits</p>
            </div>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="glow">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card">
                <DialogHeader>
                  <DialogTitle>Create Budget</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newBudget.category}
                      onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUDGET_CATEGORIES.filter(
                          (cat) => !budgets.some((b) => b.category === cat)
                        ).map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Limit Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={newBudget.limit_amount}
                      onChange={(e) => setNewBudget({ ...newBudget, limit_amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Period</Label>
                    <Select
                      value={newBudget.period}
                      onValueChange={(value: 'weekly' | 'monthly' | 'yearly') => 
                        setNewBudget({ ...newBudget, period: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewBudget({ ...newBudget, color })}
                          className={`w-8 h-8 rounded-full transition-all ${
                            newBudget.color === color ? 'ring-2 ring-offset-2 ring-offset-background ring-primary' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={addBudget.isPending}>
                    {addBudget.isPending ? 'Creating...' : 'Create Budget'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <PieChart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-xl font-bold">₹{totalBudget.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/20">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Spent This Month</p>
                  <p className="text-xl font-bold">₹{totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${overBudgetCount > 0 ? 'bg-destructive/20' : 'bg-success/20'}`}>
                  {overBudgetCount > 0 ? (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Over Budget</p>
                  <p className="text-xl font-bold">{overBudgetCount} categories</p>
                </div>
              </div>
            </div>
          </div>

          {/* Budgets Grid */}
          {budgets.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgets.map((budget) => {
                const spent = categorySpending[budget.category] || 0;
                const percentage = Math.min((spent / Number(budget.limit_amount)) * 100, 100);
                const isOverBudget = spent > Number(budget.limit_amount);

                return (
                  <div key={budget.id} className="glass-card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: budget.color }}
                        />
                        <div>
                          <h3 className="font-semibold">{budget.category}</h3>
                          <p className="text-xs text-muted-foreground capitalize">{budget.period}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(budget.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Spent</span>
                        <span className={isOverBudget ? 'text-destructive font-medium' : ''}>
                          ₹{spent.toLocaleString()} / ₹{Number(budget.limit_amount).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: isOverBudget ? 'hsl(var(--destructive))' : budget.color,
                          }}
                        />
                      </div>

                      {isOverBudget ? (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Over budget by ₹{(spent - Number(budget.limit_amount)).toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          ₹{(Number(budget.limit_amount) - spent).toLocaleString()} remaining
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card py-12 text-center">
              <PieChart className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No budgets created yet</p>
              <p className="text-sm text-muted-foreground">Create your first budget to start tracking spending</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Budgets;
