"use client";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl animate-blob-float" />
      <div
        className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-blob-float"
        style={{ animationDelay: "-5s", animationDuration: "18s" }}
      />
      <div
        className="absolute -bottom-40 right-1/3 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl animate-blob-float"
        style={{ animationDelay: "-8s", animationDuration: "12s" }}
      />
    </div>
  );
}
