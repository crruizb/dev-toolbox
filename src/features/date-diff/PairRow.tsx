import type { TranslationKey } from "../../i18n";
import type { Pair } from "./usePairs";

interface Props {
  pair: Pair;
  index: number;
  canRemove: boolean;
  onUpdate: (id: string, field: "from" | "to", value: string) => void;
  onRemove: (id: string) => void;
  t: (key: TranslationKey) => string;
}

function daysBetween(a: string, b: string): number | null {
  if (!a || !b) return null;
  const diff = Math.abs(new Date(b).getTime() - new Date(a).getTime());
  return Math.floor(diff / 86_400_000);
}

export function PairRow({
  pair,
  index,
  canRemove,
  onUpdate,
  onRemove,
  t,
}: Props) {
  const days = daysBetween(pair.from, pair.to);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6 shrink-0">
        {index + 1}.
      </span>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 w-full">
        <input
          type="date"
          value={pair.from}
          onChange={(e) => onUpdate(pair.id, "from", e.target.value)}
          className="w-full sm:w-auto flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:[color-scheme:dark]"
        />

        <span className="text-gray-400 dark:text-gray-500 text-sm hidden sm:block">
          →
        </span>

        <input
          type="date"
          value={pair.to}
          onChange={(e) => onUpdate(pair.id, "to", e.target.value)}
          className="w-full sm:w-auto flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:[color-scheme:dark]"
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        <span className="text-sm font-semibold min-w-20 text-right">
          {days !== null ? (
            <span className="text-indigo-600 dark:text-indigo-400">
              {days} {days === 1 ? t("day") : t("days")}
            </span>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">
              {t("noDays")}
            </span>
          )}
        </span>

        {canRemove && (
          <button
            onClick={() => onRemove(pair.id)}
            aria-label={t("removePair")}
            className="cursor-pointer text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors p-1 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
