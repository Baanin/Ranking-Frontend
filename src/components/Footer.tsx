export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-8 mt-16">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} VSRanking. Tous droits réservés.</p>
        <p className="uppercase tracking-widest text-xs">
          Ready · Fight · <span className="text-red-500">Rank</span>
        </p>
      </div>
    </footer>
  );
}
