export default function UploadContextPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Upload Context</h1>
        <p className="text-zinc-500 mb-8">Add chat history for better AI advice.</p>
        <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-12 text-center text-zinc-500">
          <p className="mb-4">Use the Context Upload zone on the Home page to drop your Telegram export.</p>
          <a href="/" className="text-blue-400 hover:text-cyan-400 transition-colors">Go to Home →</a>
        </div>
      </div>
    </div>
  );
}
