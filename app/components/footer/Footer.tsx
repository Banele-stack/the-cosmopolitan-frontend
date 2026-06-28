export default function Footer() {
  return (
    <footer className="border-t py-12 px-6 text-sm text-gray-500 bg-white">
      <div className="max-w-5xl mx-auto">

        {/* BRAND */}
        <div className="text-center">
          <p className="font-semibold text-gray-800">
            © {new Date().getFullYear()} Made by NovaApps
          </p>
          <p className="mt-1 text-gray-500">
            Rooms • Businesses • Events in one place
          </p>
        </div>

        {/* SAFETY GRID */}
        <div className="mt-10 grid md:grid-cols-3 gap-6">

          {/* ROOMS SAFETY */}
          <div className="bg-gray-50 border rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">
              🏠 Renting Safety
            </h3>
            <ul className="space-y-2 list-disc list-inside text-gray-600">
              <li>View the room in person before paying.</li>
              <li>Never pay deposits without verification.</li>
              <li>Confirm landlord identity and address.</li>
              <li>Request a written agreement.</li>
            </ul>
          </div>

          {/* BUSINESSES SAFETY */}
          <div className="bg-gray-50 border rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">
              🏪 Business Safety
            </h3>
            <ul className="space-y-2 list-disc list-inside text-gray-600">
              <li>Verify business legitimacy before payments.</li>
              <li>Prefer cashless or traceable transactions.</li>
              <li>Check reviews and reputation if available.</li>
              <li>Avoid unverified service providers.</li>
            </ul>
          </div>

          {/* EVENTS SAFETY */}
          <div className="bg-gray-50 border rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">
              🎉 Events Safety
            </h3>
            <ul className="space-y-2 list-disc list-inside text-gray-600">
              <li>Confirm event location before attending.</li>
              <li>Be cautious of paid events without proof.</li>
              <li>Meet friends in public, well-lit areas.</li>
              <li>Report suspicious or unsafe events.</li>
            </ul>
          </div>
        </div>

        {/* DISCLAIMER */}
        <div className="mt-10 text-center">
          <p className="text-xs text-gray-500 max-w-3xl mx-auto">
            This platform provides listings for rooms, businesses, and events.
            We do not guarantee the accuracy or authenticity of all listings.
            Users are responsible for verifying information before making decisions
            or entering agreements.
          </p>
        </div>

      </div>
    </footer>
  );
}