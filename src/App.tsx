import { useEffect, useState } from "react";
import { useLocale } from "./i18n";
import { DateDiff } from "./features/date-diff/DateDiff";
import { UuidGenerator } from "./features/uuid/UuidGenerator";
import { CronExplainer } from "./features/cron/CronExplainer";

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}

type ToolId = "date-diff" | "uuid" | "cron";

function useActiveTool() {
  const [tool, setTool] = useState<ToolId>(() => {
    const saved = localStorage.getItem("active-tool");
    if (saved === "date-diff" || saved === "uuid" || saved === "cron")
      return saved;
    return "date-diff";
  });

  useEffect(() => {
    localStorage.setItem("active-tool", tool);
  }, [tool]);

  return { tool, setTool };
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  );
}

export default function App() {
  const { dark, toggle } = useDarkMode();
  const { lang, setLang, t } = useLocale();
  const { tool, setTool } = useActiveTool();

  const tools: { id: ToolId; label: string }[] = [
    { id: "date-diff", label: t("navDateDiff") },
    { id: "uuid",      label: t("navUuid") },
    { id: "cron",      label: t("navCron") },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors flex flex-col">

      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        {/* Single row on desktop, two rows on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:h-12 sm:gap-4 sm:px-5">

          {/* Row 1 (mobile) / left section (desktop): title + toggles */}
          <div className="flex items-center justify-between px-4 py-2.5 sm:p-0 sm:contents">
            <span className="font-semibold text-sm tracking-tight text-gray-800 dark:text-gray-200 sm:shrink-0">
              {t("appTitle")}
            </span>

            {/* Toggles — shown in row 1 on mobile, pushed right on desktop */}
            <div className="flex items-center gap-1.5 sm:order-last sm:ml-auto">
              <button
                onClick={() => setLang(lang === "en" ? "es" : "en")}
                aria-label="Switch language"
                className="cursor-pointer px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-semibold"
              >
                {lang === "en" ? "ES" : "EN"}
              </button>
              <button
                onClick={toggle}
                aria-label={t("toggleDark")}
                className="cursor-pointer p-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                {dark ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>

          {/* Row 2 (mobile) / center (desktop): nav tabs */}
          <nav className="
            flex border-t border-gray-100 dark:border-gray-800
            sm:border-t-0 sm:gap-1 sm:flex-1
          ">
            {tools.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTool(id)}
                className={`
                  cursor-pointer flex-1 sm:flex-none px-3 py-2 sm:py-1 text-sm font-medium transition-colors sm:rounded-md
                  ${tool === id
                    ? "bg-indigo-600 text-white sm:bg-indigo-600"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                `}
              >
                {label}
              </button>
            ))}
          </nav>

        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto px-6 py-10">
          {tool === "date-diff" && <DateDiff t={t} />}
          {tool === "uuid"      && <UuidGenerator t={t} />}
          {tool === "cron"      && <CronExplainer t={t} lang={lang} />}
        </div>
      </main>

    </div>
  );
}
