"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  Building2,
  BedDouble,
  Zap,
  Plus,
  TrendingUp,
  ArrowRight,
  User,
  Home,
  LogOut,
  Pencil,
  Trash2,
} from "lucide-react";
import Button from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import EmptyState from "@/components/ui/empty-state";
import { cardVariants } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { deleteBusiness } from "@/features/business/services/business.service";
import { deleteRoom } from "@/features/rooms/services/room.service";
import { deleteGig } from "@/features/gigs/services/gig.service";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Business {
  id: number;
  name: string;
}

interface Room {
  id: number;
  name: string;
}

interface Gig {
  id: number;
  title: string;
  status: "active" | "filled" | "expired" | "pending_review";
}

interface DashboardResponse {
  businesses: Business[];
  rooms: Room[];
  gigs: Gig[];
}

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardResponse>({
    businesses: [],
    rooms: [],
    gigs: [],
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setDashboard(data);
    } catch {
      router.replace("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  // Tracks which row's delete is in flight (keyed "type:id") so only that
  // row's button shows a spinner, rather than blocking the whole dashboard.
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const handleDeleteBusiness = async (e: React.MouseEvent, business: Business) => {
    e.stopPropagation();
    if (!confirm(`Delete "${business.name}"? This can't be undone.`)) return;

    setDeletingKey(`business:${business.id}`);
    try {
      await deleteBusiness(business.id);
      setDashboard((prev) => ({
        ...prev,
        businesses: prev.businesses.filter((b) => b.id !== business.id),
      }));
      toast.success("Business deleted");
    } catch (error: any) {
      alert(error.message || "Failed to delete business.");
    } finally {
      setDeletingKey(null);
    }
  };

  const handleDeleteRoom = async (e: React.MouseEvent, room: Room) => {
    e.stopPropagation();
    if (!confirm(`Delete "${room.name}"? This can't be undone.`)) return;

    setDeletingKey(`room:${room.id}`);
    try {
      await deleteRoom(room.id);
      setDashboard((prev) => ({
        ...prev,
        rooms: prev.rooms.filter((r) => r.id !== room.id),
      }));
      toast.success("Property deleted");
    } catch (error: any) {
      alert(error.message || "Failed to delete room.");
    } finally {
      setDeletingKey(null);
    }
  };

  const handleDeleteGig = async (e: React.MouseEvent, gig: Gig) => {
    e.stopPropagation();
    if (!confirm(`Delete "${gig.title}"? This can't be undone.`)) return;

    setDeletingKey(`gig:${gig.id}`);
    try {
      await deleteGig(gig.id);
      setDashboard((prev) => ({
        ...prev,
        gigs: prev.gigs.filter((g) => g.id !== gig.id),
      }));
      toast.success("Piece job deleted");
    } catch (error: any) {
      alert(error.message || "Failed to delete piece job.");
    } finally {
      setDeletingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-300/10 blur-3xl" />
        
        <div className="relative text-center">
          <div className="mb-4 flex justify-center">
            <Spinner size="lg" className="text-blue-500" />
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-10">
      {/* Background blobs */}
      <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-300/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        {/* Navigation Bar */}
        <nav className="mb-8 flex items-center justify-between rounded-2xl border border-white/40 bg-white/70 px-6 py-4 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Image
              src="/CosmoBusinesses.png"
              alt="Cosmopolitan"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <div>
              <h2 className="text-sm font-bold text-gray-900">Dashboard</h2>
              <p className="text-xs text-gray-500">Manage your listings</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")}
              className="flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200">
              <Home size={16} />
              <span className="hidden sm:inline">Home</span>
            </button>

            <button onClick={() => router.push("/auth/account")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-blue-400/40">
              <User size={16} />
              <span className="hidden sm:inline">Account</span>
            </button>
          </div>
        </nav>

        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
              <TrendingUp size={24} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome Back!
            </h1>
            <p className="mt-1 text-gray-500">
              Here's an overview of your listings and activity.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button onClick={() => router.push("/business/create")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-blue-400/40">
              <Plus size={18} />
              Add Business
            </button>

            <button onClick={() => router.push("/rooms/create")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-green-400/40">
              <Plus size={18} />
              Add Room
            </button>

            <button onClick={() => router.push("/gigs/create")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-amber-400/40">
              <Plus size={18} />
              Post Piece Job
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className={cn(cardVariants({ variant: "glass", padding: "lg" }), "group transition-all hover:shadow-xl")}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Businesses
                </p>
                <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">
                  {dashboard.businesses.length}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  {dashboard.businesses.length === 0 ? "No businesses yet" : "Active listings"}
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 text-white shadow-lg">
                <Building2 size={24} />
              </div>
            </div>
            {dashboard.businesses.length > 0 && (
              <div className="mt-4 flex items-center gap-1 text-sm text-blue-600">
                <TrendingUp size={14} />
                <span>View all businesses</span>
                <ArrowRight size={14} />
              </div>
            )}
          </div>

          <div className={cn(cardVariants({ variant: "glass", padding: "lg" }), "group transition-all hover:shadow-xl")}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Rooms
                </p>
                <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">
                  {dashboard.rooms.length}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  {dashboard.rooms.length === 0 ? "No rooms yet" : "Available properties"}
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-3 text-white shadow-lg">
                <BedDouble size={24} />
              </div>
            </div>
            {dashboard.rooms.length > 0 && (
              <div className="mt-4 flex items-center gap-1 text-sm text-green-600">
                <TrendingUp size={14} />
                <span>View all rooms</span>
                <ArrowRight size={14} />
              </div>
            )}
          </div>

          <div className={cn(cardVariants({ variant: "glass", padding: "lg" }), "group transition-all hover:shadow-xl")}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Piece Jobs
                </p>
                <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">
                  {dashboard.gigs.length}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  {dashboard.gigs.length === 0 ? "No piece jobs yet" : "Posted tasks"}
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-3 text-white shadow-lg">
                <Zap size={24} />
              </div>
            </div>
            {dashboard.gigs.length > 0 && (
              <div className="mt-4 flex items-center gap-1 text-sm text-amber-600">
                <TrendingUp size={14} />
                <span>View all piece jobs</span>
                <ArrowRight size={14} />
              </div>
            )}
          </div>
        </div>

        {/* Listings */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Businesses List */}
          <div className={cn(cardVariants({ variant: "glass", padding: "lg" }))}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building2 size={20} className="text-blue-600" />
                My Businesses
              </h2>
              {dashboard.businesses.length > 0 && (
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {dashboard.businesses.length} total
                </span>
              )}
            </div>

            {dashboard.businesses.length === 0 ? (
              <div>
                <EmptyState
                  icon={<Building2 size={40} />}
                  title="No businesses yet"
                  description="Start by adding your first business"
                  action={
                    <Button
                      onClick={() => router.push("/business/create")}
                      variant="solid"
                      tone="blue"
                      className="hover:shadow-blue-400/40"
                    >
                      Add Business
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.businesses.map((business, index) => (
                  <div key={business.id}
              className="group flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white/50 p-4 transition-all hover:border-blue-200"
              onClick={() => router.push(`/business/${business.id}`)}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 font-semibold">
                        {business.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {business.name}
                        </p>
                        <p className="text-xs text-gray-400">Business</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/business/${business.id}/bookings`);
                        }}
                        className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition"
                      >
                        Bookings
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/business/${business.id}/edit`);
                        }}
                        title="Edit"
                        className="rounded-full p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteBusiness(e, business)}
                        disabled={deletingKey === `business:${business.id}`}
                        title="Delete"
                        className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                      >
                        {deletingKey === `business:${business.id}` ? (
                          <Spinner size="sm" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                      <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rooms List */}
          <div className={cn(cardVariants({ variant: "glass", padding: "lg" }))}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BedDouble size={20} className="text-green-600" />
                My Rooms
              </h2>
              {dashboard.rooms.length > 0 && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                  {dashboard.rooms.length} total
                </span>
              )}
            </div>

            {dashboard.rooms.length === 0 ? (
              <div>
                <EmptyState
                  icon={<BedDouble size={40} />}
                  title="No rooms yet"
                  description="Start by adding your first room"
                  action={
                    <Button
                      onClick={() => router.push("/rooms/create")}
                      variant="solid"
                      tone="green"
                      className="hover:shadow-green-400/40"
                    >
                      Add Room
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.rooms.map((room, index) => (
                  <div key={room.id}
              className="group flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white/50 p-4 transition-all hover:border-green-200"
              onClick={() => router.push(`/rooms/${room.id}`)}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-100 to-emerald-200 text-green-600 font-semibold">
                        {room.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                          {room.name}
                        </p>
                        <p className="text-xs text-gray-400">Room</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/rooms/${room.id}/edit`);
                        }}
                        title="Edit"
                        className="rounded-full p-2 text-gray-400 hover:bg-green-50 hover:text-green-600 transition"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteRoom(e, room)}
                        disabled={deletingKey === `room:${room.id}`}
                        title="Delete"
                        className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                      >
                        {deletingKey === `room:${room.id}` ? (
                          <Spinner size="sm" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                      <ArrowRight size={16} className="text-gray-300 group-hover:text-green-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Piece Jobs List */}
          <div className={cn(cardVariants({ variant: "glass", padding: "lg" }))}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap size={20} className="text-amber-600" />
                My Piece Jobs
              </h2>
              {dashboard.gigs.length > 0 && (
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                  {dashboard.gigs.length} total
                </span>
              )}
            </div>

            {dashboard.gigs.length === 0 ? (
              <div>
                <EmptyState
                  icon={<Zap size={40} />}
                  title="No piece jobs yet"
                  description="Post a one-off task or offer your skills"
                  action={
                    <Button
                      onClick={() => router.push("/gigs/create")}
                      variant="solid"
                      tone="amber"
                      className="hover:shadow-amber-400/40"
                    >
                      Post Piece Job
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.gigs.map((gig, index) => (
                  <div key={gig.id}
              className="group flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white/50 p-4 transition-all hover:border-amber-200"
              onClick={() => router.push(`/gigs/${gig.id}`)}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-200 text-amber-600 font-semibold">
                        {gig.title.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors">
                          {gig.title}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">{gig.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/gigs/${gig.id}/edit`);
                        }}
                        title="Edit"
                        className="rounded-full p-2 text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteGig(e, gig)}
                        disabled={deletingKey === `gig:${gig.id}`}
                        title="Delete"
                        className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                      >
                        {deletingKey === `gig:${gig.id}` ? (
                          <Spinner size="sm" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                      <ArrowRight size={16} className="text-gray-300 group-hover:text-amber-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}