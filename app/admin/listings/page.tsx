"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Users,
  UserPlus,
  Home,
  Building2,
  HandHelping,
  Clock,
  Flag,
  MessageSquare,
  LayoutDashboard,
  ClipboardList,
  LogOut,
  Star,
  Check,
  X,
  ChevronRight,
} from "lucide-react";
import Button from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import EmptyState from "@/components/ui/empty-state";
import { getProfile, login, logout } from "@/features/auth/services/auth.service";
import {
  getListings,
  getReports,
  updateRoomStatus,
  updateBusinessStatus,
  updateGigStatus,
  getStats,
  getPendingReviews,
  updateReviewStatus,
  ListingStatus,
  AdminStats,
  PendingReview,
} from "@/features/admin/services/admin.service";

type Listing = {
  id: number;
  name?: string;
  title?: string;
  status: ListingStatus;
  reportCount: number;
};

type Report = {
  id: number;
  targetType: "room" | "business" | "gig";
  targetId: number;
  reason: string;
  status: string;
  createdAt: string;
  reporter: { email: string };
};

type Tab = "overview" | "listings" | "reviews" | "reports";
type AuthState = "checking" | "loggedOut" | "notAdmin" | "admin";

const TABS: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "listings", label: "Listings", icon: ClipboardList },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "reports", label: "Reports", icon: Flag },
];

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminDashboard />
    </Suspense>
  );
}

