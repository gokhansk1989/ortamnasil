// İçerik denetimi.
//
// Her yorum artık yönetici onayından geçtiği için otomatik filtre yalnızca
// tartışmasız ihlalleri reddeder (küfür, kimlik/iletişim bilgisi, HTML).
// Şüpheli ama meşru olabilecek içerik reddedilmez — `flagText` ile
// işaretlenip moderasyon kuyruğunda insana gösterilir.

const PROFANITY = [
  "amk", "aq", "amına", "amina", "ananı", "anani", "orospu", "piç", "pic",
  "sikeyim", "sikerim", "siktir", "yarrak", "göt", "got",
  "pezevenk", "ibne", "gavat", "kahpe", "şerefsiz", "serefsiz",
  "oç", "oc", "mk", "mq", "s2m", "s2k", "skim", "skm",
];

// Kelime sınırı şart: sınırsız arama "çocuk" içinde "oc", "imkan" içinde "mk"
// yakalıyordu. JS'in \b sınırı ASCII olduğu için Unicode lookaround kullanılır.
const PROFANITY_RE = new RegExp(
  `(?<![\\p{L}\\p{N}])(${PROFANITY.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![\\p{L}\\p{N}])`,
  "iu",
);

const TC_KIMLIK_RE = /\b\d{11}\b/;
const PHONE_RE = /\b0?\d{3}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\b/;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

const NAME_PREFIXES = [
  "müdür", "mudur", "müdire", "hoca", "öğretmen", "ogretmen",
  "memur", "görevli", "gorevli", "abla", "abi",
];

// "müdür Ahmet" gibi personel ifşası — açık niyet, doğrudan reddedilir.
const NAME_PATTERN_RE = new RegExp(
  `(${NAME_PREFIXES.join("|")})\\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]{2,}`,
  "i",
);

// Yaygın Türkçe ilk isimler. "Ahmet Yılmaz" ile "Ege Üniversitesi" ayrımı için;
// eskiden ardışık iki büyük harfli kelime kişi ismi sayılıyor ve meşru
// yorumların yarısından fazlası reddediliyordu.
const FIRST_NAMES = [
  "ahmet", "mehmet", "mustafa", "ali", "hüseyin", "huseyin", "hasan", "ibrahim", "İbrahim",
  "osman", "yusuf", "murat", "ömer", "omer", "ramazan", "halil", "süleyman", "suleyman",
  "abdullah", "emre", "burak", "kemal", "yasin", "fatih", "eren", "kaan", "mert",
  "can", "cem", "deniz", "ege", "arda", "berk", "onur", "serkan", "tolga", "volkan",
  "engin", "erhan", "ferhat", "gökhan", "gokhan", "hakan", "ilker", "kadir", "levent",
  "necati", "okan", "polat", "rıza", "riza", "sinan", "tuncay", "ufuk", "vedat", "yavuz",
  "zeki", "adem", "bahadır", "bahadir", "caner", "davut", "ekrem", "furkan", "gürkan",
  "gurkan", "hamza", "işıl", "isil", "kürşat", "kursat", "muhammed", "nuri", "orhan",
  "recep", "salih", "taner", "umut", "veli", "yakup", "zafer", "alper", "batuhan",
  "fatma", "ayşe", "ayse", "emine", "hatice", "zeynep", "elif", "meryem", "şerife",
  "serife", "zehra", "sultan", "hanife", "merve", "büşra", "busra", "esra", "havva",
  "aslı", "asli", "aylin", "banu", "burcu", "ceren", "damla", "dilek", "ebru", "eda",
  "figen", "gamze", "gizem", "gül", "gul", "hande", "irem", "kübra", "kubra", "leyla",
  "melek", "melis", "nazlı", "nazli", "nur", "özge", "ozge", "pınar", "pinar", "rabia",
  "seda", "selin", "sevgi", "sibel", "tuğba", "tugba", "yasemin", "yağmur", "yagmur",
  "aleyna", "beyza", "cansu", "derya", "duygu", "ece", "eylül", "eylul", "feride",
  "gonca", "hilal", "ilknur", "kader", "lale", "mine", "nesrin", "oya", "pelin",
  "reyhan", "sena", "şeyma", "seyma", "tuba", "ülkü", "ulku", "vildan", "yeliz",
];

const FIRST_NAME_SET = new Set(FIRST_NAMES.map((n) => n.toLocaleLowerCase("tr")));

// <yaygın ilk isim> + <büyük harfle başlayan kelime> → kişi ismi şüphesi.
const CAPITALIZED_PAIR_RE = /([A-ZÇĞİÖŞÜ][a-zçğıöşü]{2,})\s+([A-ZÇĞİÖŞÜ][a-zçğıöşü]{2,})/gu;

export interface ModerationResult {
  ok: boolean;
  reason?: string;
}

export type FlagCode = "POSSIBLE_NAME";

export interface ModerationFlag {
  code: FlagCode;
  label: string;
  detail: string;
}

const HTML_TAG_RE = /<\/?[a-z][\s\S]*?>/i;

/** Kesin ihlaller — içerik kaydedilmez. */
export function moderateText(text: string): ModerationResult {
  if (HTML_TAG_RE.test(text)) {
    return { ok: false, reason: "HTML etiketi kullanılamaz." };
  }

  if (PROFANITY_RE.test(text)) {
    return { ok: false, reason: "Küfür veya hakaret içeriyor." };
  }

  if (TC_KIMLIK_RE.test(text)) {
    return { ok: false, reason: "TC kimlik numarası paylaşılamaz." };
  }

  if (PHONE_RE.test(text)) {
    return { ok: false, reason: "Telefon numarası paylaşılamaz." };
  }

  if (EMAIL_RE.test(text)) {
    return { ok: false, reason: "E-posta adresi paylaşılamaz." };
  }

  if (NAME_PATTERN_RE.test(text)) {
    return { ok: false, reason: "Personel ismi paylaşılamaz — unvan + ad kalıbı algılandı." };
  }

  return { ok: true };
}

/** Şüpheli ama reddedilmeyen içerik — moderasyon kuyruğunda gösterilir. */
export function flagText(text: string): ModerationFlag[] {
  const flags: ModerationFlag[] = [];

  for (const match of text.matchAll(CAPITALIZED_PAIR_RE)) {
    if (FIRST_NAME_SET.has(match[1].toLocaleLowerCase("tr"))) {
      flags.push({
        code: "POSSIBLE_NAME",
        label: "İSİM ŞÜPHESİ",
        detail: match[0],
      });
      break;
    }
  }

  return flags;
}
