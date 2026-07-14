import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HeartHandshake, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Role } from "@/lib/apiTypes";

const HOME_BY_ROLE: Record<Role, string> = {
  family: "/family",
  nurse: "/nurse",
  admin: "/admin",
};

const DEMO_ACCOUNTS = [
  { label: "Family — Eleanor Reyes", email: "eleanor@example.com", password: "password123" },
  { label: "Family — Amina Alvi", email: "amina@example.com", password: "password123" },
  { label: "Nurse — Amara Chen", email: "amara@example.com", password: "password123" },
  { label: "Nurse — Daniel Okafor", email: "daniel@example.com", password: "password123" },
  { label: "Admin — Grace Admin", email: "admin@example.com", password: "admin123" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      const redirectTo = (location.state as { from?: string })?.from || HOME_BY_ROLE[user.role];
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-brand-50 to-brand-100/60 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6 text-brand-700 font-semibold">
          <HeartHandshake className="w-6 h-6" />
          CareLink
        </Link>

        <Card className="p-6 md:p-8">
          <h1 className="text-xl font-bold text-brand-900 mb-1">Welcome back</h1>
          <p className="text-sm text-brand-600/80 mb-6">Log in to your CareLink account.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-brand-800 mb-1 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-brand-200"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-brand-800 mb-1 block">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-brand-200"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-accent-600 font-medium">{error}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              <LogIn className="w-4 h-4" />
              {submitting ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <p className="text-sm text-center text-brand-600/80 mt-5">
            New to CareLink?{" "}
            <Link to="/signup" className="font-semibold text-brand-700 hover:underline">
              Create an account
            </Link>
          </p>
        </Card>

        <Card className="p-5 mt-4 bg-brand-50/60">
          <p className="text-xs font-semibold text-brand-700 mb-2 uppercase tracking-wide">Demo accounts</p>
          <div className="space-y-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.password);
                }}
                className="w-full text-left text-xs text-brand-700/90 hover:bg-brand-100 rounded-lg px-2.5 py-1.5 transition-colors flex items-center justify-between"
              >
                <span>{acc.label}</span>
                <span className="text-brand-500">{acc.email}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
