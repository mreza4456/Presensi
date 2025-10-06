"use client";

import { useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const router = useRouter();

  const changeLang = (lang: string) => {
    // set cookie manual
    document.cookie = `lang=${lang}; path=/; max-age=31536000`; // 1 tahun
    router.refresh(); // reload agar server component ambil lang baru
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => changeLang("en")}
        className="px-2 py-1 border rounded"
      >
        English
      </button>
      <button
        onClick={() => changeLang("id")}
        className="px-2 py-1 border rounded"
      >
        Bahasa
      </button>
    </div>
  );
}
