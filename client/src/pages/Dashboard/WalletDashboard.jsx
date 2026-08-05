import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Wallet,
  Eye,
  EyeOff,
  RefreshCw,
  Send,
  ArrowDownToLine,
  History,
  Copy,
  X,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Adjust these to match the exact localStorage keys used elsewhere in your app.
const APP_TOKEN_KEY = "token";
const WALLET_TOKEN_KEY = "walletToken";

const MIDNIGHT = "#0B1E3D";
const MIDNIGHT_SOFT = "#13294F";

const currency = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const statusStyles = {
  success: { label: "Successful", icon: CheckCircle2, className: "text-emerald-600 bg-emerald-50" },
  pending: { label: "Pending", icon: Clock, className: "text-amber-600 bg-amber-50" },
  failed: { label: "Failed", icon: XCircle, className: "text-rose-600 bg-rose-50" },
};

export default function WalletDashboard() {
  const [user, setUser] = useState(null);
  const [walletToken, setWalletToken] = useState(() => localStorage.getItem(WALLET_TOKEN_KEY) || "");
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshingBalance, setRefreshingBalance] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [error, setError] = useState("");

  const appToken = useMemo(() => localStorage.getItem(APP_TOKEN_KEY), []);

  const authedFetch = useCallback(
    async (path, options = {}, { withWalletToken = false, retry = true } = {}) => {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${appToken}`,
        ...(options.headers || {}),
      };

      if (withWalletToken) {
        const currentWalletToken = localStorage.getItem(WALLET_TOKEN_KEY);
        if (currentWalletToken) headers["x-wallet-token"] = currentWalletToken;
      }

      const res = await fetch(`${BACKEND_URL}${path}`, { ...options, headers });
      const data = await res.json().catch(() => ({}));

      // Wallet session missing/expired — reconnect once, then retry the original call
      if (withWalletToken && retry && (res.status === 401 || data?.code === "WALLET_TOKEN_MISSING")) {
        const reconnected = await connectWallet();
        if (reconnected) {
          return authedFetch(path, options, { withWalletToken, retry: false });
        }
      }

      if (!res.ok) {
        throw new Error(data?.message || "Something went wrong");
      }
      return data;
    },
    [appToken]
  );

  const connectWallet = useCallback(async () => {
    try {
      const data = await authedFetch("/api/wallet/login", { method: "POST" }, { withWalletToken: false });
         console.log(data)
      localStorage.setItem(WALLET_TOKEN_KEY, data.walletToken);
     
      setWalletToken(data.walletToken);
    
      return true;
    } catch (err) {
      console.error("Wallet connection failed:", err);
      setError("We couldn't connect to your wallet. Please try again.");
      return false;
    }
  }, [authedFetch]);

  const loadAccountDetails = useCallback(async () => {
    const data = await authedFetch("/api/wallet/account-details", { method: "GET" });
    setAccount(data.account);
    console.log(data)
    if (data.account?.balance != null) setBalance(data.account.balance);
  }, [authedFetch]);

  const loadBalance = useCallback(
    async (showSpinner = false) => {
      if (showSpinner) setRefreshingBalance(true);
      try {
        const data = await authedFetch("/api/wallet/balance", { method: "GET" }, { withWalletToken: true });
        setBalance(data.balance);
      } catch (err) {
        console.error("Balance refresh failed:", err);
        toast.error(err.message || "Couldn't refresh balance");
      } finally {
        if (showSpinner) setRefreshingBalance(false);
      }
    },
    [authedFetch]
  );

  const loadHistory = useCallback(async () => {
    const data = await authedFetch(
      "/api/wallet/transfer-history?per_page=15&page=1",
      { method: "GET" },
      { withWalletToken: true }
    );
    const list = data?.history?.data || data?.history?.transfers || [];
    setTransactions(Array.isArray(list) ? list : []);
  }, [authedFetch]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const dashboardData = await authedFetch("/api/users/dashboard", { method: "GET" });
        setUser(dashboardData.user || dashboardData);

        if (!localStorage.getItem(WALLET_TOKEN_KEY)) {
          await connectWallet();
        } else {
          setWalletToken(localStorage.getItem(WALLET_TOKEN_KEY));
        }

        await loadAccountDetails();
        await Promise.all([loadBalance(), loadHistory()]);
      } catch (err) {
        console.error("Wallet dashboard init failed:", err);
        setError(err.message || "Unable to load your wallet right now.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyToClipboard = (value, label) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading your wallet…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Wallet</p>
            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
              {user?.firstName ? `${user.firstName}'s Wallet` : "My Wallet"}
            </h1>
          </div>
          <div className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm sm:flex">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Secured
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Balance Card */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 shadow-lg sm:p-8"
          style={{ background: `linear-gradient(135deg, ${MIDNIGHT} 0%, ${MIDNIGHT_SOFT} 100%)` }}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/5" />

          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-2 text-white/70">
              <Wallet className="h-4 w-4" />
              <span className="text-sm">Available Balance</span>
            </div>
            <button
              onClick={() => setBalanceVisible((v) => !v)}
              className="rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Toggle balance visibility"
            >
              {balanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative mt-3 flex items-end gap-3">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              {balanceVisible ? currency(balance) : "₦ • • • • • •"}
            </h2>
            <button
              onClick={() => loadBalance(true)}
              disabled={refreshingBalance}
              className="mb-1 rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              aria-label="Refresh balance"
            >
              <RefreshCw className={`h-4 w-4 ${refreshingBalance ? "animate-spin" : ""}`} />
            </button>
          </div>

          {account?.accountNumber && (
            <div className="relative mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-white/50" />
                <span>{account.bankName}</span>
              </div>
              <button
                onClick={() => copyToClipboard(account.accountNumber, "Account number")}
                className="flex items-center gap-1.5 font-medium text-white transition hover:text-white/80"
              >
                {account.accountNumber}
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <QuickAction icon={Send} label="Send Money" onClick={() => setTransferOpen(true)} />
          <QuickAction icon={ArrowDownToLine} label="Fund Wallet" onClick={() => setDepositOpen(true)} />
          <QuickAction
            icon={History}
            label="History"
            onClick={() => document.getElementById("wallet-history")?.scrollIntoView({ behavior: "smooth" })}
            className="col-span-2 sm:col-span-1"
          />
        </div>

        {/* Account Details */}
        {account && (
          <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Account Details</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <DetailField label="Account Name" value={account.accountName} />
              <DetailField
                label="Account Number"
                value={account.accountNumber}
                onCopy={() => copyToClipboard(account.accountNumber, "Account number")}
              />
              <DetailField label="Bank" value={account.bankName} />
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div id="wallet-history" className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Recent Transactions</h3>
            <button
              onClick={loadHistory}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <History className="mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">No transactions yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {transactions.map((tx, i) => (
                <TransactionRow key={tx.reference || i} tx={tx} />
              ))}
            </ul>
          )}
        </div>
      </div>

      <AnimatePresence>
        {transferOpen && (
          <TransferModal
            onClose={() => setTransferOpen(false)}
            onSuccess={() => {
              setTransferOpen(false);
              loadBalance();
              loadHistory();
            }}
            authedFetch={authedFetch}
          />
        )}
        {depositOpen && <DepositModal account={account} onClose={() => setDepositOpen(false)} onCopy={copyToClipboard} />}
      </AnimatePresence>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 text-sm font-medium text-slate-700 shadow-sm transition hover:shadow-md active:scale-[0.98] ${className}`}
    >
      <Icon className="h-4 w-4" style={{ color: MIDNIGHT }} />
      {label}
    </button>
  );
}

function DetailField({ label, value, onCopy }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <p className="truncate text-sm font-medium text-slate-800">{value || "—"}</p>
        {onCopy && value && (
          <button onClick={onCopy} className="text-slate-400 hover:text-slate-600">
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function TransactionRow({ tx }) {
  const status = statusStyles[tx.status] || statusStyles.success;
  const StatusIcon = status.icon;
  const isDebit = (tx.type || "transfer") === "transfer";

  return (
    <li className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${status.className}`}>
          <StatusIcon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">{tx.reason || (isDebit ? "Transfer" : "Deposit")}</p>
          <p className="text-xs text-slate-400">{tx.createdAt ? new Date(tx.createdAt).toLocaleString() : tx.reference}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${isDebit ? "text-rose-600" : "text-emerald-600"}`}>
          {isDebit ? "-" : "+"}
          {currency(tx.amount)}
        </p>
        <p className="text-xs text-slate-400">{status.label}</p>
      </div>
    </li>
  );
}

function TransferModal({ onClose, onSuccess, authedFetch }) {
  const [form, setForm] = useState({ amount: "", recipient: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.recipient) {
      toast.error("Amount and recipient code are required");
      return;
    }
    setSubmitting(true);
    try {
      await authedFetch(
        "/api/wallet/transfer",
        { method: "POST", body: JSON.stringify({ amount: Number(form.amount), recipient: form.recipient, reason: form.reason }) },
        { withWalletToken: true }
      );
      toast.success("Transfer successful");
      onSuccess();
    } catch (err) {
      toast.error(err.message || "Transfer failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell onClose={onClose} title="Send Money">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Amount (₦)">
          <input
            type="number"
            min="1"
            value={form.amount}
            onChange={update("amount")}
            placeholder="0.00"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
          />
        </Field>
        <Field label="Recipient Code">
          <input
            type="text"
            value={form.recipient}
            onChange={update("recipient")}
            placeholder="RCP_xxxxxxxxxxxx"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
          />
        </Field>
        <Field label="Reason (optional)">
          <input
            type="text"
            value={form.reason}
            onChange={update("reason")}
            placeholder="e.g. Rent payment"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
          />
        </Field>
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white transition disabled:opacity-60"
          style={{ backgroundColor: MIDNIGHT }}
        >
          {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {submitting ? "Sending…" : "Send Money"}
        </button>
      </form>
    </ModalShell>
  );
}

function DepositModal({ account, onClose, onCopy }) {
  return (
    <ModalShell onClose={onClose} title="Fund Wallet">
      <p className="mb-4 text-sm text-slate-500">
        Transfer any amount to the account below from any bank app. Your wallet balance updates automatically once the funds arrive.
      </p>
      <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
        <DetailRow label="Bank" value={account?.bankName} />
        <DetailRow
          label="Account Number"
          value={account?.accountNumber}
          onCopy={() => onCopy(account?.accountNumber, "Account number")}
        />
        <DetailRow label="Account Name" value={account?.accountName} />
      </div>
    </ModalShell>
  );
}

function DetailRow({ label, value, onCopy }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-slate-800">{value || "—"}</span>
        {onCopy && (
          <button onClick={onCopy} className="text-slate-400 hover:text-slate-600">
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}