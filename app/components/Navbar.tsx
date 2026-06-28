import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b fade-in">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-1">

        {/* LOGO + TEXT */}
        <div className="flex items-center gap-2">
          <Image
            src="/CosmoBusinesses.png"
            alt="CosmoBusiness logo"
            width={120}
            height={120}
            className="rounded-md"
          />
        </div>

      </div>
    </nav>
  );
}