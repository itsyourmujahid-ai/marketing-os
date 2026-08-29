"use client";

import { useEffect, useState } from "react";

import type { SaveState } from "./primitives";

/**
 * Shared editing state for a single-object section form:
 * draft / edit-mode / save state with explicit Save + Cancel semantics.
 * No autosave — saving happens only on the Save action.
 */
export function useSectionEditor<T>(value: T, persist: (next: T) => Promise<void>) {
  const [draft, setDraft] = useState<T>(value);
  const [editing, setEditing] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Keep the draft in sync with the persisted value while not editing.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!editing) setDraft(value);
  }, [value, editing]);

  function startEditing() {
    setDraft(value);
    setEditing(true);
    setSaveState("idle");
    setErrorMessage(null);
  }

  function cancelEditing() {
    setDraft(value);
    setEditing(false);
    setSaveState("idle");
    setErrorMessage(null);
  }

  async function save() {
    setSaveState("saving");
    setErrorMessage(null);
    try {
      await persist(draft);
      setEditing(false);
      setSaveState("saved");
      window.setTimeout(() => {
        setSaveState((current) => (current === "saved" ? "idle" : current));
      }, 2600);
    } catch (error) {
      setSaveState("error");
      setErrorMessage(error instanceof Error ? error.message : "Could not save.");
    }
  }

  return {
    draft,
    setDraft,
    editing,
    startEditing,
    cancelEditing,
    save,
    saveState,
    errorMessage,
  };
}