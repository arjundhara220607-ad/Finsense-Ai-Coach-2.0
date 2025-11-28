import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl">
              Fin<span className="text-primary">Sense</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link to="/ai-coach" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  AI Coach
                </Link>
                <Link to="/transactions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Transactions
                </Link>
                <Link to="/budgets" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Budgets
                </Link>
                <Link to="/goals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Goals
                </Link>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link to="/ai-coach" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  AI Coach
                </Link>
                <Link to="/auth">
                  <Button variant="default" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border">
            {user ? (
              <>
                <Link to="/dashboard" className="block py-2 text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
                <Link to="/ai-coach" className="block py-2 text-muted-foreground hover:text-foreground">
                  AI Coach
                </Link>
                <Link to="/transactions" className="block py-2 text-muted-foreground hover:text-foreground">
                  Transactions
                </Link>
                <Link to="/budgets" className="block py-2 text-muted-foreground hover:text-foreground">
                  Budgets
                </Link>
                <Link to="/goals" className="block py-2 text-muted-foreground hover:text-foreground">
                  Goals
                </Link>
                <Button variant="outline" className="w-full" onClick={signOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="block py-2 text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
                <Link to="/ai-coach" className="block py-2 text-muted-foreground hover:text-foreground">
                  AI Coach
                </Link>
                <Link to="/auth">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
