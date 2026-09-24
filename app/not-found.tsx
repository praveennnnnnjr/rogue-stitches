import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h2 className="text-4xl font-extrabold mb-2">404</h2>
      <p className="text-gray-400 mb-6">This page could not be found.</p>
      <Link
        href="/"
        className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition"
      >
        Return Home
      </Link>
    </div>
  );
}