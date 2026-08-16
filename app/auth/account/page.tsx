"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  ShieldCheck,
  LogOut,
  ChevronRight,
  BadgeCheck,
  Key,
  Building2,
  BedDouble,
  Star,
  Bell,
  CreditCard,
  Calendar,
  Users,
  ArrowRight,
  Pencil,
  Check,
  X,
  Loader2,
  Link2,
} from "lucide-react";
import { getProfile, logout, updateProfile } from "@/features/auth/services/auth.service";
import Button from "@/components/ui/button";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface DashboardListing {
  id: number;
  name: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [businesses, setBusinesses] = useState<DashboardListing[]>([]);
  const [rooms, setRooms] = useState<DashboardListing[]>([]);

  const [editingName, setEditingName] = useState(false);
  const [firstNameDraft, setFirstNameDraft] = useState("");
  const [surnameDraft, setSurnameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Same two fields as signup (see app/auth/signup/page.tsx) — kept
  // separate rather than one shared slot so an owner who's active on both
  // Facebook and TikTok doesn't have to pick one. Editable here too since
  // plenty of people don't have either link ready at signup, and whatever
  // they set flows onto every listing/room they own (ownerSocialUrl/
  // ownerTiktokUrl — see room.service.ts and friends).
  const [editingSocial, setEditingSocial] = useState(false);
  const [socialLinkDraft, setSocialLinkDraft] = useState("");
  const [tiktokUrlDraft, setTiktokUrlDraft] = useState("");
  const [savingSocial, setSavingSocial] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
        setFirstNameDraft(profile.firstName ?? "");
        setSurnameDraft(profile.surname ?? "");
        setSocialLinkDraft(profile.socialLink ?? "");
        setTiktokUrlDraft(profile.tiktokUrl ?? "");
      } catch {
        router.push("/auth/login");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setBusinesses(data.businesses ?? []);
          setRooms(data.rooms ?? []);
        }
      } catch {
        // Listings summary is supplementary — the account page still
        // works without it.
      }
    })();
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const saveName = async () => {
    if (!firstNameDraft.trim() || !surnameDraft.trim()) return;

    setSavingName(true);

    try {
      const updated = await updateProfile({
        firstName: firstNameDraft.trim(),
        surname: surnameDraft.trim(),
      });

      setUser((prev: any) => ({ ...prev, ...updated }));
      setEditingName(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingName(false);
    }
  };

  // Users paste links in every shape ("facebook.com/x", "tiktok.com/@x",
  // "https://..."). Mirrors the same normalizer on the signup form so a
  // link added here behaves identically to one added at signup.
  const normalizeSocialLink = (link: string) => {
    const trimmed = link.trim();

    if (!trimmed) return undefined;

    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const saveSocialLinks = async () => {
    setSavingSocial(true);

    try {
      const updated = await updateProfile({
        socialLink: normalizeSocialLink(socialLinkDraft) ?? "",
        tiktokUrl: normalizeSocialLink(tiktokUrlDraft) ?? "",
      });

      setUser((prev: any) => ({ ...prev, ...updated }));
      setSocialLinkDraft(updated.socialLink ?? "");
      setTiktokUrlDraft(updated.tiktokUrl ?? "");
      setEditingSocial(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSocial(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-ZA", {
        month: "short",
        year: "numeric",
      })
    : "—";

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin" />
            </div>
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-10" />
          </div>
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/80 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Navigation Bar */}
        <div className="mb-8 flex items-center justify-between">
          <button
  type="button"
  onClick={() => router.push("/")}
  className="flex items-center gap-3 rounded-xl transition hover:bg-gray-100 p-2"
>
  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-md">
    <Building2 size={20} className="text-white" />
  </div>

  <div className="text-left">
    <h1 className="text-lg font-bold text-gray-900">Account</h1>
    <p className="text-xs text-gray-500">Manage your profile</p>
  </div>
</button>
          
          <div className="flex items-center gap-3">
            <div
              title="Notifications — coming soon"
              className="rounded-full p-2 text-gray-300"
            >
              <Bell size={20} />
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-all hover:shadow-md active:scale-95"
            >
              Dashboard
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Profile */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100/80">
              {/* Profile Header */}
              <div className="relative">
                <div className="h-20 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-white text-2xl font-bold text-gray-700 shadow-lg">
                      {user.firstName?.charAt(0).toUpperCase()}
                      {user.surname?.charAt(0).toUpperCase()}
                    </div>
                    {user.phoneVerified && (
                      <div
                        title="Phone verified"
                        className="absolute -right-1 -top-1 rounded-full bg-green-500 p-1 shadow-sm"
                      >
                        <BadgeCheck size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-12 px-6 pb-6 text-center">
                {editingName ? (
                  <div className="flex items-center justify-center gap-2">
                    <input
                      value={firstNameDraft}
                      onChange={(e) => setFirstNameDraft(e.target.value)}
                      placeholder="First name"
                      className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-center text-sm outline-none focus:border-blue-500"
                    />
                    <input
                      value={surnameDraft}
                      onChange={(e) => setSurnameDraft(e.target.value)}
                      placeholder="Surname"
                      className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-center text-sm outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={saveName}
                      disabled={savingName}
                      className="rounded-lg bg-blue-600 p-1.5 text-white disabled:opacity-50"
                    >
                      {savingName ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingName(false);
                        setFirstNameDraft(user.firstName ?? "");
                        setSurnameDraft(user.surname ?? "");
                      }}
                      className="rounded-lg bg-gray-100 p-1.5 text-gray-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingName(true)}
                    className="group inline-flex items-center gap-1.5 text-lg font-semibold text-gray-900"
                  >
                    {user.firstName} {user.surname}
                    <Pencil
                      size={12}
                      className="text-gray-300 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </button>
                )}
                <p className="text-sm text-gray-500">{user.email}</p>

                <div className="mt-4 flex justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    <ShieldCheck size={12} />
                    {user.role || "Member"}
                  </span>
                  {user.phoneVerified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                      <BadgeCheck size={12} />
                      Phone Verified
                    </span>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-gray-50/80 p-3">
                    <p className="text-xs text-gray-500">Member Since</p>
                    <p className="text-sm font-semibold text-gray-900">{memberSince}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50/80 p-3">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.phoneNumber || "—"}</p>
                  </div>
                </div>

                <Button
                  onClick={handleLogout}
                  variant="danger-outline"
                  className="mt-6 w-full"
                >
                  <LogOut size={16} />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid — every number here is real: listings come from
                the same /dashboard data the Dashboard page uses, so the
                two screens can't disagree. */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Listings",
                  value: String(businesses.length + rooms.length),
                  icon: Building2,
                },
                { label: "Member Since", value: memberSince, icon: Users },
                {
                  label: "Account Status",
                  value: user.phoneVerified ? "Phone Verified" : "Unverified",
                  icon: Star,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100/80 transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <stat.icon size={18} />
                  </div>
                  <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions — only "Edit Profile" actually does
                something (it scrolls up to the inline name editor above);
                the rest are honestly marked as not built yet instead of
                looking clickable and doing nothing. */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100/80">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Quick Actions</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setEditingName(true)}
                  className="flex items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                    <User size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">Edit Profile</p>
                    <p className="truncate text-xs text-gray-400">Update your name</p>
                  </div>
                  <ChevronRight size={16} className="flex-shrink-0 text-gray-300" />
                </button>

                <button
                  onClick={() => router.push("/bookings")}
                  className="flex items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                    <Calendar size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">My Bookings</p>
                    <p className="truncate text-xs text-gray-400">Appointments you've booked</p>
                  </div>
                  <ChevronRight size={16} className="flex-shrink-0 text-gray-300" />
                </button>

                {[
                  { icon: Key, label: "Security", description: "Password & 2FA" },
                  { icon: Bell, label: "Notifications", description: "Manage alerts" },
                  { icon: CreditCard, label: "Billing", description: "Payment methods" },
                ].map((action) => (
                  <div
                    key={action.label}
                    aria-disabled
                    className="flex cursor-default items-center gap-3 rounded-xl p-3 text-left opacity-60"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
                      <action.icon size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-500">{action.label}</p>
                      <p className="truncate text-xs text-gray-400">{action.description}</p>
                    </div>
                    <span className="flex-shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                      Coming soon
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links — Facebook and TikTok as two separate fields
                (not one shared slot), since plenty of owners run both.
                Whatever's set here shows up on every listing/room this
                account owns (see SocialLinkButton/TikTokFollow on the
                room/business/gig detail pages) — not just a personal
                profile link, a business or ad page works just as well. */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100/80">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Social Links</h3>

                {!editingSocial && (
                  <button
                    onClick={() => setEditingSocial(true)}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                )}
              </div>

              <p className="mb-4 text-xs text-gray-400">
                Advertise on Facebook or TikTok? Add that page's link — it'll
                appear on every listing and room you have, not just your
                personal profile.
              </p>

              {editingSocial ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                      Facebook or LinkedIn link
                    </label>
                    <input
                      value={socialLinkDraft}
                      onChange={(e) => setSocialLinkDraft(e.target.value)}
                      placeholder="facebook.com/yourpage"
                      autoComplete="url"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                      TikTok link
                    </label>
                    <input
                      value={tiktokUrlDraft}
                      onChange={(e) => setTiktokUrlDraft(e.target.value)}
                      placeholder="tiktok.com/@youraccount"
                      autoComplete="url"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={saveSocialLinks}
                      disabled={savingSocial}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                    >
                      {savingSocial ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Check size={13} />
                      )}
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingSocial(false);
                        setSocialLinkDraft(user.socialLink ?? "");
                        setTiktokUrlDraft(user.tiktokUrl ?? "");
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                    >
                      <X size={13} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Link2 size={14} className="flex-shrink-0 text-gray-400" />
                    {user.socialLink ? (
                      <a
                        href={user.socialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-blue-600 hover:underline"
                      >
                        {user.socialLink}
                      </a>
                    ) : (
                      <span className="text-gray-400">No Facebook/LinkedIn link added</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Link2 size={14} className="flex-shrink-0 text-gray-400" />
                    {user.tiktokUrl ? (
                      <a
                        href={user.tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-blue-600 hover:underline"
                      >
                        {user.tiktokUrl}
                      </a>
                    ) : (
                      <span className="text-gray-400">No TikTok link added</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Listings — real data instead of a fabricated activity feed. */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100/80">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Your Listings</h3>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  View all
                </button>
              </div>

              {businesses.length + rooms.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">
                  You haven't listed anything yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {businesses.slice(0, 3).map((business) => (
                    <button
                      key={`business-${business.id}`}
                      onClick={() => router.push(`/business/${business.id}`)}
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Building2 size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-gray-700">{business.name}</p>
                        <p className="text-xs text-gray-400">Business</p>
                      </div>
                      <ArrowRight size={14} className="text-gray-300" />
                    </button>
                  ))}

                  {rooms.slice(0, 3).map((room) => (
                    <button
                      key={`room-${room.id}`}
                      onClick={() => router.push(`/rooms/${room.id}`)}
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                        <BedDouble size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-gray-700">{room.name}</p>
                        <p className="text-xs text-gray-400">Room</p>
                      </div>
                      <ArrowRight size={14} className="text-gray-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}