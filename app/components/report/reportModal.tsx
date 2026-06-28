"use client";

import { useState } from "react";

export default function ReportModal() {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reason, setReason] = useState("Fake listing");

  function submitReport() {
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setOpen(false);
    }, 1500);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="border border-red-500 text-red-500 px-4 py-2 rounded-xl text-sm w-full"
      >
        Report
      </button>

      {open && (
        <div
          className="
            absolute
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            p-4
          "
        >
          <div
            className="
              w-full
              max-w-md
              max-h-[90vh]
              overflow-y-auto
              bg-white
              rounded-2xl
              p-6
              shadow-2xl
            "
          >
            {success ? (
              <div className="text-center py-10">
                <p className="text-green-600 font-bold text-lg">
                  Report submitted successfully ✅
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold">Report Listing</h2>

                <p className="text-sm text-gray-500 mt-1">
                  Tell us what’s wrong
                </p>

                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border p-3 mt-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-200"
                >
                  <option>Fake listing</option>
                  <option>Scam / fraud</option>
                  <option>Already rented</option>
                  <option>Inappropriate content</option>
                </select>

                <button
                  onClick={submitReport}
                  className="
                    w-full
                    bg-red-600
                    hover:bg-red-700
                    text-white
                    py-3
                    mt-4
                    rounded-xl
                    text-sm
                    font-medium
                  "
                >
                  Submit Report
                </button>

                <button
                  onClick={() => setOpen(false)}
                  className="w-full mt-3 text-sm text-gray-500"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}