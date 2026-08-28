"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  X,
  Download,
  Building2,
  Hash,
  CalendarClock,
  Plus,
  Trash2,
  Upload,
  AlertCircle,
  FileX,
} from "lucide-react";
import type { ComplianceDocument, DocumentType } from "@/lib/types";
import { DOCUMENT_TYPES } from "@/lib/types";
import { getDocumentStatus } from "@/lib/status";
import { formatDate, formatDaysRemaining, daysUntil } from "@/lib/utils";
import { documentStatusBadge } from "@/lib/badges";
import Badge from "@/components/Badge";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = "application/pdf,image/jpeg,image/png";

export default function DocumentChecklist({
  contractorId,
  documents,
}: {
  contractorId: string;
  documents: ComplianceDocument[];
}) {
  const router = useRouter();
  const [active, setActive] = useState<ComplianceDocument | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const sorted = [...documents].sort(
    (a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate)
  );

  return (
    <>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
        >
          <Plus size={14} />
          Add Document
        </button>
      </div>

      <div className="scroll-x rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <table className="w-full min-w-[700px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--foreground-muted)]">
              <th className="px-4 py-3 font-medium">Document</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Issued</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Remaining</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-[var(--foreground-muted)]">
                  No documents on file yet.
                </td>
              </tr>
            )}
            {sorted.map((doc) => {
              const days = daysUntil(doc.expiryDate);
              const badge = documentStatusBadge(getDocumentStatus(doc));
              return (
                <tr
                  key={doc.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-muted)]"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--foreground)]">{doc.type}</p>
                    <p className="text-xs text-[var(--foreground-muted)]">Ref. {doc.referenceNumber}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={badge.tone} label={badge.label} icon={badge.icon} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground-muted)]">{formatDate(doc.issueDate)}</td>
                  <td className="px-4 py-3 text-[var(--foreground-muted)]">{formatDate(doc.expiryDate)}</td>
                  <td className="px-4 py-3">
                    <span
                      style={{
                        color:
                          days < 0
                            ? "var(--status-critical-text)"
                            : days <= 30
                            ? "var(--status-warning-text)"
                            : "var(--foreground-muted)",
                      }}
                    >
                      {formatDaysRemaining(days)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setActive(doc)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                    >
                      <FileText size={13} />
                      View Document
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {active && (
        <DocumentDetailModal
          document={active}
          contractorId={contractorId}
          onClose={() => setActive(null)}
          onDeleted={() => {
            setActive(null);
            router.refresh();
          }}
        />
      )}

      {addOpen && (
        <AddDocumentModal
          contractorId={contractorId}
          onClose={() => setAddOpen(false)}
          onAdded={() => {
            setAddOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function DocumentDetailModal({
  document: doc,
  contractorId,
  onClose,
  onDeleted,
}: {
  document: ComplianceDocument;
  contractorId: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileHref = `/api/contractors/${contractorId}/documents/${doc.id}/file`;

  async function handleDelete() {
    if (!confirm(`Remove "${doc.type}" from this contractor's file? This can't be undone.`)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/contractors/${contractorId}/documents/${doc.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Failed to delete document.");
      }
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete document.");
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <FileText size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{doc.type}</p>
              <p className="text-xs text-[var(--foreground-muted)]">
                {doc.fileOriginalName ? doc.fileOriginalName : "No file attached"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <dl className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2">
            <Hash size={14} className="shrink-0 text-[var(--foreground-muted)]" />
            <dt className="text-[var(--foreground-muted)]">Reference</dt>
            <dd className="ml-auto font-medium text-[var(--foreground)]">{doc.referenceNumber}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Building2 size={14} className="shrink-0 text-[var(--foreground-muted)]" />
            <dt className="text-[var(--foreground-muted)]">Issuing body</dt>
            <dd className="ml-auto text-right font-medium text-[var(--foreground)]">{doc.issuingBody}</dd>
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock size={14} className="shrink-0 text-[var(--foreground-muted)]" />
            <dt className="text-[var(--foreground-muted)]">Valid</dt>
            <dd className="ml-auto font-medium text-[var(--foreground)]">
              {formatDate(doc.issueDate)} &ndash; {formatDate(doc.expiryDate)}
            </dd>
          </div>
        </dl>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!doc.fileUrl ? (
          <div className="mt-5 flex items-center justify-between rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] px-4 py-6 text-center">
            <p className="flex w-full items-center justify-center gap-1.5 text-xs text-[var(--foreground-muted)]">
              <FileX size={14} />
              No file was uploaded for this document.
            </p>
          </div>
        ) : (
          <a
            href={fileHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
          >
            <Download size={14} />
            View / Download File
          </a>
        )}

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:hover:bg-red-950"
        >
          <Trash2 size={14} />
          {deleting ? "Removing…" : "Remove document"}
        </button>
      </div>
    </div>
  );
}

function AddDocumentModal({
  contractorId,
  onClose,
  onAdded,
}: {
  contractorId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<DocumentType>(DOCUMENT_TYPES[0]);
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [issuingBody, setIssuingBody] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) {
      setFileName(null);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("File is larger than 10MB.");
      e.target.value = "";
      setFileName(null);
      return;
    }
    setFileName(file.name);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Please attach the certificate file (PDF, JPEG or PNG).");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.set("type", type);
    formData.set("issueDate", issueDate);
    formData.set("expiryDate", expiryDate);
    formData.set("referenceNumber", referenceNumber);
    formData.set("issuingBody", issuingBody);
    formData.set("file", file);

    try {
      const res = await fetch(`/api/contractors/${contractorId}/documents`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = Array.isArray(body.message) ? body.message.join(" ") : body.message;
        throw new Error(message ?? "Failed to upload document.");
      }
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload document.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">Add Compliance Document</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="doc-type" className="mb-1 block text-xs font-medium text-[var(--foreground)]">
              Document type
            </label>
            <select
              id="doc-type"
              value={type}
              onChange={(e) => setType(e.target.value as DocumentType)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="issue-date" className="mb-1 block text-xs font-medium text-[var(--foreground)]">
                Issue date
              </label>
              <input
                id="issue-date"
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label htmlFor="expiry-date" className="mb-1 block text-xs font-medium text-[var(--foreground)]">
                Expiry date
              </label>
              <input
                id="expiry-date"
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="ref-number" className="mb-1 block text-xs font-medium text-[var(--foreground)]">
              Reference number
            </label>
            <input
              id="ref-number"
              type="text"
              required
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <div>
            <label htmlFor="issuing-body" className="mb-1 block text-xs font-medium text-[var(--foreground)]">
              Issuing body
            </label>
            <input
              id="issuing-body"
              type="text"
              required
              value={issuingBody}
              onChange={(e) => setIssuingBody(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <div>
            <span className="mb-1 block text-xs font-medium text-[var(--foreground)]">
              Certificate file (PDF, JPEG or PNG, max 10MB)
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-[var(--border)] px-4 py-4 text-xs text-[var(--foreground-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <Upload size={14} />
              {fileName ?? "Choose a file"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] disabled:opacity-60"
          >
            {submitting ? "Uploading…" : "Add document"}
          </button>
        </div>
      </form>
    </div>
  );
}
