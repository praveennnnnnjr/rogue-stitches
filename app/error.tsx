'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4 text-red-500">Something went wrong!</h2>
      <p className="text-gray-400 mb-6">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-white text-black font-semibold rounded hover:bg-gray-200 transition"
      >
        Try again
      </button>
    </div>
  );
}