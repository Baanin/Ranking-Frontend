export default function Footer() {
  return (
    <footer className="mt-16 bg-[#0a0a0a] border-t border-zinc-800">
      <div className="h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60" />
      <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-3">
        <p className="text-xs text-zinc-600 font-condensed uppercase tracking-widest">
          &copy; {new Date().getFullYear()} GamersGarden Rankings
        </p>
        <p className="font-fighting text-sm tracking-[0.3em] text-zinc-700">
          Ready <span className="text-red-700">·</span> Fight <span className="text-red-700">·</span>{' '}
          <span className="text-red-500">Rank</span>
        </p>
      </div>
    </footer>
  );
}
