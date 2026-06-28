import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">

        <div className="flex items-center gap-3">
          <Image
            src="/CosmoBusinesses.png"
            alt="Cosmo"
            width={110}
            height={110}
            className="rounded-md"
          />
        </div>

      </div>
    </nav>
  );
}