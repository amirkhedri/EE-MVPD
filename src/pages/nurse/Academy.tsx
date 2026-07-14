import { ShieldCheck, Brain, Star, Zap, Lock, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import { courses, nurseBadges } from "@/lib/mockData";

const badgeIcons: Record<string, typeof ShieldCheck> = {
  "shield-check": ShieldCheck,
  brain: Brain,
  star: Star,
  zap: Zap,
};

const NURSE_NAME = "Amara Chen";
const RATING = 4.9;

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && hasHalf);
        return (
          <Star
            key={i}
            className={cn(
              "w-4 h-4",
              filled ? "fill-amber-400 text-amber-400" : "text-brand-200",
            )}
          />
        );
      })}
      <span className="text-sm font-semibold text-brand-900 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function Academy() {
  const unlockedCourses = courses.filter((course) => !course.locked);
  const averageProgress =
    unlockedCourses.length > 0
      ? Math.round(
          unlockedCourses.reduce((sum, course) => sum + course.progress, 0) /
            unlockedCourses.length,
        )
      : 0;

  return (
    <div>
      <PageHeader
        title="Care Academy"
        description="Grow your skills, earn badges, and unlock new opportunities."
      />

      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <Avatar name={NURSE_NAME} size="xl" />
          <div>
            <p className="text-lg font-bold text-brand-900">{NURSE_NAME}</p>
            <StarRating rating={RATING} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {nurseBadges.map((badge) => {
            const Icon = badgeIcons[badge.icon] ?? Star;
            return (
              <div
                key={badge.id}
                className={cn(
                  "relative rounded-xl border p-3 flex flex-col items-center gap-2 text-center",
                  badge.earned
                    ? "border-sky-brand-100 bg-sky-brand-50"
                    : "border-brand-100 bg-brand-50/60 opacity-50 grayscale",
                )}
              >
                {!badge.earned && (
                  <Lock className="w-3.5 h-3.5 text-brand-500 absolute top-2 right-2" />
                )}
                <div
                  className={cn(
                    "rounded-full p-2.5",
                    badge.earned ? "bg-sky-brand-100 text-sky-brand-600" : "bg-brand-100 text-brand-500",
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-brand-900">{badge.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-6">
        <h2 className="text-base font-semibold text-brand-900 mb-3">Learning</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.map((course) => (
            <Card
              key={course.id}
              className={cn(
                "overflow-hidden",
                course.locked ? "opacity-60 cursor-not-allowed" : "hover:shadow-md transition-shadow",
              )}
            >
              <div className="relative h-32">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                {course.locked && (
                  <div className="absolute inset-0 bg-brand-900/40 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-2.5">
                      <Lock className="w-5 h-5 text-brand-700" />
                    </div>
                  </div>
                )}
              </div>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="sky">{course.category}</Badge>
                  <span className="flex items-center gap-1 text-xs text-brand-500/80">
                    <Clock className="w-3.5 h-3.5" />
                    {course.durationMinutes} min
                  </span>
                </div>
                <p className="text-sm font-semibold text-brand-900 mt-2">{course.title}</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-brand-500/80 mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <ProgressBar value={course.progress} tone="sky" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your Growth</CardTitle>
          <CardDescription>
            {averageProgress}% of the way to your next tier — Senior Caregiver
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressBar value={averageProgress} tone="accent" />
        </CardContent>
      </Card>
    </div>
  );
}
