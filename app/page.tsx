import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="h-14 bg-indigo-700 flex items-center px-6 shadow-md">
        <img src="/thrive-logo.jpg" alt="Thrive Creative" className="h-8 w-8 rounded object-cover" />
        <h1 className="text-white font-bold text-lg tracking-tight ml-3">Thrive Creative</h1>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <img
            src="/thrive-logo.jpg"
            alt="Thrive Creative"
            className="h-20 w-20 rounded-xl object-cover mx-auto mb-6 shadow-lg"
          />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Customer Notes CRM</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Manage your customers, track notes, and organize support tickets — all in one place.
          </p>
          <Link
            href="/crm"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition-colors"
          >
            Open CRM
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-gray-400">
        Thrive Creative &mdash; Developer Exercise
      </footer>
    </div>
  );
}
