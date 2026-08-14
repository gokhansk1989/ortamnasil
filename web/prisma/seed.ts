import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface RawDorm {
  id: string;
  name: string;
  city: string;
  district: string;
  gender: string;
  type: string;
  capacity: number;
  capacityLabel: string;
}

function mapGender(g: string): "MALE" | "FEMALE" | "MIXED" {
  if (g === "Kız") return "FEMALE";
  if (g === "Erkek") return "MALE";
  return "MIXED";
}

function mapType(t: string): "KYK" | "PRIVATE" | "APART" {
  if (t === "KYK") return "KYK";
  return "PRIVATE";
}

async function main() {
  const dataPath = path.join(__dirname, "..", "data", "dorms.json");
  const raw: RawDorm[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  console.log(`🏠 ${raw.length} yurt bulundu, seed başlıyor...`);

  const systemUser = await prisma.user.upsert({
    where: { nick: "sistem" },
    update: {},
    create: { nick: "sistem", isAdult: true },
  });

  const badges = [
    { slug: "kurdele-kesen", label: "KurdeleKesen", emoji: "🎀" },
    { slug: "guvenilir-muhbir", label: "Güvenilir Muhbir", emoji: "🕵️" },
    { slug: "usta-anketer", label: "Usta Anketör", emoji: "📊" },
  ];

  for (const b of badges) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
  }
  console.log(`🏅 ${badges.length} rozet oluşturuldu`);

  let created = 0;
  let skipped = 0;
  const batchSize = 100;

  for (let i = 0; i < raw.length; i += batchSize) {
    const batch = raw.slice(i, i + batchSize);
    const ops = batch.map((d) =>
      prisma.dorm.upsert({
        where: { id: d.id },
        update: {},
        create: {
          id: d.id,
          name: d.name,
          city: d.city,
          district: d.district || null,
          gender: mapGender(d.gender),
          type: mapType(d.type),
          blurb: d.capacityLabel && d.capacityLabel !== "—" ? `Kapasite: ${d.capacityLabel}` : null,
          creatorId: systemUser.id,
        },
      }),
    );
    const results = await prisma.$transaction(ops);
    created += results.length;
    process.stdout.write(`\r  ${created}/${raw.length} yurt işlendi...`);
  }

  console.log(`\n✅ Seed tamamlandı: ${raw.length} yurt, ${badges.length} rozet`);
}

main()
  .catch((e) => {
    console.error("Seed hatası:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
