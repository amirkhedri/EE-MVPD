import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Lock, Wallet, TrendingUp, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/Spinner";
import { walletApi } from "@/lib/api";
import type { TransactionType, WalletSummary } from "@/lib/apiTypes";

const transactionTone: Record<TransactionType, "success" | "sky" | "warning" | "neutral"> = {
  payout: "success",
  deposit: "success",
  escrow_fund: "sky",
  escrow_release: "warning",
  withdrawal: "neutral",
};

function formatMoney(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export default function Finance() {
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  function load() {
    setLoading(true);
    walletApi
      .get()
      .then((data) => setSummary(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load wallet"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const numericAmount = Number(amount);
  const isValidAmount = amount.trim() !== "" && !Number.isNaN(numericAmount) && numericAmount > 0;
  const exceedsBalance = summary ? numericAmount > summary.balance : true;

  async function handleWithdraw(e: FormEvent) {
    e.preventDefault();
    if (!isValidAmount || exceedsBalance) return;
    setWithdrawing(true);
    setWithdrawError(null);
    setConfirmed(false);
    try {
      const updated = await walletApi.withdraw({ amount: numericAmount });
      setSummary(updated);
      setAmount("");
      setConfirmed(true);
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : "Could not process withdrawal");
    } finally {
      setWithdrawing(false);
    }
  }

  if (loading) return <LoadingState label="Loading your finances..." />;

  return (
    <div>
      <PageHeader
        title="Financial Dashboard"
        description="Track your escrow-protected earnings and payout history."
      />

      {error && (
        <div className="mb-4 rounded-xl bg-accent-500/10 text-accent-600 text-sm font-medium px-4 py-3">
          {error}
        </div>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Pending / Locked Funds"
              value={formatMoney(summary.escrowLocked)}
              icon={<Lock className="w-5 h-5" />}
              tone="accent"
              hint="Reserved for active engagements, not yet released"
            />
            <StatCard
              label="Available to Withdraw"
              value={formatMoney(summary.balance)}
              icon={<Wallet className="w-5 h-5" />}
              tone="success"
              hint="Ready to transfer to your account"
            />
            <StatCard
              label="Total Earned"
              value={formatMoney(summary.paidTotal)}
              icon={<TrendingUp className="w-5 h-5" />}
              tone="sky"
              hint="Lifetime payouts to date"
            />
          </div>

          <Card className="mt-6 p-5 sm:p-6">
            <form onSubmit={handleWithdraw} className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1">
                <label className="text-sm font-semibold text-brand-900 block mb-1">Withdraw Funds</label>
                <p className="text-sm text-brand-600/80 mb-2">
                  Withdrawals are processed securely and arrive within 1-2 business days.
                </p>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setConfirmed(false);
                    }}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-brand-200 pl-7 pr-4 py-2.5 text-base text-brand-900 focus:outline-none focus:ring-4 focus:ring-sky-brand-200 focus:border-sky-brand-300"
                  />
                </div>
                {isValidAmount && exceedsBalance && (
                  <p className="text-sm text-accent-600 font-medium mt-1">
                    Amount exceeds your available balance.
                  </p>
                )}
                {withdrawError && <p className="text-sm text-accent-600 font-medium mt-1">{withdrawError}</p>}
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!isValidAmount || exceedsBalance || withdrawing}
                className="shrink-0"
              >
                <Wallet className="w-5 h-5" />
                {withdrawing ? "Processing..." : "Withdraw Funds"}
              </Button>
            </form>
            {confirmed && (
              <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm mt-4">
                <CheckCircle2 className="w-5 h-5" />
                Withdrawal initiated — funds arrive in 1-2 business days
              </div>
            )}
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>All escrow releases and completed transfers.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {summary.transactions.length === 0 ? (
                <p className="text-sm text-brand-500/70 py-4 text-center">No transactions yet.</p>
              ) : (
                summary.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 hover:bg-brand-50/60"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-brand-900 truncate">{tx.label}</p>
                      <p className="text-xs text-brand-500/70 mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-brand-900">{formatMoney(tx.amount)}</span>
                      <Badge tone={transactionTone[tx.type]} className="capitalize">
                        {tx.type.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
