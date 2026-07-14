import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartHandshake, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/apiTypes";

const HOME_BY_ROLE: Record<Role, string> = {
  family: "/family",
  nurse: "/nurse",
  admin: "/admin",
};

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("family");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await signup(name, email, password, role);
      navigate(HOME_BY_ROLE[user.role], { replace: true });
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
          <h1 className="text-xl font-bold text-brand-900 mb-1">Create your account</h1>
          <p className="text-sm text-brand-600/80 mb-6">Join CareLink as a family or a caregiver.</p>

          <div className="grid grid-cols-2 gap-2 mb-5">
            {(["family", "nurse"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm font-semibold transition-colors",
                  role === r
                    ? "border-brand-500 bg-brand-100 text-brand-800"
                    : "border-brand-200 text-brand-500 hover:bg-brand-50",
                )}
              >
                {r === "family" ? "I need care" : "I'm a caregiver"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-brand-800 mb-1 block">Full name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-brand-200"
                placeholder="Jane Doe"
              />
            </div>
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-brand-200"
                placeholder="At least 6 characters"
              />
            </div>

            {error && <p className="text-sm text-accent-600 font-medium">{error}</p>}

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              <UserPlus className="w-4 h-4" />
              {submitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-sm text-center text-brand-600/80 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-700 hover:underline">
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
