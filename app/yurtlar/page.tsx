import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { YurtlarExplorer } from "@/components/YurtlarExplorer";

export default function YurtlarPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <YurtlarExplorer initialQuery={searchParams.q ?? ""} />
      <Footer />
    </div>
  );
}
