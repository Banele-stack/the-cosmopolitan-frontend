"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginationMeta } from "@/types/pagination";

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  pagination,
  onPageChange,
}: PaginationProps) {
  const { page, totalPages, hasNext, hasPrevious } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  ).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        type="button"
        disabled={!hasPrevious}
        onClick={() => onPageChange(page - 1)}
        className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((p, idx) => {
          const prev = pageNumbers[idx - 1];
          const showEllipsis = prev != null && p - prev > 1;

          return (
            <div key={p} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="px-1 text-gray-400">…</span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={`h-9 min-w-9 rounded-full px-3 text-sm font-medium transition-all ${
                  p === page
                    ? "bg-violet-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!hasNext}
        onClick={() => onPageChange(page + 1)}
        className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
