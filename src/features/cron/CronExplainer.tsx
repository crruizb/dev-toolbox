import { useState } from "react";
import type { Lang, TranslationKey } from "../../i18n";

interface Props {
  t: (key: TranslationKey) => string;
  lang: Lang;
}

// Localized day/month names
const DAYS: Record<Lang, string[]> = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
};

const MONTHS: Record<Lang, string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
};

const EXAMPLES = [
  { expr: "* * * * *",   en: "Every minute",                       es: "Cada minuto" },
  { expr: "0 * * * *",   en: "Every hour",                         es: "Cada hora" },
  { expr: "0 0 * * *",   en: "Every day at midnight",              es: "Cada día a medianoche" },
  { expr: "0 9 * * 1-5", en: "Weekdays at 09:00",                  es: "Días hábiles a las 09:00" },
  { expr: "0 0 1 * *",   en: "First day of every month",           es: "El primer día de cada mes" },
  { expr: "*/15 * * * *",en: "Every 15 minutes",                   es: "Cada 15 minutos" },
  { expr: "0 0 * * 0",   en: "Every Sunday at midnight",           es: "Cada domingo a medianoche" },
  { expr: "30 8 * * 1",  en: "Every Monday at 08:30",              es: "Cada lunes a las 08:30" },
];

// ─── Parser helpers ───────────────────────────────────────────────────────────

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function isInt(s: string) {
  return /^\d+$/.test(s);
}

type FieldType = "minute" | "hour" | "dom" | "month" | "dow";

interface CronCtx {
  lang: Lang;
  t: (key: TranslationKey) => string;
}

function formatValue(value: number, field: FieldType, ctx: CronCtx): string {
  if (field === "month") return MONTHS[ctx.lang][value - 1] ?? String(value);
  if (field === "dow") return DAYS[ctx.lang][value % 7] ?? String(value);
  if (field === "hour") return `${pad(value)}:00`;
  return String(value);
}

/**
 * Parse a single cron field token (may contain commas for lists).
 * Returns a human-readable phrase for that token list.
 */
function parseField(raw: string, field: FieldType, ctx: CronCtx): string | null {
  const { t, lang } = ctx;
  const unitSingular: Record<FieldType, string> = {
    minute: lang === "es" ? "minuto" : "minute",
    hour: lang === "es" ? "hora" : "hour",
    dom: lang === "es" ? "día" : "day",
    month: lang === "es" ? "mes" : "month",
    dow: lang === "es" ? "día de la semana" : "weekday",
  };
  const unitPlural: Record<FieldType, string> = {
    minute: t("cronMinutes"),
    hour: t("cronHours"),
    dom: t("cronDays"),
    month: lang === "es" ? "meses" : "months",
    dow: lang === "es" ? "días de la semana" : "weekdays",
  };

  if (raw === "*") return null; // "every" — handled at sentence level

  // Step: */n
  const stepMatch = raw.match(/^\*\/(\d+)$/);
  if (stepMatch) {
    const n = parseInt(stepMatch[1], 10);
    return `${t("cronEvery")} ${n} ${n === 1 ? unitSingular[field] : unitPlural[field]}`;
  }

  // List of tokens (may be ranges or single values)
  const parts = raw.split(",");
  const phrases = parts.map((part) => {
    // Range: n-m
    const rangeMatch = part.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const a = parseInt(rangeMatch[1], 10);
      const b = parseInt(rangeMatch[2], 10);
      return `${formatValue(a, field, ctx)} ${t("cronThrough")} ${formatValue(b, field, ctx)}`;
    }
    // Step on range: n-m/s
    const stepRangeMatch = part.match(/^(\d+)-(\d+)\/(\d+)$/);
    if (stepRangeMatch) {
      const a = parseInt(stepRangeMatch[1], 10);
      const b = parseInt(stepRangeMatch[2], 10);
      const s = parseInt(stepRangeMatch[3], 10);
      return `${t("cronEvery")} ${s} ${unitPlural[field]} (${formatValue(a, field, ctx)}–${formatValue(b, field, ctx)})`;
    }
    // Single value
    if (isInt(part)) {
      return formatValue(parseInt(part, 10), field, ctx);
    }
    return null;
  });

  if (phrases.some((p) => p === null)) return null;

  // Join list with commas and "and" for last
  if (phrases.length === 1) return phrases[0]!;
  const last = phrases.pop()!;
  return `${phrases.join(", ")} ${t("cronAnd")} ${last}`;
}

function validateField(raw: string, min: number, max: number): boolean {
  if (raw === "*") return true;
  if (/^\*\/\d+$/.test(raw)) return true;
  const parts = raw.split(",");
  for (const part of parts) {
    if (/^\d+-\d+(\/\d+)?$/.test(part)) {
      const [range] = part.split("/");
      const [a, b] = range.split("-").map(Number);
      if (a < min || b > max || a > b) return false;
      continue;
    }
    if (/^\d+$/.test(part)) {
      const n = parseInt(part, 10);
      if (n < min || n > max) return false;
      continue;
    }
    return false;
  }
  return true;
}

