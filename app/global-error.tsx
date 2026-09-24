'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-black text-white flex min-h-screen flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-red-500 mb-4">Application Error</h2>
        <p className="text-gray-400 text-sm mb-4">{error?.message || "An unexpected error occurred."}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-white text-black font-bold rounded"
        >
          Try again
        </button>
      </body>
    </html>
  );
}