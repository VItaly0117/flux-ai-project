export default function HistoryPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">History</h1>
        <p className="text-zinc-500 mb-8">Your past generations and conversations.</p>
        <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-12 text-center text-zinc-500">
          No history yet. Start generating responses on the Home page!
        </div>
      </div>
    </div>
  );
}
