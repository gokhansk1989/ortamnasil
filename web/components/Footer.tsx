import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink px-16 py-10 text-[13.5px] max-md:px-5">
      <div className="mx-auto flex max-w-[1100px] items-start justify-between max-md:flex-col max-md:gap-8">
        <div>
          <span className="text-lg font-bold text-white">
            Ortam<span className="text-primary">Nasıl?</span>
          </span>
          <p className="mt-1 text-onDarkMuted">Karar vermeden buraya bak.</p>
        </div>
        <div className="flex gap-16 max-md:gap-10">
          <div>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-onDarkMuted">
              Keşfet
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/yurtlar" className="text-onDarkMuted hover:text-primary">
                Yurtlar
              </Link>
              <Link href="/blog" className="text-onDarkMuted hover:text-primary">
                Blog
              </Link>
              <Link href="/sss" className="text-onDarkMuted hover:text-primary">
                SSS
              </Link>
            </div>
          </div>
          <div>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-onDarkMuted">
              Yasal
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/gizlilik" className="text-onDarkMuted hover:text-primary">
                Gizlilik
              </Link>
              <Link href="/kurallar" className="text-onDarkMuted hover:text-primary">
                Kurallar
              </Link>
              <Link href="/iletisim" className="text-onDarkMuted hover:text-primary">
                İletişim
              </Link>
            </div>
          </div>
          <div>
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-onDarkMuted">
              Takip et
            </div>
            <div className="flex flex-col gap-2">
              <a href="https://x.com/ortam_nasil" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-onDarkMuted hover:text-primary">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X (Twitter)
              </a>
              <a href="https://www.instagram.com/ortam_nasil/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-onDarkMuted hover:text-primary">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-6 max-w-[1100px] border-t border-white/10 pt-5 text-center text-faint">
        © 2026 OrtamNasıl? — Tüm ışıklar saklıdır. 💡
      </div>
    </footer>
  );
}
