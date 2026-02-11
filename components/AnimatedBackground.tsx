"use client";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div className="absolute inset-0 bg-[#020617]" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 600px at 20% 15%, rgba(59, 130, 246, 0.18), transparent 60%), radial-gradient(800px 520px at 85% 25%, rgba(99, 102, 241, 0.16), transparent 62%), radial-gradient(900px 700px at 55% 85%, rgba(34, 211, 238, 0.10), transparent 65%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(2, 6, 23, 0.4) 0%, rgba(2, 6, 23, 0.95) 70%, #020617 100%)",
        }}
      />
    </div>
  );
}
