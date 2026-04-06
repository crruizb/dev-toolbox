import type { TranslationKey } from "../../i18n";
import { PairRow } from "./PairRow";
import { usePairs } from "./usePairs";

function daysBetween(a: string, b: string): number | null {
  if (!a || !b) return null;
  const diff = Math.abs(new Date(b).getTime() - new Date(a).getTime());
  return Math.floor(diff / 86_400_000);
}

interface Props {
  t: (key: TranslationKey) => string;
}

export function DateDiff({ t }: Props) {
  const { pairs, addPair, removePair, updatePair } = usePairs();

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
