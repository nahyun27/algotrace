/** AlgoTrace mark: three connected nodes, the path lit up in state colors. */
export default function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="12" fill="var(--primary)" />
      <path d="M11 27 L20 13 L29 25" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
      <circle cx="11" cy="27" r="4.2" fill="#34d399" stroke="white" strokeWidth="2" />
      <circle cx="20" cy="13" r="4.2" fill="#fbbf24" stroke="white" strokeWidth="2" />
      <circle cx="29" cy="25" r="4.2" fill="#60a5fa" stroke="white" strokeWidth="2" />
    </svg>
  );
}
