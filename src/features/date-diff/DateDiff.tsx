import { useEffect, useState } from "react";
import type { TranslationKey } from "../../i18n";
import { PairRow } from "./PairRow";
import type { Pair } from "./usePairs";
import { usePairs } from "./usePairs";

function daysBetween(a: string, b: string): number | null {
  if (!a || !b) return null;
  const diff = Math.abs(new Date(b).getTime() - new Date(a).getTime());
  return Math.floor(diff / 86_400_000);
}

const DATE_PAIR_RE =
  /^(\d{2})[-/](\d{2})[-/](\d{4})\s*-\s*(\d{2})[-/](\d{2})[-/](\d{4})$/;

const BULK_STORAGE_KEY = "date-pairs-bulk";

function isoToDisplay(iso: string): string {
  const [y, mo, d] = iso.split("-");
  return `${d}-${mo}-${y}`;
}

function loadBulkText(): string {
  try {
    const saved = localStorage.getItem(BULK_STORAGE_KEY);
    if (saved !== null) return saved;
    const raw = localStorage.getItem("date-pairs");
    if (raw) {
      const pairs = JSON.parse(raw) as Pair[];
      const lines = pairs
        .filter((p) => p.from && p.to)
        .map((p) => `${isoToDisplay(p.from)} - ${isoToDisplay(p.to)}`);
      return lines.join("\n");
    }
  } catch {
    // ignore
  }
  return "";
}

function parseBulkText(text: string): Pair[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const m = line.match(DATE_PAIR_RE);
      if (!m) return [];
      const [, d1, mo1, y1, d2, mo2, y2] = m;
      return [
        {
          id: crypto.randomUUID(),
          from: `${y1}-${mo1}-${d1}`,
          to: `${y2}-${mo2}-${d2}`,
        },
      ];
    });
}

interface Props {
  t: (key: TranslationKey) => string;
}

export function DateDiff({ t }: Props) {
  const { pairs, addPair, removePair, updatePair, replacePairs } = usePairs();
  const [bulkText, setBulkText] = useState(loadBulkText);
  const [bulkError, setBulkError] = useState(false);

  useEffect(() => {
    localStorage.setItem(BULK_STORAGE_KEY, bulkText);
  }, [bulkText]);

  function handleLoadPairs() {
    const parsed = parseBulkText(bulkText);
    if (parsed.length === 0) {
      setBulkError(true);
      return;
    }
    setBulkError(false);
    replacePairs(parsed);
  }

  const total = pairs.reduce((sum, p) => {
    const d = daysBetween(p.from, p.to);
    return sum + (d ?? 0);
  }, 0);

  const completePairs = pairs.filter((p) => p.from && p.to).length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-6">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Bulk input
        </p>
        <textarea
          value={bulkText}
          onChange={(e) => {
            setBulkText(e.target.value);
            setBulkError(false);
          }}
          rows={4}
          placeholder={"dd-mm-yyyy - dd-mm-yyyy\ndd/mm/yyyy - dd/mm/yyyy"}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 px-3 py-2.5 font-mono placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        {bulkError && (
          <p className="mt-1 text-xs text-red-500">
            No valid date pairs found. Use dd-mm-yyyy - dd-mm-yyyy or dd/mm/yyyy
            - dd/mm/yyyy.
          </p>
        )}
        <button
          onClick={handleLoadPairs}
          className="cursor-pointer mt-2 mb-8 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          Load pairs
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {pairs.map((pair, i) => (
          <PairRow
            key={pair.id}
            pair={pair}
            index={i}
            canRemove={pairs.length > 1}
            onUpdate={updatePair}
            onRemove={removePair}
            t={t}
          />
        ))}
      </div>

      <button
        onClick={addPair}
        className="cursor-pointer mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        {t("addPair")}
      </button>

      {completePairs > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              {t("total")} ({completePairs}{" "}
              {completePairs === 1 ? t("pair") : t("pairs")})
            </span>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {total} {total === 1 ? t("day") : t("days")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
