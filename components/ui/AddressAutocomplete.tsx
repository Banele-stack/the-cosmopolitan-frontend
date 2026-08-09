"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface GeocodeResult {
  label: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  value: string;
  onInputChange: (text: string) => void;
  onSelect: (result: GeocodeResult) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export default function AddressAutocomplete({
  value,
  onInputChange,
  onSelect,
  placeholder = "Start typing an address or suburb...",
  className = "",
  inputClassName = "",
}: AddressAutocompleteProps) {
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searched, setSearched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const runSearch = (text: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 3) {
      setResults([]);
      setLoading(false);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(false);

    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;

      try {
        const res = await fetch(
          `${API_URL}/geocode/search?text=${encodeURIComponent(text)}`
        );
        const data: GeocodeResult[] = res.ok ? await res.json() : [];

        // Ignore stale responses from an earlier keystroke that resolved
        // after a more recent one.
        if (requestId !== requestIdRef.current) return;

        setResults(data);
        setSearched(true);
        setHighlightedIndex(-1);
      } catch {
        if (requestId === requestIdRef.current) {
          setResults([]);
          setSearched(true);
        }
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, 350);
  };

  const handleChange = (text: string) => {
    onInputChange(text);
    setIsOpen(true);
    runSearch(text);
  };

  const handleSelect = (result: GeocodeResult) => {
    const label =
      result.address && result.area
        ? `${result.address}, ${result.area}`
        : result.label;

    onInputChange(label);
    onSelect(result);
    setResults([]);
    setIsOpen(false);
    setSearched(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <MapPin
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 pointer-events-none"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className={
          inputClassName ||
          "w-full h-12 pl-10 pr-9 rounded-xl bg-gray-50 border border-transparent hover:border-violet-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 outline-none transition-all text-sm"
        }
      />

      {loading && (
        <Loader2
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
        />
      )}

      {isOpen && (results.length > 0 || (searched && !loading)) && (
        <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
          {results.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto py-1">
              {results.map((result, index) => (
                <li key={`${result.lat}-${result.lng}-${index}`}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex w-full items-start gap-2 px-3.5 py-2.5 text-left text-sm transition-colors ${
                      index === highlightedIndex
                        ? "bg-violet-50 text-violet-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
                    <span className="line-clamp-2">{result.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3.5 py-3 text-sm text-gray-400">
              No matches — try a different search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
