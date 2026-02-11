export default function Loading() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Profile</h1>
        <p className="text-zinc-500 mb-8">Manage your FLUX account.</p>
        <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-6">
          <div className="text-zinc-300">Loading...</div>
        </div>
      </div>
    </div>
  );
}
