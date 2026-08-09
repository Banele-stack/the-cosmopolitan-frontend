"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
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

  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
        setFirstNameDraft(profile.firstName ?? "");
        setSurnameDraft(profile.surname ?? "");
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

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-ZA", {
        month: "short",
        year: "numeric",
      })
    : "—";

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const item: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin" />
            </div>
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-10" />
          </div>
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading your account...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/80 px-4 py-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-6xl"
      >
        {/* Navigation Bar */}
        <motion.div
          variants={item}
          className="mb-8 flex items-center justify-between"
        >
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-all hover:shadow-md"
            >
              Dashboard
            </motion.button>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Profile */}
          <motion.div
            variants={item}
            className="lg:col-span-1"
          >
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100/80">
              {/* Profile Header */}
              <div className="relative">
                <div className="h-20 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="relative"
                  >
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
                  </motion.div>
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
          </motion.div>

          {/* Right Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid — every number here is real: listings come from
                the same /dashboard data the Dashboard page uses, so the
                two screens can't disagree. */}
            <motion.div
              variants={item}
              className="grid grid-cols-3 gap-4"
            >
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
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -2 }}
                  className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100/80"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <stat.icon size={18} />
                  </div>
                  <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Quick Actions — only "Edit Profile" actually does
                something (it scrolls up to the inline name editor above);
                the rest are honestly marked as not built yet instead of
                looking clickable and doing nothing. */}
            <motion.div
              variants={item}
              className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100/80"
            >
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Quick Actions</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditingName(true)}
                  className="flex items-center gap-3 rounded-xl p-3 text-left transition-all"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                    <User size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">Edit Profile</p>
                    <p className="truncate text-xs text-gray-400">Update your name</p>
                  </div>
                  <ChevronRight size={16} className="flex-shrink-0 text-gray-300" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push("/bookings")}
                  className="flex items-center gap-3 rounded-xl p-3 text-left transition-all"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                    <Calendar size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">My Bookings</p>
                    <p className="truncate text-xs text-gray-400">Appointments you've booked</p>
                  </div>
                  <ChevronRight size={16} className="flex-shrink-0 text-gray-300" />
                </motion.button>

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
            </motion.div>

            {/* Listings — real data instead of a fabricated activity feed. */}
            <motion.div
              variants={item}
              className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100/80"
            >
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
            </motion.div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}