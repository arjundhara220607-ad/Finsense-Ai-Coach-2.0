import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialSummary, useTransactions, useBudgets, useGoals } from "@/hooks/useFinancialData";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Wallet, 
  PiggyBank, 
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  FileDown,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subDays } from "date-fns";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { totalIncome, totalExpenses, totalSavings, healthScore } = useFinancialSummary();
  const { data: transactions = [] } = useTransactions();
  const { data: budgets = [] } = useBudgets();
  const { data: goals = [] } = useGoals();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Generate chart data for last 7 days
  const chartData = [...Array(7)].map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayTransactions = transactions.filter(
      (t) => format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    return {
      date: format(date, 'EEE'),
      income: dayTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0),
      expenses: dayTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0),
    };
  });

  // Category spending for pie chart
  const categorySpending = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  const pieData = Object.entries(categorySpending)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const COLORS = ['hsl(174, 72%, 46%)', 'hsl(199, 89%, 48%)', 'hsl(152, 69%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(262, 83%, 58%)'];

  const getHealthLabel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-success' };
    if (score >= 60) return { label: 'Good', color: 'text-primary' };
    if (score >= 40) return { label: 'Fair', color: 'text-warning' };
    return { label: 'Needs Work', color: 'text-destructive' };
  };

  const healthStatus = getHealthLabel(healthScore);

  const handleExportPDF = () => {
    // Create printable content
    const printContent = `
      <html>
        <head>
          <title>FinSense Financial Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #14b8a6; border-bottom: 2px solid #14b8a6; padding-bottom: 10px; }
            h2 { color: #666; margin-top: 30px; }
            .stat { display: inline-block; margin: 20px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; min-width: 150px; }
            .stat-label { font-size: 12px; color: #666; }
            .stat-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
            .income { color: #10b981; }
            .expense { color: #ef4444; }
            .savings { color: #14b8a6; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #f5f5f5; }
            .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>FinSense Financial Report</h1>
          <p>Generated on ${format(new Date(), 'PPP')}</p>
          
          <div>
            <div class="stat">
              <div class="stat-label">Total Income</div>
              <div class="stat-value income">₹${totalIncome.toLocaleString()}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Total Expenses</div>
              <div class="stat-value expense">₹${totalExpenses.toLocaleString()}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Net Savings</div>
              <div class="stat-value savings">₹${totalSavings.toLocaleString()}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Health Score</div>
              <div class="stat-value">${healthScore}/100</div>
            </div>
          </div>

          <h2>Recent Transactions</h2>
          <table>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
            ${transactions.slice(0, 20).map(t => `
              <tr>
                <td>${format(new Date(t.date), 'PP')}</td>
                <td>${t.category}</td>
                <td>${t.description || '-'}</td>
                <td>${t.type}</td>
                <td class="${t.type}">${t.type === 'income' ? '+' : '-'}₹${Number(t.amount).toLocaleString()}</td>
              </tr>
            `).join('')}
          </table>

          <h2>Budget Overview</h2>
          <table>
            <tr>
              <th>Category</th>
              <th>Limit</th>
              <th>Period</th>
            </tr>
            ${budgets.map(b => `
              <tr>
                <td>${b.category}</td>
                <td>₹${Number(b.limit_amount).toLocaleString()}</td>
                <td>${b.period}</td>
              </tr>
            `).join('')}
          </table>

          <h2>Financial Goals</h2>
          <table>
            <tr>
              <th>Goal</th>
              <th>Target</th>
              <th>Current</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
            ${goals.map(g => `
              <tr>
                <td>${g.title}</td>
                <td>₹${Number(g.target_amount).toLocaleString()}</td>
                <td>₹${Number(g.current_amount).toLocaleString()}</td>
                <td>${Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100)}%</td>
                <td>${g.status}</td>
              </tr>
            `).join('')}
          </table>

          <div class="footer">
            <p>Generated by FinSense - AI-Powered Financial Coaching</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const activeGoals = goals.filter((g) => g.status === 'active');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Your financial overview at a glance</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleExportPDF}>
                <FileDown className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Link to="/ai-coach">
                <Button variant="glow">
                  <Bot className="h-4 w-4 mr-2" />
                  AI Coach
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-success/20">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-success" />
              </div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-success">₹{totalIncome.toLocaleString()}</p>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-destructive/20">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
                <ArrowDownRight className="h-4 w-4 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-destructive">₹{totalExpenses.toLocaleString()}</p>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-primary/20">
                  <PiggyBank className="h-5 w-5 text-primary" />
                </div>
                {totalSavings >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-destructive" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">Net Savings</p>
              <p className={`text-2xl font-bold ${totalSavings >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {totalSavings >= 0 ? '+' : ''}₹{totalSavings.toLocaleString()}
              </p>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-info/20">
                  <Target className="h-5 w-5 text-info" />
                </div>
                <span className={`text-xs font-medium ${healthStatus.color}`}>
                  {healthStatus.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Health Score</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold">{healthScore}</p>
                <span className="text-muted-foreground text-sm mb-1">/100</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Income vs Expenses Chart */}
            <div className="lg:col-span-2 glass-card p-6">
              <h2 className="text-lg font-display font-semibold mb-4">Income vs Expenses (Last 7 Days)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(152, 69%, 45%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(152, 69%, 45%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                    <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" />
                    <YAxis stroke="hsl(215, 20%, 55%)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(220, 18%, 10%)',
                        border: '1px solid hsl(220, 14%, 18%)',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="hsl(152, 69%, 45%)"
                      fill="url(#incomeGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="hsl(0, 72%, 51%)"
                      fill="url(#expenseGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Spending Pie Chart */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-display font-semibold mb-4">Spending by Category</h2>
              {pieData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(220, 18%, 10%)',
                          border: '1px solid hsl(220, 14%, 18%)',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => `₹${value.toLocaleString()}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <p>No expense data yet</p>
                </div>
              )}
              <div className="space-y-2 mt-4">
                {pieData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span>₹{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Goals & Recent Transactions */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Active Goals */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-semibold">Active Goals</h2>
                <Link to="/goals">
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Goal
                  </Button>
                </Link>
              </div>
              {activeGoals.length > 0 ? (
                <div className="space-y-4">
                  {activeGoals.slice(0, 3).map((goal) => {
                    const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
                    return (
                      <div key={goal.id} className="p-4 rounded-lg bg-secondary/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{goal.title}</span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(progress, 100)}%`,
                              backgroundColor: goal.color,
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                          <span>₹{Number(goal.current_amount).toLocaleString()}</span>
                          <span>₹{Number(goal.target_amount).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No active goals yet</p>
                  <Link to="/goals">
                    <Button variant="outline" size="sm" className="mt-3">
                      Create Your First Goal
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-semibold">Recent Transactions</h2>
                <Link to="/transactions">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            transaction.type === 'income'
                              ? 'bg-success/20 text-success'
                              : 'bg-destructive/20 text-destructive'
                          }`}
                        >
                          {transaction.type === 'income' ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transaction.category}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.description || format(new Date(transaction.date), 'PP')}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-semibold ${
                          transaction.type === 'income' ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No transactions yet</p>
                  <Link to="/transactions">
                    <Button variant="outline" size="sm" className="mt-3">
                      Add Transaction
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
