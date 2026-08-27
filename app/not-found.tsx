import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-zinc-400 mb-6">Strona nie została znaleziona.</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors"
      >
        Wróć do aplikacji
      </Link>
    </div>
  );
}
