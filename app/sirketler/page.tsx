import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SirketlerExplorer } from "@/components/SirketlerExplorer";

export default function SirketlerPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <SirketlerExplorer initialQuery={searchParams.q ?? ""} />
      <Footer />
    </div>
  );
}