function parseCron(expr: string, ctx: CronCtx): string | null {
  const { t, lang } = ctx;
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return null;

  const [rawMin, rawHour, rawDom, rawMonth, rawDow] = parts;

  // Validate ranges
  if (!validateField(rawMin, 0, 59)) return null;
  if (!validateField(rawHour, 0, 23)) return null;
  if (!validateField(rawDom, 1, 31)) return null;
  if (!validateField(rawMonth, 1, 12)) return null;
  if (!validateField(rawDow, 0, 7)) return null;

  const minPhrase = parseField(rawMin, "minute", ctx);
  const hourPhrase = parseField(rawHour, "hour", ctx);
  const domPhrase = parseField(rawDom, "dom", ctx);
  const monthPhrase = parseField(rawMonth, "month", ctx);
  const dowPhrase = parseField(rawDow, "dow", ctx);

  // ── Build human sentence ───────────────────────────────────────────────────

  // "* * * * *" → "Every minute"
  if (!minPhrase && !hourPhrase && !domPhrase && !monthPhrase && !dowPhrase) {
    return t("cronEveryMinute");
  }

  // Time prefix
  let time = "";
  if (!minPhrase && !hourPhrase) {
    // both wildcards → "every minute"
    time = t("cronEveryMinute");
  } else if (!minPhrase && hourPhrase) {
    // minute is *, hour is specific → e.g. "every minute of 09:00" — unusual, describe literally
    time = `${t("cronEveryMinute")}, ${hourPhrase}`;
  } else if (minPhrase && !hourPhrase) {
    // hour is *, minute is specific → e.g. "every hour at :15"
    if (/^\d+$/.test(rawMin) && rawHour === "*") {
      const m = parseInt(rawMin, 10);
      time = lang === "es" ? `cada hora a las :${pad(m)}` : `every hour at :${pad(m)}`;
    } else {
      time = minPhrase;
    }
  } else {
    // Both specific: build "At HH:MM" when both are single numbers
    if (isInt(rawMin) && isInt(rawHour)) {
      time = `${t("cronAt")} ${pad(parseInt(rawHour, 10))}:${pad(parseInt(rawMin, 10))}`;
    } else {
      // Step or list cases
      if (minPhrase?.startsWith(t("cronEvery")) || minPhrase?.startsWith("cada")) {
        time = minPhrase;
        if (hourPhrase) time += `, ${hourPhrase}`;
      } else {
        time = `${minPhrase ?? ""}${hourPhrase ? `, ${hourPhrase}` : ""}`;
      }
    }
  }

  // Day/weekday qualifier
  const dayParts: string[] = [];
  if (domPhrase) dayParts.push(`${t("cronOn")} ${domPhrase}`);
  if (dowPhrase) dayParts.push(dowPhrase);
  const dayStr = dayParts.join(` ${t("cronAnd")} `);

  // Month qualifier
  const monthStr = monthPhrase ? `${t("cronIn")} ${monthPhrase}` : "";

  return [time, dayStr, monthStr].filter(Boolean).join(", ");
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CronExplainer({ t, lang }: Props) {
  const [expr, setExpr] = useState("");

  const trimmed = expr.trim();
  const ctx: CronCtx = { lang, t };
  const explanation = trimmed ? parseCron(trimmed, ctx) : null;
  const isInvalid = trimmed !== "" && explanation === null;

  const fields = [
    t("cronFieldMin"),
    t("cronFieldHour"),
    t("cronFieldDay"),
    t("cronFieldMonth"),
    t("cronFieldWeekday"),
  ];

  const exprParts = trimmed.split(/\s+/);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Cron</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {t("cronSubtitle")}
        </p>
      </div>

      {/* Input */}
      <input
        type="text"
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        placeholder={t("cronPlaceholder")}
        spellCheck={false}
        className={`w-full font-mono rounded-xl border px-4 py-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition-colors ${
          isInvalid
            ? "border-red-400 dark:border-red-600 focus:ring-red-400"
            : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
        }`}
      />

      {/* Field labels strip */}
      {trimmed && (
        <div className="mt-2 flex gap-1.5 flex-wrap">
          {fields.map((label, i) => (
            <span
              key={label}
              className="inline-flex flex-col items-center text-xs"
            >
              <span
                className={`font-mono px-2 py-0.5 rounded ${
                  exprParts[i]
                    ? exprParts[i] === "*"
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      : "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                }`}
              >
                {exprParts[i] ?? "?"}
              </span>
              <span className="text-gray-400 dark:text-gray-500 mt-0.5">
                {label}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Result */}
      <div className="mt-4 min-h-14">
        {isInvalid ? (
          <p className="text-sm text-red-500 dark:text-red-400">
            {t("cronInvalid")}
          </p>
        ) : explanation ? (
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800">
            <p className="text-base font-medium text-indigo-700 dark:text-indigo-300">
              {explanation}
            </p>
          </div>
        ) : null}
      </div>

      {/* Examples */}
      <div className="mt-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
          {lang === "es" ? "Ejemplos" : "Examples"}
        </p>
        <div className="flex flex-col gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.expr}
              onClick={() => setExpr(ex.expr)}
              className="cursor-pointer flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left group"
            >
              <span className="font-mono text-sm text-indigo-600 dark:text-indigo-400 w-32 shrink-0">
                {ex.expr}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {lang === "es" ? ex.es : ex.en}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
