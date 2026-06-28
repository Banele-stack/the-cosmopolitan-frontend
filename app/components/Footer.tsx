
export default function Footer() {
  return (
    <footer className="border-t py-10 px-6 text-center text-sm text-gray-500 bg-white slide-up">
      <div className="max-w-4xl mx-auto">
        <p className="font-medium text-gray-700">
          © {new Date().getFullYear()} Made by NovaApps
        </p>
        <p className="mt-1">Find local businesses with confidence.</p>

        <div className="mt-8 rounded-xl border bg-gray-50 p-5 text-left">
          <h3 className="mb-3 font-semibold text-gray-900">
            🛡️ Stay Safe When Using Local Services
          </h3>

          <ul className="list-inside list-disc space-y-2 text-gray-600">
            <li>Read customer reviews before choosing a business.</li>
            <li>Verify business contact details and location before making payments.</li>
            <li>Avoid paying large deposits upfront unless you trust the business.</li>
            <li>Request a written quotation or invoice for services.</li>
            <li>Meet service providers in safe locations when possible.</li>
            <li>Keep proof of payments and conversations.</li>
            <li>Be cautious of prices that seem unusually low or unrealistic.</li>
            <li>Report fake, misleading, or suspicious business listings to help protect the community.</li>
          </ul>

          <p className="mt-4 text-xs text-gray-500">
            This platform helps connect customers with local businesses. While
            we encourage honest and accurate listings, users should verify
            business information and exercise their own judgment before making
            purchases or entering into agreements.
          </p>
        </div>
      </div>
    </footer>
  );
}

