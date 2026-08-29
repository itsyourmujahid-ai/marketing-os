"use client";

import { useState, type ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Surfaces
// ---------------------------------------------------------------------------

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass-panel rounded-2xl p-6", className)}>
      {(title || action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h2 className="font-display text-lg font-bold text-white">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm leading-relaxed text-zinc-500">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: IconName;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-white/[0.04] ring-1 ring-white/10">
        <Icon name={icon} className="h-6 w-6 text-zinc-400" />
      </div>
      <p className="font-display text-sm font-semibold text-white">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

type ButtonVariant = "primary" | "ghost" | "subtle" | "danger";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 font-semibold shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-500",
  ghost:
    "bg-white/[0.06] text-zinc-200 ring-1 ring-inset ring-white/10 hover:bg-white/[0.12]",
  subtle: "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]",
  danger:
    "bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-500/20 hover:bg-rose-500/20",
};

export function Button({
  variant = "ghost",
  className,
  children,
  type = "button",
  disabled,
  onClick,
  size = "md",
}: {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2.5 text-sm",
        buttonStyles[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function IconButton({
  icon,
  label,
  onClick,
  variant = "subtle",
  className,
}: {
  icon: IconName;
  label: string;
  onClick?: () => void;
  variant?: "subtle" | "danger";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60",
        variant === "danger"
          ? "text-zinc-500 hover:bg-rose-500/10 hover:text-rose-300"
          : "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200",
        className,
      )}
    >
      <Icon name={icon} className="h-4 w-4" />
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "amber" | "emerald" | "sky" | "rose" | "violet";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/[0.05] text-zinc-400 ring-white/10",
    amber: "bg-amber-500/10 text-amber-300 ring-amber-400/20",
    emerald: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20",
    sky: "bg-sky-500/10 text-sky-300 ring-sky-400/20",
    rose: "bg-rose-500/10 text-rose-300 ring-rose-400/20",
    violet: "bg-violet-500/10 text-violet-300 ring-violet-400/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ label }: { label: string }) {
  const tone: Record<string, "neutral" | "amber" | "emerald" | "sky" | "rose" | "violet"> = {
    Active: "emerald",
    Inactive: "neutral",
    Draft: "amber",
    "In Progress": "amber",
    Completed: "emerald",
    Paused: "rose",
    "Not Started": "neutral",
    Low: "neutral",
    Medium: "sky",
    High: "amber",
    Critical: "rose",
  };
  return <Badge tone={tone[label] ?? "neutral"}>{label}</Badge>;
}

// ---------------------------------------------------------------------------
// Save state feedback
// ---------------------------------------------------------------------------

export type SaveState = "idle" | "saving" | "saved" | "error";

export function SaveFeedback({
  state,
  errorMessage,
}: {
  state: SaveState;
  errorMessage?: string | null;
}) {
  if (state === "idle") return null;
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
        <span className="h-3 w-3 animate-spin rounded-full border border-zinc-500 border-t-transparent" />
        Saving…
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
        <Icon name="check" className="h-3.5 w-3.5" />
        Saved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-rose-300">
      <Icon name="info" className="h-3.5 w-3.5" />
      {errorMessage || "Could not save. Please try again."}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
  optional,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  optional?: boolean;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-zinc-300">
        {label}
        {optional && <span className="text-[11px] font-normal text-zinc-600">optional</span>}
        {error && error.trim().length > 0 && (
          <span className="ml-auto flex items-center gap-1 text-[11px] font-medium text-rose-400">
            <Icon name="info" className="h-3 w-3" />
            {error}
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs leading-relaxed text-zinc-600">{hint}</p>}
    </div>
  );
}

export const inputBase =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-amber-400/40 focus:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40";

export function TextInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  invalid,
  list,
  inputMode,
}: {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  invalid?: boolean;
  list?: string;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
}) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      list={list}
      inputMode={inputMode}
      className={cn(inputBase, invalid && "border-rose-500/50 focus:border-rose-500/50")}
    />
  );
}

export function TextArea({
  id,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(inputBase, "resize-y leading-relaxed")}
    />
  );
}

export function SelectField({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  invalid,
}: {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  invalid?: boolean;
}) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputBase, "appearance-none", invalid && "border-rose-500/50")}
      style={{ backgroundImage: "none" }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function ColorInput({
  id,
  name,
  value,
  onChange,
  placeholder = "#FFFFFF",
  invalid,
}: {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <label
        className="relative grid h-11 w-11 flex-shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]"
        style={
          value && /^#/.test(value)
            ? { backgroundColor: value }
            : { background: "conic-gradient(#f87171, #fbbf24, #4ade80, #38bdf8, #a78bfa, #f87171)" }
        }
        title="Pick a color"
      >
        <input
          type="color"
          value={/^#([0-9a-f]{6})$/i.test(value) ? value : "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label={`Pick ${name ?? "color"}`}
        />
      </label>
      <input
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(inputBase, "font-mono", invalid && "border-rose-500/50")}
        spellCheck={false}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tags input (multi-select keyed lists)
// ---------------------------------------------------------------------------

export function TagsInput({
  id,
  name,
  values,
  onChange,
  placeholder = "Type and press Enter",
  suggestions = [],
  max = 20,
}: {
  id?: string;
  name?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  max?: number;
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    if (values.includes(value)) {
      setDraft("");
      return;
    }
    if (values.length >= max) return;
    onChange([...values, value]);
    setDraft("");
  };

  const remove = (value: string) => onChange(values.filter((v) => v !== value));

  return (
    <div>
      <div
        className={cn(
          inputBase,
          "flex min-h-[46px] flex-wrap items-center gap-1.5 px-2 py-1.5",
        )}
      >
        {values.map((value) => (
          <span
            key={value}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.07] px-2 py-1 text-xs font-medium text-zinc-200"
          >
            {value}
            <button
              type="button"
              onClick={() => remove(value)}
              aria-label={`Remove ${value}`}
              className="text-zinc-500 transition-colors hover:text-rose-300"
            >
              <Icon name="close" className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          name={name}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && values.length > 0) {
              remove(values[values.length - 1]);
            }
          }}
          onBlur={() => add(draft)}
          placeholder={values.length === 0 ? placeholder : ""}
          className="min-w-32 flex-1 bg-transparent py-1 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
        />
      </div>
      {suggestions.length > 0 && values.length < max && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions
            .filter((s) => !values.includes(s))
            .slice(0, 8)
            .map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => add(suggestion)}
                className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-zinc-500 transition-colors hover:border-amber-400/30 hover:text-zinc-200"
              >
                + {suggestion}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toggle chips (multi-select choices, e.g. brand tones)
// ---------------------------------------------------------------------------

export function ChipGroup<T extends string>({
  options,
  selected,
  onChange,
}: {
  options: readonly T[];
  selected: readonly T[];
  onChange: (selected: T[]) => void;
}) {
  const toggle = (option: T) => {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option));
    } else {
      onChange([...selected, option]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            aria-pressed={active}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] font-medium ring-1 ring-inset transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60",
              active
                ? "bg-amber-500/15 text-amber-200 ring-amber-400/30"
                : "bg-white/[0.03] text-zinc-400 ring-white/10 hover:bg-white/[0.06] hover:text-zinc-200",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirm dialog
// ---------------------------------------------------------------------------

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  busy,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="anim-fade-in absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="anim-pop-in glass-panel relative w-full max-w-sm rounded-2xl p-6">
        <h3 className="font-display text-lg font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">{description}</p>
        <div className="mt-6 flex justify-end gap-2.5">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}