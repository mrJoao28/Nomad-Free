"use client";

import { useSyncExternalStore } from "react";

/**
 * Favoritos locais ao dispositivo/navegador (localStorage). NÃO sincronizam entre
 * dispositivos e não são enviados ao servidor.
 */
const STORAGE_KEY = "nomadfree:favorites:v1";
const EMPTY: readonly string[] = Object.freeze([]);

let cache: readonly string[] | null = null;
const listeners = new Set<() => void>();

export function favoriteId(kind: "destination" | "opportunity", slug: string): string {
  return `${kind}:${slug}`;
}

function read(): readonly string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((v) => typeof v === "string")) return parsed;
  } catch {
    // armazenamento indisponível ou conteúdo corrompido: trate como vazio
  }
  return EMPTY;
}

function getSnapshot(): readonly string[] {
  if (cache === null) cache = read();
  return cache;
}

function getServerSnapshot(): readonly string[] {
  return EMPTY;
}

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      cache = null;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function toggleFavorite(id: string): void {
  const current = getSnapshot();
  const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // sem persistência (ex.: modo privado restrito); o estado vale apenas nesta sessão
  }
  emit();
}

export function useFavorites(): readonly string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
