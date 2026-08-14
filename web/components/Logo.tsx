import Link from "next/link";
import Image from "next/image";

export function Logo({ href = "/", size = "sm" }: { href?: string; size?: "sm" | "lg" }) {
  const dim = size === "lg" ? 48 : 32;
  return (
    <Link href={href} className="flex items-center gap-2.5 text-ink">
      <Image
        src="/logo.png"
        alt="OrtamNasıl?"
        width={dim}
        height={dim}
        className="rounded-full"
      />
      <span className="text-xl font-bold max-md:text-base">
        Ortam<span className="text-primary">Nasıl?</span>
      </span>
    </Link>
  );
}

export function LogoFull() {
  return (
    <Link href="/" className="inline-block">
      <Image
        src="/logo.png"
        alt="OrtamNasıl? — Karar vermeden buraya bak"
        width={220}
        height={220}
        className="rounded-full sticker-shadow"
        priority
      />
    </Link>
  );
}
