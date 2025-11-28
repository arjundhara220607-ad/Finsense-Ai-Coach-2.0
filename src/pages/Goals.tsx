import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGoals, useAddGoal, useUpdateGoal, useDeleteGoal } from "@/hooks/useFinancialData";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Trash2,
  Target,
  Trophy,
  Calendar,
  Pencil,
  Check,
  X
} from "lucide-react";
import { format } from "date-fns";

const COLORS = [
  '#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#10b981', '#3b82f6', '#ec4899', '#84cc16', '#06b6d4'
];

const Goals = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: goals = [], isLoading } = useGoals();
  const addGoal = useAddGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const [isOpen, setIsOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    current_amount: 0,
    deadline: '',
    status: 'active' as 'active' | 'completed' | 'cancelled',
    color: COLORS[0],
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.target_amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await addGoal.mutateAsync({
        title: newGoal.title,
        target_amount: parseFloat(newGoal.target_amount),
        current_amount: newGoal.current_amount,
        deadline: newGoal.deadline || null,
        status: 'active',
        color: newGoal.color,
      });
      toast({
        title: "Success",
        description: "Goal created successfully",
      });
      setIsOpen(false);
      setNewGoal({
        title: '',
        target_amount: '',
        current_amount: 0,
        deadline: '',
        status: 'active',
        color: COLORS[goals.length % COLORS.length],
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create goal",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAmount = async (id: string) => {
    try {
      const goal = goals.find((g) => g.id === id);
      if (!goal) return;

      const newAmount = parseFloat(editAmount);
      if (isNaN(newAmount) || newAmount < 0) {
        toast({
          title: "Error",
          description: "Please enter a valid amount",
          variant: "destructive",
        });
        return;
      }

      const status = newAmount >= Number(goal.target_amount) ? 'completed' : 'active';
      
      await updateGoal.mutateAsync({
        id,
        current_amount: newAmount,
        status,
      });
      
      toast({
        title: status === 'completed' ? "Goal Completed! 🎉" : "Progress Updated",
        description: status === 'completed' 
          ? `Congratulations! You've reached your goal.`
          : `Updated to ₹${newAmount.toLocaleString()}`,
      });
      
      setEditingGoal(null);
      setEditAmount('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGoal.mutateAsync(id);
      toast({
        title: "Deleted",
        description: "Goal removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  
  const totalTarget = activeGoals.reduce((sum, g) => sum + Number(g.target_amount), 0);
  const totalSaved = activeGoals.reduce((sum, g) => sum + Number(g.current_amount), 0);

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
              <h1 className="text-3xl font-display font-bold">Financial Goals</h1>
              <p className="text-muted-foreground">Track your savings targets</p>
            </div>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="glow">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card">
                <DialogHeader>
                  <DialogTitle>Create Goal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Goal Title</Label>
                    <Input
                      placeholder="e.g., Emergency Fund"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Target Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="100000"
                      value={newGoal.target_amount}
                      onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Deadline (Optional)</Label>
                    <Input
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewGoal({ ...newGoal, color })}
                          className={`w-8 h-8 rounded-full transition-all ${
                            newGoal.color === color ? 'ring-2 ring-offset-2 ring-offset-background ring-primary' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={addGoal.isPending}>
                    {addGoal.isPending ? 'Creating...' : 'Create Goal'}
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
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Goals</p>
                  <p className="text-xl font-bold">{activeGoals.length}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/20">
                  <Calendar className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Target</p>
                  <p className="text-xl font-bold">₹{totalTarget.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/20">
                  <Trophy className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed Goals</p>
                  <p className="text-xl font-bold">{completedGoals.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-display font-semibold mb-4">Active Goals</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeGoals.map((goal) => {
                  const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
                  const isEditing = editingGoal === goal.id;

                  return (
                    <div key={goal.id} className="glass-card p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: goal.color }}
                          />
                          <div>
                            <h3 className="font-semibold">{goal.title}</h3>
                            {goal.deadline && (
                              <p className="text-xs text-muted-foreground">
                                Due: {format(new Date(goal.deadline), 'MMM d, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(goal.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(progress, 100)}%`,
                              backgroundColor: goal.color,
                            }}
                          />
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            ₹{Number(goal.current_amount).toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            ₹{Number(goal.target_amount).toLocaleString()}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Amount"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              size="icon"
                              variant="default"
                              onClick={() => handleUpdateAmount(goal.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditingGoal(null);
                                setEditAmount('');
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setEditingGoal(goal.id);
                              setEditAmount(goal.current_amount.toString());
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Update Progress
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-xl font-display font-semibold mb-4">Completed Goals 🎉</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedGoals.map((goal) => (
                  <div key={goal.id} className="glass-card p-6 opacity-80">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/20">
                          <Trophy className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{goal.title}</h3>
                          <p className="text-xs text-success">Completed</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(goal.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-lg font-bold text-success">
                      ₹{Number(goal.target_amount).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {goals.length === 0 && (
            <div className="glass-card py-12 text-center">
              <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No goals created yet</p>
              <p className="text-sm text-muted-foreground">Set your first financial goal to start tracking</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Goals;
