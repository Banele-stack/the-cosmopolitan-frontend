import { Home, Building2, CalendarDays } from "lucide-react";

type ViewMode = "rooms" | "businesses" | "events";

export default function MobileTabs({
  view,
  setView,
}: {
  view: ViewMode;
  setView: (v: ViewMode) => void;
}) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-3">
      <div className="bg-white/95 backdrop-blur-lg border border-gray-200 shadow-xl rounded-2xl flex justify-around py-2">
        
        {/* Rooms */}
        <button
          onClick={() => setView("rooms")}
          className={`flex flex-col items-center justify-center w-full py-2 transition active:scale-95 ${
            view === "rooms" ? "text-blue-600" : "text-gray-400"
          }`}
        >
          <Home size={22} className="mb-1 transition" />
          <span className="text-xs font-medium">Rooms</span>

          {view === "rooms" && (
            <div className="w-6 h-1 bg-blue-600 rounded-full mt-1" />
          )}
        </button>

        {/* Businesses */}
        <button
          onClick={() => setView("businesses")}
          className={`flex flex-col items-center justify-center w-full py-2 transition active:scale-95 ${
            view === "businesses" ? "text-blue-600" : "text-gray-400"
          }`}
        >
          <Building2 size={22} className="mb-1 transition" />
          <span className="text-xs font-medium">Businesses</span>

          {view === "businesses" && (
            <div className="w-6 h-1 bg-blue-600 rounded-full mt-1" />
          )}
        </button>

        {/* Events (NEW) */}
        <button
          onClick={() => setView("events")}
          className={`flex flex-col items-center justify-center w-full py-2 transition active:scale-95 ${
            view === "events" ? "text-blue-600" : "text-gray-400"
          }`}
        >
          <CalendarDays size={22} className="mb-1 transition" />
          <span className="text-xs font-medium">Events</span>

          {view === "events" && (
            <div className="w-6 h-1 bg-blue-600 rounded-full mt-1" />
          )}
        </button>

      </div>
    </div>
  );
}