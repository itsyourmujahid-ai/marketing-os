"use client";

import { useState } from "react";

import {
  GOAL_PRIORITIES,
  GOAL_STATUSES,
  GOAL_SUGGESTIONS,
  MARKETING_GOAL_SUGGESTIONS,
  OPTIONS,
} from "@/lib/business/options";
import type { BusinessGoal, MarketingGoal } from "@/lib/business/types";
import { validateBusinessGoal, validateMarketingGoal } from "@/lib/business/validation";

import {
  Button,
  ConfirmDialog,
  EmptyState,
  Field,
  IconButton,
  SaveFeedback,
  SectionCard,
  SelectField,
  StatusBadge,
  TagsInput,
  TextArea,
  TextInput,
} from "@/components/business/primitives";
import { useSectionEditor } from "@/components/business/useSectionEditor";

type SaveState = "idle" | "saving" | "saved" | "error";

function newGoal(): BusinessGoal {
  return {
    id: "",
    name: "",
    description: "",
    targetValue: "",
    currentValue: "",
    unit: "",
    deadline: "",
    priority: "Medium",
    status: "Not Started",
  };
}

function createId(prefix: string): string {
  const base =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${base}`;
}

export function GoalsTab({
  businessGoals,
  marketingGoal,
  onSaveBusinessGoals,
  onSaveMarketingGoal,
}: {
  businessGoals: BusinessGoal[];
  marketingGoal: MarketingGoal;
  onSaveBusinessGoals: (next: BusinessGoal[]) => Promise<void>;
  onSaveMarketingGoal: (next: MarketingGoal) => Promise<void>;
}) {
  const marketing = useSectionEditor(marketingGoal, onSaveMarketingGoal);
  const [goalOpen, setGoalOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalErrors, setGoalErrors] = useState<Record<string, string>>({});
  const [goalSave, setGoalSave] = useState<SaveState>("idle");
  const [goalError, setGoalError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [draft, setDraft] = useState<BusinessGoal>(newGoal());

  const mErrors = marketing.editing ? validateMarketingGoal(marketing.draft).errors : {};

  function openNewGoal() {
    setDraft(newGoal());
    setEditingGoalId(null);
    setGoalErrors({});
    setGoalOpen(true);
  }

  function openEditGoal(goal: BusinessGoal) {
    setDraft({ ...goal });
    setEditingGoalId(goal.id);
    setGoalErrors({});
    setGoalOpen(true);
  }

  function closeGoalEditor() {
    setGoalOpen(false);
    setEditingGoalId(null);
    setGoalErrors({});
    setGoalSave("idle");
    setGoalError(null);
  }

  async function persistGoals(items: BusinessGoal[]): Promise<boolean> {
    setGoalSave("saving");
    setGoalError(null);
    try {
      await onSaveBusinessGoals(items);
      setGoalSave("saved");
      window.setTimeout(() => setGoalSave((s) => (s === "saved" ? "idle" : s)), 2600);
      return true;
    } catch (error) {
      setGoalSave("error");
      setGoalError(error instanceof Error ? error.message : "Could not save.");
      return false;
    }
  }

  const update = (key: keyof BusinessGoal, value: string) =>
    setDraft({ ...draft, [key]: value });

  return (
    <div className="space-y-6">
      {/* Business goals */}
      <SectionCard
        title="Business Goals"
        description="What your business wants to achieve — tracked with targets and deadlines."
        action={
          <Button variant="ghost" size="sm" onClick={openNewGoal}>
            + Add goal
          </Button>
        }
      >
        {businessGoals.length === 0 && !goalOpen ? (
          <EmptyState
            icon="target"
            title="No business goals yet"
            description="Add goals like revenue, leads, launches or market entry."
            action={
              <Button variant="primary" size="sm" onClick={openNewGoal}>
                + Add goal
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {businessGoals.map((goal) => (
              <article
                key={goal.id}
                className="group rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.14]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-[15px] font-bold text-white">{goal.name}</h3>
                      <StatusBadge label={goal.priority} />
                      <StatusBadge label={goal.status} />
                    </div>
                    {goal.description && (
                      <p className="mt-1 line-clamp-2 max-w-xl text-sm text-zinc-500">{goal.description}</p>
                    )}
                    <p className="mt-1.5 text-xs text-zinc-600">
                      Current: {formatValue(goal.currentValue, goal.unit)}
                      {" · "}
                      Target: {formatValue(goal.targetValue, goal.unit)}
                      {goal.deadline && <> · Due {goal.deadline}</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconButton icon="pen" label="Edit" onClick={() => openEditGoal(goal)} />
                    <IconButton
                      icon="trash"
                      label="Delete"
                      variant="danger"
                      onClick={() => setPendingDelete(goal.id)}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {goalOpen && (
          <form
            className="anim-rise-in mt-5 space-y-5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5"
            onSubmit={(e) => {
              e.preventDefault();
              const result = validateBusinessGoal(draft);
              setGoalErrors(result.errors);
              if (!result.valid) return;
              const items = editingGoalId
                ? businessGoals.map((g) => (g.id === editingGoalId ? { ...draft, id: editingGoalId } : g))
                : [...businessGoals, { ...draft, id: createId("goal") }];
              void persistGoals(items).then((success) => {
                if (success) closeGoalEditor();
              });
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-white">
                {editingGoalId ? "Edit goal" : "Add goal"}
              </h3>
              <SaveFeedback state={goalSave} errorMessage={goalError} />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Goal name" error={goalErrors.name}>
                <TextInput
                  id="goal-name"
                  value={draft.name}
                  onChange={(v) => update("name", v)}
                  placeholder="e.g. Generate 500 qualified leads"
                  invalid={Boolean(goalErrors.name)}
                  list="goal-suggestions"
                />
                <datalist id="goal-suggestions">
                  {GOAL_SUGGESTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Priority">
                  <SelectField
                    id="goal-priority"
                    value={draft.priority}
                    onChange={(v) => update("priority", v)}
                    options={GOAL_PRIORITIES}
                  />
                </Field>
                <Field label="Status">
                  <SelectField
                    id="goal-status"
                    value={draft.status}
                    onChange={(v) => update("status", v)}
                    options={GOAL_STATUSES}
                  />
                </Field>
              </div>
            </div>

            <Field label="Description" optional>
              <TextArea
                id="goal-description"
                value={draft.description}
                onChange={(v) => update("description", v)}
                placeholder="What does success look like for this goal?"
                rows={2}
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <Field label="Current value" optional error={goalErrors.currentValue}>
                <TextInput
                  id="goal-current"
                  inputMode="decimal"
                  value={draft.currentValue}
                  onChange={(v) => update("currentValue", v)}
                  placeholder="0"
                  invalid={Boolean(goalErrors.currentValue)}
                />
              </Field>
              <Field label="Target value" optional error={goalErrors.targetValue}>
                <TextInput
                  id="goal-target"
                  inputMode="decimal"
                  value={draft.targetValue}
                  onChange={(v) => update("targetValue", v)}
                  placeholder="e.g. 500"
                  invalid={Boolean(goalErrors.targetValue)}
                />
              </Field>
              <Field label="Unit" optional hint="leads, %, USD…">
                <TextInput
                  id="goal-unit"
                  value={draft.unit}
                  onChange={(v) => update("unit", v)}
                  placeholder="leads"
                />
              </Field>
              <Field label="Deadline" optional error={goalErrors.deadline}>
                <TextInput
                  id="goal-deadline"
                  type="date"
                  value={draft.deadline}
                  onChange={(v) => update("deadline", v)}
                  invalid={Boolean(goalErrors.deadline)}
                />
              </Field>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
              <SaveFeedback state={goalSave} errorMessage={goalError} />
              <div className="flex items-center gap-2.5">
                <Button variant="subtle" onClick={closeGoalEditor} disabled={goalSave === "saving"}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={goalSave === "saving"}>
                  {editingGoalId ? "Save changes" : "Add goal"}
                </Button>
              </div>
            </div>
          </form>
        )}

        <ConfirmDialog
          open={pendingDelete !== null}
          title="Delete goal?"
          description="This permanently removes the goal from your workspace."
          busy={goalSave === "saving"}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            const target = pendingDelete;
            if (!target) return;
            setPendingDelete(null);
            if (editingGoalId === target) closeGoalEditor();
            void persistGoals(businessGoals.filter((g) => g.id !== target));
          }}
        />
      </SectionCard>

      {/* Marketing goals */}
      <SectionCard
        title="Marketing Goals"
        description="Conversion-focused targets your marketing team pursues. Leave anything blank — nothing is forced."
        action={
          !marketing.editing ? (
            <Button variant="ghost" size="sm" onClick={marketing.startEditing}>
              {hasMarketingData(marketingGoal) ? "Edit" : "Add marketing goals"}
            </Button>
          ) : undefined
        }
      >
        {!marketing.editing ? (
          hasMarketingData(marketingGoal) ? (
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <GoalView label="Primary marketing goal" value={marketingGoal.primaryGoal} wide />
              <GoalView
                label="Secondary goals"
                value={marketingGoal.secondaryGoals.join(" · ")}
                wide
              />
              <GoalView
                label="Monthly lead target"
                value={marketingGoal.monthlyLeadTarget}
              />
              <GoalView
                label="Monthly revenue target"
                value={marketingGoal.monthlyRevenueTarget}
              />
              <GoalView label="Marketing budget" value={marketingGoal.marketingBudget} />
              <GoalView
                label="Target conversion rate"
                value={marketingGoal.targetConversionRate ? `${marketingGoal.targetConversionRate}%` : ""}
              />
              <GoalView
                label="Preferred channels"
                value={marketingGoal.preferredChannels.join(" · ")}
                wide
              />
            </dl>
          ) : (
            <EmptyState
              icon="zap"
              title="No marketing goals yet"
              description="Set lead/revenue targets, budget and preferred channels to guide every campaign."
            />
          )
        ) : (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (Object.keys(mErrors).length === 0) void marketing.save();
            }}
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Primary marketing goal" optional>
                <TextInput
                  id="m-primary"
                  value={marketing.draft.primaryGoal}
                  onChange={(v) => marketing.setDraft({ ...marketing.draft, primaryGoal: v })}
                  placeholder="e.g. Generate 200 qualified demos per month"
                  list="m-goal-suggestions"
                />
                <datalist id="m-goal-suggestions">
                  {MARKETING_GOAL_SUGGESTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </Field>
              <Field label="Secondary goals" optional>
                <TagsInput
                  id="m-secondary"
                  values={marketing.draft.secondaryGoals}
                  onChange={(values) => marketing.setDraft({ ...marketing.draft, secondaryGoals: values })}
                  placeholder="Type and press Enter"
                />
              </Field>
              <Field label="Monthly lead target" optional error={mErrors.monthlyLeadTarget}>
                <TextInput
                  id="m-leads"
                  inputMode="numeric"
                  value={marketing.draft.monthlyLeadTarget}
                  onChange={(v) => marketing.setDraft({ ...marketing.draft, monthlyLeadTarget: v })}
                  placeholder="e.g. 200"
                  invalid={Boolean(mErrors.monthlyLeadTarget)}
                />
              </Field>
              <Field label="Monthly revenue target" optional error={mErrors.monthlyRevenueTarget}>
                <TextInput
                  id="m-revenue"
                  inputMode="decimal"
                  value={marketing.draft.monthlyRevenueTarget}
                  onChange={(v) => marketing.setDraft({ ...marketing.draft, monthlyRevenueTarget: v })}
                  placeholder="e.g. 50000 (USD)"
                  invalid={Boolean(mErrors.monthlyRevenueTarget)}
                />
              </Field>
              <Field label="Marketing budget" optional error={mErrors.marketingBudget}>
                <TextInput
                  id="m-budget"
                  inputMode="decimal"
                  value={marketing.draft.marketingBudget}
                  onChange={(v) => marketing.setDraft({ ...marketing.draft, marketingBudget: v })}
                  placeholder="e.g. 8000 per month"
                  invalid={Boolean(mErrors.marketingBudget)}
                />
              </Field>
              <Field label="Target conversion rate" optional error={mErrors.targetConversionRate} hint="Percentage, e.g. 4.2">
                <TextInput
                  id="m-conversion"
                  inputMode="decimal"
                  value={marketing.draft.targetConversionRate}
                  onChange={(v) => marketing.setDraft({ ...marketing.draft, targetConversionRate: v })}
                  placeholder="e.g. 4.2"
                  invalid={Boolean(mErrors.targetConversionRate)}
                />
              </Field>
            </div>

            <Field label="Preferred channels" optional>
              <TagsInput
                id="m-channels"
                values={marketing.draft.preferredChannels}
                onChange={(values) => marketing.setDraft({ ...marketing.draft, preferredChannels: values })}
                placeholder="Type a channel and press Enter"
                suggestions={OPTIONS.channels}
              />
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
              <SaveFeedback
                state={marketing.saveState}
                errorMessage={marketing.errorMessage}
              />
              <div className="flex items-center gap-2.5">
                <Button
                  variant="subtle"
                  onClick={marketing.cancelEditing}
                  disabled={marketing.saveState === "saving"}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={marketing.saveState === "saving" || Object.keys(mErrors).length > 0}
                >
                  Save marketing goals
                </Button>
              </div>
            </div>
          </form>
        )}
      </SectionCard>
    </div>
  );
}

function hasMarketingData(mg: MarketingGoal): boolean {
  return Boolean(
    mg.primaryGoal ||
      mg.secondaryGoals.length ||
      mg.monthlyLeadTarget ||
      mg.monthlyRevenueTarget ||
      mg.marketingBudget ||
      mg.preferredChannels.length,
  );
}

function formatValue(value: string, unit: string): string {
  return `${value?.trim() || "—"}${unit?.trim() ? ` ${unit}` : ""}`;
}

function GoalView({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-zinc-200">
        {value || <span className="text-zinc-600">Not set</span>}
      </dd>
    </div>
  );
}