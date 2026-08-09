"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogIn } from "lucide-react";
import { createReport } from "@/features/reports/services/report.service";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  targetType: "room" | "business" | "gig";
  targetId: number;
  title: string;
  reasonOptions: string[];
}

// Shared by all three listing-detail pages (was three near-identical
// copies) — reporting requires an account (the backend guards this route
// with JwtAuthGuard, deliberately: an anonymous report is unaccountable
// and trivially spammable, e.g. to bury a competitor's listing). Without
// checking login *before* attempting the submit, a logged-out caller used
// to hit the API anyway and get back the raw "jwt malformed" library
// error — this checks up front and offers a login prompt instead.
export default function ReportModal({
  open,
  onClose,
  targetType,
  targetId,
  title,
  reasonOptions,
}: ReportModalProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [reason, setReason] = useState(reasonOptions[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    setIsLoggedIn(!!localStorage.getItem("token"));
    setReason(reasonOptions[0]);
    setError(null);
    setSuccess(false);
    // Re-check only when the modal opens, not on every reasonOptions
    // identity change (a new array literal each render would otherwise
    // reset the form while someone's still filling it in).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  async function submit() {
    setSubmitting(true);
    setError(null);

    try {
      await createReport({ targetType, targetId, reason });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <Card
        variant="modal"
        padding="lg"
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="text-center py-10">
            <p className="text-green-600 font-bold text-lg">
              Report submitted successfully ✅
            </p>
          </div>
        ) : isLoggedIn === false ? (
          <div className="text-center">
            <h2 className="text-lg font-bold">Log in to report this</h2>
            <p className="text-sm text-gray-500 mt-2">
              Reporting needs an account — it keeps reports accountable and
              stops anyone from spamming them anonymously.
            </p>

            <Button
              onClick={() =>
                router.push(`/auth/login?next=${encodeURIComponent(pathname)}`)
              }
              variant="solid"
              tone="violet"
              className="mt-5 w-full"
            >
              <LogIn size={15} />
              Log in
            </Button>
            <button
              onClick={onClose}
              className="w-full mt-3 text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        ) : isLoggedIn === true ? (
          <>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">Tell us what's wrong</p>

            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border p-3 mt-4 rounded-xl"
            >
              {reasonOptions.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>

            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

            <Button
              onClick={submit}
              loading={submitting}
              variant="danger-solid"
              className="w-full mt-4"
            >
              Submit Report
            </Button>

            <button
              onClick={onClose}
              className="w-full mt-3 text-sm text-gray-500"
            >
              Cancel
            </button>
          </>
        ) : null}
      </Card>
    </div>
  );
}
