export default function SavedPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Saved Scenarios</h1>
        <p className="text-zinc-500 mb-8">Your saved rizz and conversation starters.</p>
        <div className="rounded-2xl backdrop-blur-xl bg-white/[0.07] border border-white/10 p-12 text-center text-zinc-500">
          No saved scenarios yet. Generate some rizz and save your favorites!
        </div>
      </div>
    </div>
  );
}
