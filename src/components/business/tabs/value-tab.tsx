"use client";

import type { ValueProposition } from "@/lib/business/types";
import { validateValueProposition } from "@/lib/business/validation";

import {
  Button,
  EmptyState,
  Field,
  SectionCard,
  TagsInput,
  TextArea,
  TextInput,
} from "@/components/business/primitives";
import { FormFooter } from "./profile-tab";
import { useSectionEditor } from "@/components/business/useSectionEditor";

export function ValuePropositionTab({
  value,
  onSave,
}: {
  value: ValueProposition;
  onSave: (next: ValueProposition) => Promise<void>;
}) {
  const editor = useSectionEditor(value, onSave);
  const { draft, setDraft, editing } = editor;
  const errors = editing ? validateValueProposition(draft).errors : {};

  const update = (key: keyof ValueProposition, val: string) =>
    setDraft({ ...draft, [key]: val });

  if (!editing) {
    const hasData = Boolean(
      draft.mainValue || draft.usp || draft.problemSolved || draft.solutionProvided || draft.differentiators.length,
    );
    return (
      <SectionCard
        title="Value Proposition"
        description="What you offer, why it matters, and why customers should choose you."
        action={
          <Button variant="ghost" size="sm" onClick={editor.startEditing}>
            {hasData ? "Edit" : "Add value proposition"}
          </Button>
        }
      >
        {hasData ? (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <ProfileValue label="Main value proposition" value={draft.mainValue} wide />
            <ProfileValue label="Unique selling proposition (USP)" value={draft.usp} wide />
            <ProfileValue
              label="Key differentiators"
              value={draft.differentiators.length > 0 ? draft.differentiators.join(" · ") : ""}
              wide
            />
            <ProfileValue label="Main customer problem solved" value={draft.problemSolved} />
            <ProfileValue label="Main solution provided" value={draft.solutionProvided} />
          </dl>
        ) : (
          <EmptyState
            icon="zap"
            title="No value proposition yet"
            description="Capture your USP and key differentiators — the heart of your marketing story."
          />
        )}
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Value Proposition"
      description="Keep it concise and marketing-friendly — this powers your positioning everywhere."
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (Object.keys(errors).length === 0) void editor.save();
        }}
      >
        <Field
          label="Main value proposition"
          error={errors.mainValue}
          hint="The single biggest reason customers buy from you."
        >
          <TextArea
            id="main-value"
            value={draft.mainValue}
            onChange={(v) => update("mainValue", v)}
            placeholder="e.g. Fresh, fair-trade coffee delivered to your door in 48 hours."
            rows={2}
          />
        </Field>

        <Field label="Unique Selling Proposition (USP)" error={errors.usp} hint="What you offer that nobody else does.">
          <TextInput
            id="usp"
            value={draft.usp}
            onChange={(v) => update("usp", v)}
            placeholder="e.g. Small-batch roasting with a transparent, farmer-documented supply chain"
            invalid={Boolean(errors.usp)}
          />
        </Field>

        <Field label="Key differentiators" hint="Add each differentiator separately, e.g. faster delivery, better pricing, unique product.">
          <TagsInput
            id="differentiators"
            values={draft.differentiators}
            onChange={(values) => setDraft({ ...draft, differentiators: values })}
            placeholder="Type a differentiator and press Enter"
          />
        </Field>

        <Field label="Main customer problem solved" error={errors.problemSolved}>
          <TextArea
            id="problem"
            value={draft.problemSolved}
            onChange={(v) => update("problemSolved", v)}
            placeholder="e.g. Shoppers can't find consistently high-quality coffee without paying premium deli prices."
            rows={2}
          />
        </Field>

        <Field label="Main solution provided" error={errors.solutionProvided}>
          <TextArea
            id="solution"
            value={draft.solutionProvided}
            onChange={(v) => update("solutionProvided", v)}
            placeholder="e.g. Subscription micro-roastery delivering fresh beans with every order."
            rows={2}
          />
        </Field>

        <FormFooter
          saveState={editor.saveState}
          errorMessage={editor.errorMessage}
          onCancel={editor.cancelEditing}
          valid={Object.keys(errors).length === 0}
        />
      </form>
    </SectionCard>
  );
}

function ProfileValue({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-zinc-200">
        {value || <span className="text-zinc-600">Not set</span>}
      </dd>
    </div>
  );
}