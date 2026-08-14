import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <div className="mx-auto max-w-[600px] px-8 py-24 text-center max-md:px-5">
        <div className="mb-5 text-[72px]">🔦</div>
        <h1 className="mb-3 text-[36px] font-bold tracking-[-1px] text-ink">
          Sayfa bulunamadı
        </h1>
        <p className="mb-8 text-[16px] leading-relaxed text-muted">
          Aradığın sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
          Merak etme, yurtlar hâlâ yerinde.
        </p>
        <div className="flex justify-center gap-3 max-sm:flex-col">
          <Link
            href="/"
            className="gradient-pink rounded-2xl px-7 py-3.5 text-[15px] font-bold text-white shadow-glow transition-transform hover:scale-105"
          >
            Ana sayfaya dön
          </Link>
          <Link
            href="/yurtlar"
            className="rounded-2xl border-2 border-line bg-card px-7 py-3.5 text-[15px] font-semibold text-ink transition-all hover:border-primary/30"
          >
            Yurtları keşfet
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
