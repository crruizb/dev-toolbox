import { useState } from "react";
import type { TranslationKey } from "../../i18n";

interface Props {
  t: (key: TranslationKey) => string;
}

const COUNTS = [1, 50, 100, 500, 1000] as const;
type Count = (typeof COUNTS)[number];

export function UuidGenerator({ t }: Props) {
  const [count, setCount] = useState<Count>(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  function generate() {
    setUuids(Array.from({ length: count }, () => crypto.randomUUID()));
    setCopiedIndex(null);
    setCopiedAll(false);
  }

  function copyOne(uuid: string, index: number) {
    navigator.clipboard.writeText(uuid);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  function copyAll() {
    navigator.clipboard.writeText(uuids.join("\n"));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">UUID</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {t("uuidSubtitle")}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {t("uuidCount")}
        </span>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {COUNTS.map((c) => (
            <button
              key={c}
              onClick={() => setCount(c)}
              className={`cursor-pointer px-3 py-1.5 text-sm font-medium transition-colors ${
                count === c
                  ? "bg-indigo-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          onClick={generate}
          className="cursor-pointer px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          {t("uuidGenerate")}
        </button>
      </div>

      {/* UUID list */}
      {uuids.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">
          {t("uuidEmpty")}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {uuids.map((uuid, i) => (
            <div
              key={uuid}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <span className="flex-1 font-mono text-sm text-gray-800 dark:text-gray-200 break-all">
                {uuid}
              </span>
              <button
                onClick={() => copyOne(uuid, i)}
                className="cursor-pointer shrink-0 text-xs px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-w-14 text-center"
              >
                {copiedIndex === i ? t("uuidCopied") : t("uuidCopy")}
              </button>
            </div>
          ))}

          <button
            onClick={copyAll}
            className="cursor-pointer mt-2 w-full py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {copiedAll ? t("uuidCopied") : t("uuidCopyAll")}
          </button>
        </div>
      )}
    </div>
  );
}
