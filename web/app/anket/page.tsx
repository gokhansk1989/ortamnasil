import { AnketContent } from "./AnketContent";

export default function AnketPage({
  searchParams,
}: {
  searchParams: { dorm?: string; devam?: string };
}) {
  return (
    <AnketContent
      dormParam={searchParams.dorm || ""}
      resume={searchParams.devam === "1"}
    />
  );
}
