import { Link } from "react-router-dom";
import { HeartHandshake, Stethoscope, ShieldCheck, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const apps = [
  {
    title: "Family / Requester",
    description: "Find, monitor, and pay a trusted nurse for your loved one.",
    icon: HeartHandshake,
    accent: "from-brand-500 to-brand-700",
    signupHint: "family",
  },
  {
    title: "Nurse / Caregiver",
    description: "Accept care requests, log care, get paid securely, and grow your career.",
    icon: Stethoscope,
    accent: "from-sky-brand-500 to-sky-brand-600",
    signupHint: "nurse",
  },
  {
    title: "Admin / AI Core",
    description: "Oversee matching, verification, and dispute resolution.",
    icon: ShieldCheck,
    accent: "from-slate-700 to-slate-900",
    signupHint: null,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-linear-to-b from-brand-50 to-brand-100/60 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10 max-w-xl">
        <div className="inline-flex items-center gap-2 bg-white text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          Trust • Monitoring • Financial Security
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-brand-900 mb-3">CareLink Platform</h1>
        <p className="text-brand-700/80">
          A multi-sided healthcare platform connecting families with verified nurses and caregivers —
          matching, contracts, and escrow payments, all in one place.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3 w-full max-w-5xl mb-8">
        {apps.map((app) => (
          <Card key={app.title} className="p-6 h-full flex flex-col">
            <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${app.accent} text-white flex items-center justify-center mb-4`}>
              <app.icon className="w-6 h-6" />
            </div>
            <h2 className="font-semibold text-brand-900 text-lg mb-1.5">{app.title}</h2>
            <p className="text-sm text-brand-600/80 mb-4 flex-1">{app.description}</p>
            <div className="flex items-center gap-2">
              <Link to="/login" className="flex-1">
                <Button variant="outline" className="w-full">
                  Log In
                </Button>
              </Link>
              {app.signupHint && (
                <Link to="/signup" className="flex-1">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Link to="/login" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:gap-2 transition-all">
        Try a demo account <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
