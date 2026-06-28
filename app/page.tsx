"use client";

import { useEffect, useState } from "react";
import Footer from "./components/footer/Footer";
import Hero from "./components/hero/Hero";
import FeaturedListings from "./components/listings/FeaturedListings";
import Navbar from "./components/navbar/Navbar";
import BusinessCard from "./components/BusinessCard";
import { Business, getBusinesses } from "./services/business.service";
import MobileTabs from "./components/navigation/MobileTabs";
import { CalendarDays } from "lucide-react";

type ViewMode = "rooms" | "businesses" | "events";

type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [view, setView] = useState<ViewMode>("rooms");

  // mock events (you can later replace with API)
  const [events] = useState<Event[]>([
    {
      id: "1",
      title: "Cosmo City Street Market",
      date: "Saturday 10:00 AM",
      location: "Cosmo City Shopping Centre",
      description: "Food, music, and local vendors.",
    },
    {
      id: "2",
      title: "Weekend Soccer Tournament",
      date: "Sunday 09:00 AM",
      location: "Cosmo City Sports Ground",
      description: "Community football matches and prizes.",
    },
    {
      id: "3",
      title: "Youth Coding Meetup",
      date: "Friday 17:00 PM",
      location: "Community Library",
      description: "Learn React, AI, and software basics.",
    },
  ]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const data = await getBusinesses();
        setBusinesses(data);
      } catch (error) {
        console.error("Failed to fetch businesses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 pb-20 md:pb-0">
      <Navbar />

      <Hero view={view} setView={setView} />

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ===== ROOMS ===== */}
        {view === "rooms" && <FeaturedListings />}

        {/* ===== BUSINESSES ===== */}
        {view === "businesses" && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Local Businesses
              </h1>
              <p className="text-gray-500 mt-2">
                Services around Cosmo City
              </p>
            </div>

            {loading ? (
              <div className="text-center py-10 text-gray-500">
                Loading businesses...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map((biz) => (
                  <BusinessCard key={biz.id} business={biz} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== EVENTS (NEW) ===== */}
        {view === "events" && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Community Events
              </h1>
              <p className="text-gray-500 mt-2">
                What’s happening around Cosmo City
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <CalendarDays size={18} />
                    <span className="text-sm font-medium">{event.date}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900">
                    {event.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {event.location}
                  </p>

                  <p className="text-sm text-gray-600 mt-3">
                    {event.description}
                  </p>

                  <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                    Interested
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <Footer />

      {/* MOBILE BOTTOM NAV */}
      <MobileTabs view={view} setView={setView} />
    </main>
  );
}