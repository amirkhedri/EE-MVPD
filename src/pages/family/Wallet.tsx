import { useEffect, useState } from "react";
import {
  Wallet as WalletIcon,
  Lock,
  CheckCircle2,
  CreditCard,
  Info,
  Send,
  HandCoins,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/Spinner";
import { walletApi, requestsApi, ApiError } from "@/lib/api";
import type { CareRequest, Transaction, TransactionType, WalletSummary } from "@/lib/apiTypes";

const transactionTone: Record<TransactionType, "success" | "sky" | "warning" | "neutral"> = {
  deposit: "success",
  payout: "success",
  escrow_fund: "sky",
  escrow_release: "warning",
  withdrawal: "neutral",
};

const transactionLabel: Record<TransactionType, string> = {
  deposit: "Deposit",
  payout: "Payout",
  escrow_fund: "Escrow Funded",
  escrow_release: "Escrow Released",
  withdrawal: "Withdrawal",
};

function formatMoney(amount: number) {
  return `$${amount.toFixed(2)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function Wallet() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [requests, setRequests] = useState<CareRequest[]>([]);

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositSubmitting, setDepositSubmitting] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [depositSuccess, setDepositSuccess] = useState(false);

  const [fundRequestId, setFundRequestId] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [fundSubmitting, setFundSubmitting] = useState(false);
  const [fundError, setFundError] = useState<string | null>(null);
  const [fundSuccess, setFundSuccess] = useState(false);

  const [releaseRequestId, setReleaseRequestId] = useState("");
  const [releaseAmount, setReleaseAmount] = useState("");
  const [releaseSubmitting, setReleaseSubmitting] = useState(false);
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [releaseSuccess, setReleaseSuccess] = useState(false);

  const activeRequests = requests.filter((r) => r.status === "active");

  async function loadAll() {
    setLoading(true);
    setLoadError(null);
    try {
      const [walletRes, requestsRes] = await Promise.all([walletApi.get(), requestsApi.mine()]);
      setWallet(walletRes);
      setRequests(requestsRes.requests);
      const active = requestsRes.requests.filter((r) => r.status === "active");
      if (active.length > 0) {
        setFundRequestId((prev) => prev || active[0].id);
        setReleaseRequestId((prev) => prev || active[0].id);
      }
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Could not load wallet");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    setDepositError(null);
    setDepositSuccess(false);
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) {
      setDepositError("Enter a valid amount");
      return;
    }
    setDepositSubmitting(true);
    try {
      const wallet = await walletApi.deposit({
        amount,
        card: { number: cardNumber, expiry: cardExpiry, cvc: cardCvc, name: cardName },
      });
      setWallet(wallet);
      setDepositSuccess(true);
      setCardName("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvc("");
      setDepositAmount("");
    } catch (err) {
      setDepositError(err instanceof ApiError ? err.message : "Could not process deposit");
    } finally {
      setDepositSubmitting(false);
    }
  }

  async function handleFundEscrow(e: React.FormEvent) {
    e.preventDefault();
    setFundError(null);
    setFundSuccess(false);
    const amount = Number(fundAmount);
    if (!amount || amount <= 0) {
      setFundError("Enter a valid amount");
      return;
    }
    if (!fundRequestId) {
      setFundError("Select a caregiver");
      return;
    }
    setFundSubmitting(true);
    try {
      const wallet = await walletApi.fundEscrow({ requestId: fundRequestId, amount });
      setWallet(wallet);
      setFundSuccess(true);
      setFundAmount("");
      const { requests } = await requestsApi.mine();
      setRequests(requests);
    } catch (err) {
      setFundError(err instanceof ApiError ? err.message : "Could not fund escrow");
    } finally {
      setFundSubmitting(false);
    }
  }

  async function handleRelease(e: React.FormEvent) {
    e.preventDefault();
    setReleaseError(null);
    setReleaseSuccess(false);
    const amount = Number(releaseAmount);
    if (!amount || amount <= 0) {
      setReleaseError("Enter a valid amount");
      return;
    }
    if (!releaseRequestId) {
      setReleaseError("Select a caregiver");
      return;
    }
    setReleaseSubmitting(true);
    try {
      const wallet = await walletApi.release({ requestId: releaseRequestId, amount });
      setWallet(wallet);
      setReleaseSuccess(true);
      setReleaseAmount("");
      const { requests } = await requestsApi.mine();
      setRequests(requests);
    } catch (err) {
      setReleaseError(err instanceof ApiError ? err.message : "Could not release payment");
    } finally {
      setReleaseSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader title="Escrow Wallet" description="Manage your care funds in one place." />
        <LoadingState label="Loading your wallet..." />
      </div>
    );
  }

  if (loadError && !wallet) {
    return (
      <div className="max-w-3xl mx-auto">
        <PageHeader title="Escrow Wallet" description="Manage your care funds in one place." />
        <div className="rounded-xl bg-accent-500/10 border border-accent-500/20 p-4 text-sm text-accent-600 font-medium">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Escrow Wallet"
        description="Manage your care funds and payments in one place."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Balance"
          value={formatMoney(wallet?.balance ?? 0)}
          icon={<WalletIcon className="w-5 h-5" />}
          tone="brand"
        />
        <StatCard
          label="Funds in Escrow (Locked)"
          value={formatMoney(wallet?.escrowLocked ?? 0)}
          icon={<Lock className="w-5 h-5" />}
          tone="accent"
        />
        <StatCard
          label="Paid"
          value={formatMoney(wallet?.paidTotal ?? 0)}
          icon={<CheckCircle2 className="w-5 h-5" />}
          tone="success"
        />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-600" />
            Add Funds
          </CardTitle>
          <CardDescription>Deposit money into your CareLink balance using a card.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-sky-brand-50 border border-sky-brand-100 p-3 text-xs text-sky-brand-600">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              This is a simulated payment form — try a real-looking card number, e.g. 4242 4242 4242
              4242, with any future expiry and 3-digit CVC.
            </span>
          </div>
          <form onSubmit={handleDeposit} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-brand-700 mb-1.5 block">Cardholder Name</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Jane Doe"
                required
                className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm text-brand-900 focus:outline-none focus:ring-4 focus:ring-brand-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-brand-700 mb-1.5 block">Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
                required
                className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm text-brand-900 focus:outline-none focus:ring-4 focus:ring-brand-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-brand-700 mb-1.5 block">Expiry (MM/YY)</label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="12/29"
                  required
                  className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm text-brand-900 focus:outline-none focus:ring-4 focus:ring-brand-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-brand-700 mb-1.5 block">CVC</label>
                <input
                  type="text"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  placeholder="123"
                  required
                  className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm text-brand-900 focus:outline-none focus:ring-4 focus:ring-brand-200"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-brand-700 mb-1.5 block">Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="100.00"
                required
                className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm text-brand-900 focus:outline-none focus:ring-4 focus:ring-brand-200"
              />
            </div>
            {depositError && <p className="text-sm text-accent-600 font-medium">{depositError}</p>}
            {depositSuccess && (
              <p className="text-sm text-emerald-600 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Funds added successfully
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={depositSubmitting}>
              {depositSubmitting ? "Processing..." : "Add Funds"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {activeRequests.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-600" />
              Fund Escrow
            </CardTitle>
            <CardDescription>Move funds from your balance into escrow for a caregiver.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFundEscrow} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-700 mb-1.5 block">Caregiver</label>
                <select
                  value={fundRequestId}
                  onChange={(e) => setFundRequestId(e.target.value)}
                  className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm text-brand-900 focus:outline-none focus:ring-4 focus:ring-brand-200"
                >
                  {activeRequests.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nurse?.name ?? "Caregiver"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-700 mb-1.5 block">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="200.00"
                  required
                  className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm text-brand-900 focus:outline-none focus:ring-4 focus:ring-brand-200"
                />
              </div>
              {fundError && <p className="text-sm text-accent-600 font-medium">{fundError}</p>}
              {fundSuccess && (
                <p className="text-sm text-emerald-600 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Escrow funded successfully
                </p>
              )}
              <Button type="submit" size="lg" variant="secondary" className="w-full" disabled={fundSubmitting}>
                <Send className="w-4 h-4" />
                {fundSubmitting ? "Processing..." : "Fund Escrow"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeRequests.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandCoins className="w-4 h-4 text-brand-600" />
              Release Payment
            </CardTitle>
            <CardDescription>
              Release payment to your caregiver for completed care milestones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRelease} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-brand-700 mb-1.5 block">Caregiver</label>
                <select
                  value={releaseRequestId}
                  onChange={(e) => setReleaseRequestId(e.target.value)}
                  className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm text-brand-900 focus:outline-none focus:ring-4 focus:ring-brand-200"
                >
                  {activeRequests.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nurse?.name ?? "Caregiver"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-brand-700 mb-1.5 block">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={releaseAmount}
                  onChange={(e) => setReleaseAmount(e.target.value)}
                  placeholder="150.00"
                  required
                  className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm text-brand-900 focus:outline-none focus:ring-4 focus:ring-brand-200"
                />
              </div>
              {releaseError && <p className="text-sm text-accent-600 font-medium">{releaseError}</p>}
              {releaseSuccess && (
                <p className="text-sm text-emerald-600 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Payment released successfully
                </p>
              )}
              <Button type="submit" size="lg" variant="accent" className="w-full" disabled={releaseSubmitting}>
                {releaseSubmitting ? "Processing..." : "Release Payment"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>All deposits, escrow activity, and payouts.</CardDescription>
        </CardHeader>
        <CardContent>
          {!wallet || wallet.transactions.length === 0 ? (
            <p className="text-sm text-brand-600/80 py-6 text-center">No transactions yet.</p>
          ) : (
            <div className="divide-y divide-brand-100">
              {wallet.transactions.map((tx: Transaction) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-brand-900">{tx.label}</p>
                    <p className="text-xs text-brand-500/80 mt-0.5">{formatDate(tx.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-brand-900">{formatMoney(tx.amount)}</span>
                    <Badge tone={transactionTone[tx.type]}>{transactionLabel[tx.type]}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