function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [authState, setAuthState] = useState<AuthState>("checking");
  const [adminName, setAdminName] = useState("");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<Tab>("overview");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statusFilter, setStatusFilter] = useState<ListingStatus>("pending_review");
  const [rooms, setRooms] = useState<Listing[]>([]);
  const [businesses, setBusinesses] = useState<Listing[]>([]);
  const [gigs, setGigs] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);

  // ?tab= from the moderation-notification emails lands directly on the
  // right section instead of always dropping onto Overview.
  useEffect(() => {
    const requested = searchParams.get("tab");
    if (
      requested === "overview" ||
      requested === "listings" ||
      requested === "reviews" ||
      requested === "reports"
    ) {
      setTab(requested);
    }
  }, [searchParams]);

  const checkAuth = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setAuthState("loggedOut");
      return;
    }

    try {
      const profile = await getProfile();

      if (profile.role === "admin") {
        setAdminName(profile.firstName || "Admin");
        setAuthState("admin");
      } else {
        setAuthState("notAdmin");
      }
    } catch {
      setAuthState("loggedOut");
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setStats(await getStats());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getListings(statusFilter);
      setRooms(data.rooms);
      setBusinesses(data.businesses);
      setGigs(data.gigs ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listings.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setReviews(await getPendingReviews());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setReports(await getReports());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authState !== "admin") return;
    if (tab === "overview") loadOverview();
    else if (tab === "listings") loadListings();
    else if (tab === "reviews") loadReviews();
    else if (tab === "reports") loadReports();
  }, [authState, tab, loadOverview, loadListings, loadReviews, loadReports]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");

    if (!identifier.trim() || !password.trim()) {
      setLoginError("Enter your email and password.");
      return;
    }

    setLoggingIn(true);
    try {
      await login({ identifier: identifier.trim(), password });
      setAuthState("checking");
      await checkAuth();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoggingIn(false);
    }
  }

  function handleLogout() {
    logout();
    setAuthState("loggedOut");
    setIdentifier("");
    setPassword("");
  }

  function switchTab(next: Tab) {
    setTab(next);
    router.replace(`/admin/listings?tab=${next}`, { scroll: false });
  }

  async function handleRoomStatus(id: number, status: ListingStatus) {
    setActingId(`room-${id}`);
    try {
      await updateRoomStatus(id, status);
      await loadListings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update room.");
    } finally {
      setActingId(null);
    }
  }

  async function handleBusinessStatus(id: number, status: ListingStatus) {
    setActingId(`business-${id}`);
    try {
      await updateBusinessStatus(id, status);
      await loadListings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update business.");
    } finally {
      setActingId(null);
    }
  }

  async function handleGigStatus(id: number, status: ListingStatus) {
    setActingId(`gig-${id}`);
    try {
      await updateGigStatus(id, status);
      await loadListings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update gig.");
    } finally {
      setActingId(null);
    }
  }

  async function handleReviewStatus(
    roomId: number,
    reviewId: string,
    status: "approved" | "rejected"
  ) {
    setActingId(reviewId);
    try {
      await updateReviewStatus(roomId, reviewId, status);
      await loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update review.");
    } finally {
      setActingId(null);
    }
  }

  // ---------------------------------------------------------------------
  // Checking session
  // ---------------------------------------------------------------------
  if (authState === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" className="text-violet-500" />
      </main>
    );
  }

  // ---------------------------------------------------------------------
  // Not signed in as an admin — an inline login, not a dead end. A link
  // from a review-needed email lands here whether or not there's already
  // a session, so this has to be able to fully authenticate someone from
  // a cold start.
  // ---------------------------------------------------------------------
  if (authState !== "admin") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-5">
        <div className="absolute left-1/2 top-[-200px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-400/20 via-violet-400/20 to-cyan-400/20 blur-[140px]" />
        <div className="absolute left-6 top-24 h-28 w-28 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="absolute bottom-20 right-6 h-36 w-36 rounded-full bg-blue-300/20 blur-3xl" />

        <div className="relative z-10 w-full max-w-sm">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 shadow-lg shadow-violet-500/30">
              <ShieldCheck size={26} className="text-white" />
            </div>

            <h1 className="mt-5 text-2xl font-black text-gray-900">
              Cosmopolitan Admin
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {authState === "notAdmin"
                ? "That account doesn't have admin access."
                : "Sign in with your admin account to continue."}
            </p>
          </div>

          {authState === "notAdmin" ? (
            <Button
              onClick={handleLogout}
              variant="outline"
              shape="pill"
              className="mt-8 w-full backdrop-blur bg-white/80"
            >
              Try a different account
            </Button>
          ) : (
            <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Admin email"
                autoComplete="username"
                className="rounded-full border border-white/40 bg-white/60 px-5 py-3 text-sm outline-none backdrop-blur transition focus:border-violet-500"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                className="rounded-full border border-white/40 bg-white/60 px-5 py-3 text-sm outline-none backdrop-blur transition focus:border-violet-500"
              />

              {loginError && <p className="text-sm text-red-500">{loginError}</p>}

              <Button
                type="submit"
                loading={loggingIn}
                variant="gradient"
                tone="violet"
                shape="pill"
              >
                Log in
              </Button>
            </form>
          )}
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------
  const pendingCounts = {
    listings: stats?.pending.listings ?? 0,
    reviews: stats?.pending.reviews ?? 0,
    reports: stats?.pending.reports ?? 0,
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* HEADER */}
      <div className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-blue-600">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-gray-900">
                Cosmopolitan Admin
              </p>
              <p className="text-xs leading-tight text-gray-400">
                {adminName}
              </p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            aria-label="Log out"
            variant="ghost"
            size="icon"
            shape="pill"
            className="h-9 w-9 text-gray-400 hover:text-gray-600"
          >
            <LogOut size={17} />
          </Button>
        </div>

        {/* TAB BAR — horizontally scrollable so it never breaks on a
            narrow phone regardless of label length. */}
        <div className="mx-auto max-w-5xl overflow-x-auto px-4 pb-2 no-scrollbar">
          <div className="flex gap-1.5">
            {TABS.map(({ key, label, icon: Icon }) => {
              const count =
                key === "listings"
                  ? pendingCounts.listings
                  : key === "reviews"
                  ? pendingCounts.reviews
                  : key === "reports"
                  ? pendingCounts.reports
                  : 0;

              const active = tab === key;

              return (
                <button
                  key={key}
                  onClick={() => switchTab(key)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md shadow-violet-500/20"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                  {count > 0 && (
                    <span
                      className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        active ? "bg-white/25 text-white" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {error && (
          <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {tab === "overview" && (
          <OverviewTab
            stats={stats}
            loading={loading}
            onJump={switchTab}
          />
        )}

        {tab === "listings" && (
          <ListingsTab
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            rooms={rooms}
            businesses={businesses}
            gigs={gigs}
            loading={loading}
            actingId={actingId}
            onRoomStatus={handleRoomStatus}
            onBusinessStatus={handleBusinessStatus}
            onGigStatus={handleGigStatus}
          />
        )}

        {tab === "reviews" && (
          <ReviewsTab
            reviews={reviews}
            loading={loading}
            actingId={actingId}
            onReviewStatus={handleReviewStatus}
          />
        )}

        {tab === "reports" && (
          <ReportsTab reports={reports} loading={loading} />
        )}
      </div>
    </main>
  );
}

// ===========================================================================
// OVERVIEW
// ===========================================================================

function StatTile({
  icon: Icon,
  label,
  value,
  tone = "neutral",
  onClick,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  tone?: "neutral" | "good" | "warning";
  onClick?: () => void;
}) {
  const toneClasses = {
    neutral: "bg-violet-50 text-violet-600",
    good: "bg-green-50 text-green-600",
    warning: "bg-amber-50 text-amber-600",
  }[tone];

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={`flex flex-col items-start gap-3 rounded-2xl bg-white p-4 text-left shadow-sm border border-gray-100/80 ${
        onClick ? "cursor-pointer hover:-translate-y-0.5 transition-transform" : ""
      }`}
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses}`}>
        <Icon size={17} />
      </div>
      <div>
        {/* proportional figures, not tabular — this is a standalone
            headline number, not a column that needs digit alignment */}
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </Wrapper>
  );
}

function OverviewTab({
  stats,
  loading,
  onJump,
}: {
  stats: AdminStats | null;
  loading: boolean;
  onJump: (tab: Tab) => void;
}) {
  if (loading && !stats) {
    return (
      <div className="flex justify-center py-20 text-gray-400">
        <Spinner />
      </div>
    );
  }

  if (!stats) return null;

  const totalPending =
    stats.pending.listings + stats.pending.reviews + stats.pending.reports;

  return (
    <div className="space-y-8">
      {/* NEEDS ATTENTION — status color, icon + label, never color alone */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
            Needs your attention
          </h2>
          {totalPending > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
              {totalPending}
            </span>
          )}
        </div>

        {totalPending === 0 ? (
          <EmptyState
            title="You're all caught up — nothing pending right now."
            className="py-6"
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatTile
              icon={Clock}
              label="Listings pending review"
              value={stats.pending.listings}
              tone="warning"
              onClick={() => onJump("listings")}
            />
            <StatTile
              icon={MessageSquare}
              label="Reviews awaiting approval"
              value={stats.pending.reviews}
              tone="warning"
              onClick={() => onJump("reviews")}
            />
            <StatTile
              icon={Flag}
              label="Open reports"
              value={stats.pending.reports}
              tone="warning"
              onClick={() => onJump("reports")}
            />
          </div>
        )}
      </div>

      {/* COMMUNITY */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
          Community
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          <StatTile icon={Users} label="Total users" value={stats.totalUsers} />
          <StatTile
            icon={UserPlus}
            label="New this week"
            value={stats.newUsersThisWeek}
            tone="good"
          />
        </div>
      </div>

      {/* LIVE LISTINGS */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
          Live listings
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <StatTile icon={Home} label="Properties" value={stats.listings.rooms} />
          <StatTile icon={Building2} label="Businesses" value={stats.listings.businesses} />
          <StatTile icon={HandHelping} label="Piece jobs" value={stats.listings.gigs} />
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// LISTINGS
// ===========================================================================

function ListingRow({
  listing,
  displayName,
  busy,
  onApprove,
  onReject,
}: {
  listing: Listing;
  displayName: string;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <p className="truncate font-medium text-gray-900">{displayName}</p>
        <p className="mt-0.5 text-xs text-gray-400">
          Status: <span className="capitalize">{listing.status.replace("_", " ")}</span>
          {" · "}
          {listing.reportCount} report{listing.reportCount === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button
          onClick={onApprove}
          loading={busy}
          variant="solid"
          tone="green"
          size="sm"
          className="rounded-lg px-3 py-1.5 h-auto"
        >
          <Check size={13} />
          Approve
        </Button>
        <Button
          onClick={onReject}
          disabled={busy}
          variant="danger-outline"
          size="sm"
          className="rounded-lg px-3 py-1.5 h-auto"
        >
          <X size={13} />
          Suspend
        </Button>
      </div>
    </div>
  );
}

function ListingGroup({
  title,
  icon: Icon,
  listings,
  actingPrefix,
  actingId,
  onApprove,
  onReject,
}: {
  title: string;
  icon: typeof Home;
  listings: Listing[];
  actingPrefix: string;
  actingId: string | null;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon size={15} className="text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="text-xs text-gray-400">({listings.length})</span>
      </div>

      {listings.length === 0 ? (
        <p className="text-sm text-gray-400">Nothing here.</p>
      ) : (
        <div className="space-y-2.5">
          {listings.map((l) => (
            <ListingRow
              key={l.id}
              listing={l}
              displayName={l.name ?? l.title ?? "Untitled"}
              busy={actingId === `${actingPrefix}-${l.id}`}
              onApprove={() => onApprove(l.id)}
              onReject={() => onReject(l.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingsTab({
  statusFilter,
  setStatusFilter,
  rooms,
  businesses,
  gigs,
  loading,
  actingId,
  onRoomStatus,
  onBusinessStatus,
  onGigStatus,
}: {
  statusFilter: ListingStatus;
  setStatusFilter: (s: ListingStatus) => void;
  rooms: Listing[];
  businesses: Listing[];
  gigs: Listing[];
  loading: boolean;
  actingId: string | null;
  onRoomStatus: (id: number, status: ListingStatus) => void;
  onBusinessStatus: (id: number, status: ListingStatus) => void;
  onGigStatus: (id: number, status: ListingStatus) => void;
}) {
  const filters: { key: ListingStatus; label: string }[] = [
    { key: "pending_review", label: "Pending" },
    { key: "active", label: "Active" },
    { key: "suspended", label: "Suspended" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition ${
              statusFilter === f.key
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-8">
          <ListingGroup
            title="Properties"
            icon={Home}
            listings={rooms}
            actingPrefix="room"
            actingId={actingId}
            onApprove={(id) => onRoomStatus(id, "active")}
            onReject={(id) => onRoomStatus(id, "suspended")}
          />
          <ListingGroup
            title="Businesses"
            icon={Building2}
            listings={businesses}
            actingPrefix="business"
            actingId={actingId}
            onApprove={(id) => onBusinessStatus(id, "active")}
            onReject={(id) => onBusinessStatus(id, "suspended")}
          />
          <ListingGroup
            title="Piece jobs"
            icon={HandHelping}
            listings={gigs}
            actingPrefix="gig"
            actingId={actingId}
            onApprove={(id) => onGigStatus(id, "active")}
            onReject={(id) => onGigStatus(id, "suspended")}
          />
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// REVIEWS
// ===========================================================================

function ReviewsTab({
  reviews,
  loading,
  actingId,
  onReviewStatus,
}: {
  reviews: PendingReview[];
  loading: boolean;
  actingId: string | null;
  onReviewStatus: (roomId: number, reviewId: string, status: "approved" | "rejected") => void;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-16 text-gray-400">
        <Spinner />
      </div>
    );
  }

  if (reviews.length === 0) {
    return <EmptyState title="No reviews waiting on approval." className="py-10" />;
  }

  return (
    <div className="space-y-3">
      {reviews.map(({ roomId, roomName, review }) => (
        <div
          key={review.id}
          className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-gray-400">On</p>
              <p className="truncate font-medium text-gray-900">{roomName}</p>
            </div>
            <div className="flex shrink-0 gap-0.5">
              {Array.from({ length: review.rating }).map((_, i) => (
                <Star key={i} size={13} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-600">{review.comment}</p>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {review.name} ·{" "}
              {new Date(review.createdAt).toLocaleDateString("en-ZA")}
            </p>

            <div className="flex gap-2">
              <Button
                onClick={() => onReviewStatus(roomId, review.id, "approved")}
                loading={actingId === review.id}
                variant="solid"
                tone="green"
                size="sm"
                className="rounded-lg px-3 py-1.5 h-auto"
              >
                <Check size={13} />
                Approve
              </Button>
              <Button
                onClick={() => onReviewStatus(roomId, review.id, "rejected")}
                disabled={actingId === review.id}
                variant="danger-outline"
                size="sm"
                className="rounded-lg px-3 py-1.5 h-auto"
              >
                <X size={13} />
                Reject
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ===========================================================================
// REPORTS
// ===========================================================================

function ReportsTab({ reports, loading }: { reports: Report[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex justify-center py-16 text-gray-400">
        <Spinner />
      </div>
    );
  }

  if (reports.length === 0) {
    return <EmptyState title="No reports yet." className="py-10" />;
  }

  const targetHref = (report: Report) => {
    if (report.targetType === "room") return `/rooms/${report.targetId}`;
    if (report.targetType === "business") return `/business/${report.targetId}`;
    return `/gigs/${report.targetId}`;
  };

  return (
    <div className="space-y-2.5">
      {reports.map((report) => (
        <Link
          key={report.id}
          href={targetHref(report)}
          target="_blank"
          className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-gray-200 hover:shadow-md"
        >
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <Flag size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 capitalize">
              {report.targetType} #{report.targetId}
            </p>
            <p className="mt-0.5 text-sm text-gray-600">{report.reason}</p>
            <p className="mt-1 text-xs text-gray-400">
              Reported by {report.reporter?.email ?? "unknown"} ·{" "}
              {new Date(report.createdAt).toLocaleDateString("en-ZA")}
            </p>
          </div>
          <ChevronRight size={16} className="mt-1 shrink-0 text-gray-300" />
        </Link>
      ))}
    </div>
  );
}
