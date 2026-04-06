import { useEffect, useState } from "react";
import { useLocale } from "./i18n";
import { DateDiff } from "./features/date-diff/DateDiff";
import { UuidGenerator } from "./features/uuid/UuidGenerator";
import { CronExplainer } from "./features/cron/CronExplainer";

// ─── Dark mode ────────────────────────────────────────────────────────────────

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

// ─── Active tool ──────────────────────────────────────────────────────────────

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

// ─── Icons ────────────────────────────────────────────────────────────────────

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors flex flex-col sm:flex-row">

      {/* ── Sidebar (desktop) / Top bar (mobile) ─────────────────────────── */}
      <aside className="
        sm:w-44 sm:min-h-screen sm:flex-col sm:border-r sm:border-b-0
        flex flex-row sm:flex
        border-b border-gray-200 dark:border-gray-800
        bg-white dark:bg-gray-900
        shrink-0
      ">
        {/* App title — hidden on mobile, shown on desktop */}
        <div className="hidden sm:flex items-center px-4 py-5 border-b border-gray-200 dark:border-gray-800">
          <span className="font-bold text-base tracking-tight">{t("appTitle")}</span>
        </div>

        {/* Nav items */}
        <nav className="flex sm:flex-col flex-1 overflow-x-auto sm:overflow-x-visible sm:py-2">
          {tools.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              className={`
                cursor-pointer shrink-0 text-left px-4 py-2.5 text-sm font-medium transition-colors
                sm:w-full sm:rounded-none
                ${tool === id
                  ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-b-2 sm:border-b-0 sm:border-l-2 border-indigo-500"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-b-2 sm:border-b-0 sm:border-l-2 border-transparent"
                }
              `}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Toggles — bottom of sidebar on desktop, right side on mobile */}
        <div className="flex sm:flex-col items-center sm:items-stretch gap-2 px-3 py-2 sm:py-4 sm:border-t border-gray-200 dark:border-gray-800 ml-auto sm:ml-0">
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            aria-label="Switch language"
            className="cursor-pointer px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-semibold sm:text-center"
          >
            {lang === "en" ? "ES" : "EN"}
          </button>
          <button
            onClick={toggle}
            aria-label={t("toggleDark")}
            className="cursor-pointer p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
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
