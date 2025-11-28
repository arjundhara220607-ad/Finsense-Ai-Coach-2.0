import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/20">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <span className="font-display font-bold text-xl">
                Fin<span className="text-primary">Sense</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered financial coaching for gig workers and freelancers.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
              <li><Link to="/ai-coach" className="hover:text-foreground">AI Coach</Link></li>
              <li><Link to="/budgets" className="hover:text-foreground">Budgeting</Link></li>
              <li><Link to="/goals" className="hover:text-foreground">Goals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Smart Analytics</li>
              <li>Health Score</li>
              <li>PDF Reports</li>
              <li>Multi-device Sync</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Help Center</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Contact Us</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} FinSense. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
