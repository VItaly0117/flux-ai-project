export default function PrivacyPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-100 mb-3">Legal</h1>
        <p className="text-zinc-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="rounded-2xl backdrop-blur-2xl bg-blue-500/5 border border-white/10 shadow-lg shadow-blue-500/10 p-6 sm:p-8 space-y-8 text-zinc-300">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">Terms of Service</h2>
            <p className="text-zinc-300">
              By accessing or using FLUX, you agree to these Terms of Service. If you do not agree, do not use the
              application.
            </p>
            <p className="text-zinc-300">
              The service is provided on an “as is” basis. We may update or discontinue features at any time.
            </p>
            <p className="text-zinc-300">
              You are responsible for any content you submit, including uploaded chat logs and analysis results. Do not
              use the service for unlawful, harmful, or abusive activities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-zinc-100">Privacy Policy</h2>
            <p className="text-zinc-300">
              Your data is processed securely. We aim to collect the minimum required to operate FLUX.
            </p>
            <p className="text-zinc-300">
              We do NOT store your chat logs permanently. Analysis happens in real-time to generate your report.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-semibold text-zinc-100">What we collect</h3>
            <p className="text-zinc-300">
              Account information (such as email) is managed via Supabase authentication. We may store profile metadata
              (such as a display name) in our database.
            </p>
            <p className="text-zinc-300">
              Analysis reports and history are intended to be private to your account. Access to protected pages requires
              an authenticated session.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-semibold text-zinc-100">Cookies</h3>
            <p className="text-zinc-300">
              We use cookies primarily for authentication and session persistence. These cookies are required for the
              app to function.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-semibold text-zinc-100">Data sharing</h3>
            <p className="text-zinc-300">
              We do not sell your personal data. We may share data with service providers strictly as necessary to run
              the application (for example, Supabase for authentication).
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-semibold text-zinc-100">Contact</h3>
            <p className="text-zinc-300">
              If you have questions about these terms or your data, contact the project owner.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
