import Link from "next/link";
import { Logo } from "./Logo";

export function Header({ nick = "SinirliPenguen42" }: { nick?: string }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper/90 px-16 py-4 backdrop-blur-md max-md:px-5">
      <Logo />
      <nav className="flex items-center gap-6 text-[15px] text-body max-md:gap-3">
        <Link href="/yurtlar" className="text-body hover:text-primary max-md:hidden">
          Yurtlar
        </Link>
        <Link href="/#nasil" className="text-body hover:text-primary max-md:hidden">
          Nasıl?
        </Link>
        <Link
          href="/profil"
          className="rounded-pill border border-line bg-surface px-3.5 py-1.5 font-mono text-[13px] text-muted hover:border-primary/30 hover:bg-surface"
        >
          🥸 {nick}
        </Link>
        <Link
          href="/anket"
          className="gradient-pink rounded-pill px-6 py-2.5 font-semibold text-white shadow-glow transition-transform hover:scale-105"
        >
          Yorum yaz
        </Link>
      </nav>
    </header>
  );
}
