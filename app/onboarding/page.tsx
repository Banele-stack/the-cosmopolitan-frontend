"use client";

import {
  Building2,
  BedDouble,
  Zap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { getProfile } from "@/features/auth/services/auth.service";

export default function OnboardingPage() {
  const router = useRouter();

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.18,
      },
    },
  };

  const item = {
    hidden: {
      opacity: 0,
      y: 35,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const handleCreate = async (path: string) => {
  // 1. Get the logged-in user's profile
  const profile = await getProfile();

  // 2. Check if they're verified
  const verified =
    profile.emailVerified || profile.phoneVerified;

  if (!verified) {
    router.push(`/auth/verify?next=${encodeURIComponent(path)}`);
    return;
  }

  // 3. Already verified
  router.push(path);
};

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />

      <div className="relative flex min-h-[calc(100vh-73px)] items-center justify-center px-5 py-10">
      {/* Background Glow */}
      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative w-full max-w-md"
      >
        {/* Header */}
        <motion.div
          variants={item}
          className="mb-10 text-center"
        >
          <motion.div
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-xl"
          >
            <Sparkles className="text-white" size={30} />
          </motion.div>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Welcome 👋
          </h1>

          <p className="mt-4 text-gray-600">
            You're almost ready to start listing on
            <span className="font-semibold text-blue-700">
              {" "}
              Cosmopolitan
            </span>
            .
          </p>

          <p className="text-gray-600">
            Choose what you'd like to create first.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={container}
          className="space-y-5"
        >
          {/* Business */}
          <motion.button
            variants={item}
            whileHover={{
              scale: 1.03,
              y: -4,
            }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={() => handleCreate("/business/create")}
            className="group relative w-full overflow-hidden rounded-3xl border border-white/50 bg-white/70 p-6 text-left shadow-xl backdrop-blur-xl transition"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 transition group-hover:opacity-100" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-5">
                <motion.div
                  whileHover={{
                    rotate: 10,
                    scale: 1.1,
                  }}
                  className="rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-4 shadow-lg"
                >
                  <Building2
                    size={30}
                    className="text-white"
                  />
                </motion.div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Create a Business
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Hotels, restaurants, salons, tutors and
                    more — a listing that stays open for new
                    clients until you take it down.
                  </p>
                </div>
              </div>

              <ArrowRight className="text-gray-400 transition duration-300 group-hover:translate-x-2 group-hover:text-blue-600" />
            </div>
          </motion.button>

          {/* Piece Job */}
          <motion.button
            variants={item}
            whileHover={{
              scale: 1.03,
              y: -4,
            }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={() => handleCreate("/gigs/create")}
            className="group relative w-full overflow-hidden rounded-3xl border border-white/50 bg-white/70 p-6 text-left shadow-xl backdrop-blur-xl transition"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 transition group-hover:opacity-100" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-5">
                <motion.div
                  whileHover={{
                    rotate: 10,
                    scale: 1.1,
                  }}
                  className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 p-4 shadow-lg"
                >
                  <Zap
                    size={30}
                    className="text-white"
                  />
                </motion.div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Post a Piece Job
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Need help today, or free to work this
                    week? A one-off task that expires on its
                    own — no shop required.
                  </p>
                </div>
              </div>

              <ArrowRight className="text-gray-400 transition duration-300 group-hover:translate-x-2 group-hover:text-amber-600" />
            </div>
          </motion.button>

          {/* Room */}
          <motion.button
            variants={item}
            whileHover={{
              scale: 1.03,
              y: -4,
            }}
            whileTap={{
              scale: 0.98,
            }}
            onClick={() => handleCreate("/rooms/create")}
            className="group relative w-full overflow-hidden rounded-3xl border border-white/50 bg-white/70 p-6 text-left shadow-xl backdrop-blur-xl transition"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 transition group-hover:opacity-100" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-5">
                <motion.div
                  whileHover={{
                    rotate: -10,
                    scale: 1.1,
                  }}
                  className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-4 shadow-lg"
                >
                  <BedDouble
                    size={30}
                    className="text-white"
                  />
                </motion.div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Add a Room
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Rent out a room, apartment, flat or
                    accommodation.
                  </p>
                </div>
              </div>

              <ArrowRight className="text-gray-400 transition duration-300 group-hover:translate-x-2 group-hover:text-green-600" />
            </div>
          </motion.button>
        </motion.div>

        {/* Tip */}
        <motion.div
          variants={item}
          className="mt-8 rounded-3xl border border-blue-200 bg-white/60 p-5 shadow-lg backdrop-blur-xl"
        >
          <div className="flex items-center gap-2">
            <Sparkles
              className="text-blue-600"
              size={18}
            />

            <p className="font-semibold text-blue-700">
              Quick Tip
            </p>
          </div>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Don't worry—you can always add more businesses,
            rooms, and piece jobs later from your dashboard
            whenever you're ready.
          </p>
        </motion.div>

        <motion.div variants={item} className="mt-4 text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Skip for now
          </button>
        </motion.div>
      </motion.div>
      </div>
    </main>
  );
}