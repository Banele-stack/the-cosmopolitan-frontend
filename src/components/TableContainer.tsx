export default function TableContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="scrollbar-thin overflow-x-auto">{children}</div>
    </div>
  );
}
