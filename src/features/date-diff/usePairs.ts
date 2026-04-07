import { useEffect, useState } from "react";

export interface Pair {
  id: string;
  from: string;
  to: string;
}

const STORAGE_KEY = "date-pairs";

function loadPairs(): Pair[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Pair[];
  } catch {
    console.error("Failed to load pairs from localStorage");
  }
  return [{ id: crypto.randomUUID(), from: "", to: "" }];
}

export function usePairs() {
  const [pairs, setPairs] = useState<Pair[]>(loadPairs);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pairs));
  }, [pairs]);

  function addPair() {
    setPairs((prev) => [
      ...prev,
      { id: crypto.randomUUID(), from: "", to: "" },
    ]);
  }

  function removePair(id: string) {
    setPairs((prev) =>
      prev.length === 1 ? prev : prev.filter((p) => p.id !== id),
    );
  }

  function updatePair(id: string, field: "from" | "to", value: string) {
    setPairs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  }

  function replacePairs(newPairs: Pair[]) {
    setPairs(newPairs);
  }

  return { pairs, addPair, removePair, updatePair, replacePairs };
}
