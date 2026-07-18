import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink px-16 py-10 text-[13.5px] max-md:px-5">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between max-md:flex-col max-md:gap-5">
        <div>
          <span className="text-lg font-bold text-white">
            Ortam<span className="text-primary">Nasıl?</span>
          </span>
          <p className="mt-1 text-onDarkMuted">Karar vermeden buraya bak.</p>
        </div>
        <div className="flex gap-6">
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
      <div className="mx-auto mt-6 max-w-[1100px] border-t border-white/10 pt-5 text-center text-faint">
        © 2026 OrtamNasıl? — Tüm ışıklar saklıdır. 💡
      </div>
    </footer>
  );
}
