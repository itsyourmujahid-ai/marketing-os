"use client";

import { CUSTOMER_TYPES, INDUSTRIES, OPTIONS } from "@/lib/business/options";
import type { TargetMarket } from "@/lib/business/types";
import { validateTargetMarket } from "@/lib/business/validation";

import {
  Button,
  EmptyState,
  Field,
  SectionCard,
  SelectField,
  TagsInput,
  TextInput,
} from "@/components/business/primitives";
import { FormFooter } from "./profile-tab";
import { useSectionEditor } from "@/components/business/useSectionEditor";
import { cn } from "@/lib/utils";

export function TargetMarketTab({
  market,
  onSave,
}: {
  market: TargetMarket;
  onSave: (next: TargetMarket) => Promise<void>;
}) {
  const editor = useSectionEditor(market, onSave);
  const { draft, setDraft, editing } = editor;
  const errors = editing ? validateTargetMarket(draft).errors : {};

  const update = (key: keyof TargetMarket, value: string) =>
    setDraft({ ...draft, [key]: value });
  const updateList = (key: keyof TargetMarket, values: string[]) =>
    setDraft({ ...draft, [key]: values });

  if (!editing) {
    const hasData = Boolean(
      draft.primaryMarket ||
        draft.customerType ||
        draft.countries.length ||
        draft.industries.length ||
        draft.preferredChannels.length,
    );
    return (
      <SectionCard
        title="Target Market"
        description="Who your business sells to — supports both B2B and B2C audiences."
        action={
          <Button variant="ghost" size="sm" onClick={editor.startEditing}>
            {hasData ? "Edit" : "Define target market"}
          </Button>
        }
      >
        {hasData ? (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <ViewMarket label="Primary market" value={draft.primaryMarket} />
            <ViewMarket label="Customer type" value={draft.customerType} />
            <ViewMarket label="Countries" value={draft.countries.join(", ")} />
            <ViewMarket label="Cities / regions" value={draft.citiesRegions.join(", ")} />
            <ViewMarket label="Industries" value={draft.industries.join(", ")} />
            <ViewMarket label="Company size" value={draft.companySize} />
            <ViewMarket label="Job roles" value={draft.jobRoles.join(", ")} />
            <ViewMarket label="Departments" value={draft.departments.join(", ")} />
            <ViewMarket label="Decision-maker type" value={draft.decisionMakerType} />
            <ViewMarket label="Age range" value={draft.ageRange} />
            <ViewMarket label="Gender" value={draft.gender} />
            <ViewMarket label="Interests" value={draft.interests.join(", ")} />
            <ViewMarket label="Lifestyle" value={draft.lifestyle} />
            <ViewMarket label="Buying behavior" value={draft.buyingBehavior} />
            <ViewMarket label="Languages" value={draft.languages.join(", ")} />
            <ViewMarket label="Preferred channels" value={draft.preferredChannels.join(", ")} wide />
          </dl>
        ) : (
          <EmptyState
            icon="users"
            title="No target market defined"
            description="Define who you sell to so every module can speak to the right audience."
          />
        )}
      </SectionCard>
    );
  }

  const isB2C = draft.customerType === "Consumer (B2C)";
  const isB2B = draft.customerType === "Business (B2B)";
  const both = draft.customerType === "Both (B2B + B2C)";
  const showB2C = both || isB2C || !draft.customerType;
  const showB2B = both || isB2B || !draft.customerType;
  const none = !draft.customerType;

  return (
    <SectionCard
      title="Target Market"
      description="Define who your business sells to. Fields adapt to your customer type — no audience is locked to B2C."
    >
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (Object.keys(errors).length === 0) void editor.save();
        }}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Primary market" optional hint="e.g. Small businesses in Western Europe, or Gen-Z consumers in the US.">
            <TextInput
              id="primary-market"
              value={draft.primaryMarket}
              onChange={(v) => update("primaryMarket", v)}
              placeholder="e.g. SMB marketing managers (B2B) or urban professionals (B2C)"
            />
          </Field>
          <Field label="Customer type" error={errors.customerType}>
            <SelectField
              id="customer-type"
              value={draft.customerType}
              onChange={(v) => update("customerType", v)}
              options={CUSTOMER_TYPES}
              placeholder="Select customer type…"
              invalid={Boolean(errors.customerType)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Countries" hint="Target geographies.">
            <TagsInput
              id="countries"
              values={draft.countries}
              onChange={(values) => updateList("countries", values)}
              placeholder="Type a country and press Enter"
            />
          </Field>
          <Field label="Cities / regions" optional>
            <TagsInput
              id="cities"
              values={draft.citiesRegions}
              onChange={(values) => updateList("citiesRegions", values)}
              placeholder="City or region…"
            />
          </Field>
        </div>

        <Field label="Industries" optional hint="Which sectors your audience works in.">
          <TagsInput
            id="market-industries"
            values={draft.industries}
            onChange={(values) => updateList("industries", values)}
            placeholder="Type an industry and press Enter"
            suggestions={INDUSTRIES}
          />
        </Field>

        <SectionDivider label={isB2C ? "Consumer audience (B2C)" : isB2B ? "Business audience (B2B)" : both ? "Audience details (B2B + B2C)" : "Audience details"} />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {showB2C ? (
            <>
              <Field label="Age range" optional error={errors.ageRange}>
                <TextInput
                  id="age-range"
                  value={draft.ageRange}
                  onChange={(v) => update("ageRange", v)}
                  placeholder="e.g. 25-44"
                  invalid={Boolean(errors.ageRange)}
                />
              </Field>
              <Field label="Gender" optional hint="Omit if not relevant to your product.">
                <TextInput
                  id="gender"
                  value={draft.gender}
                  onChange={(v) => update("gender", v)}
                  placeholder="e.g. Any / Female / Male — or leave blank"
                />
              </Field>
              <Field label="Interests" optional>
                <TagsInput
                  id="interests"
                  values={draft.interests}
                  onChange={(values) => updateList("interests", values)}
                  placeholder="e.g. Fitness, sustainability"
                />
              </Field>
              <Field label="Lifestyle" optional>
                <TextInput
                  id="lifestyle"
                  value={draft.lifestyle}
                  onChange={(v) => update("lifestyle", v)}
                  placeholder="e.g. Busy urban professionals, health-conscious"
                />
              </Field>
              <Field label="Buying behavior" optional>
                <TextInput
                  id="buying-behavior"
                  value={draft.buyingBehavior}
                  onChange={(v) => update("buyingBehavior", v)}
                  placeholder="e.g. Research-heavy, comparison shoppers"
                />
              </Field>
            </>
          ) : null}

          {showB2B ? (
            <>
              <Field label="Company size" optional>
                <SelectField
                  id="company-size"
                  value={draft.companySize}
                  onChange={(v) => update("companySize", v)}
                  options={["1-10 employees", "11-50 employees", "51-200 employees", "201-1000 employees", "1000+ employees"]}
                  placeholder="Select company size…"
                />
              </Field>
              <Field label="Job roles" optional>
                <TagsInput
                  id="job-roles"
                  values={draft.jobRoles}
                  onChange={(values) => updateList("jobRoles", values)}
                  placeholder="e.g. Marketing Manager, Founder"
                />
              </Field>
              <Field label="Departments" optional>
                <TagsInput
                  id="departments"
                  values={draft.departments}
                  onChange={(values) => updateList("departments", values)}
                  placeholder="e.g. Marketing, Sales, Operations"
                />
              </Field>
              <Field label="Decision-maker type" optional hint="Who says yes inside the company.">
                <TextInput
                  id="decision-maker"
                  value={draft.decisionMakerType}
                  onChange={(v) => update("decisionMakerType", v)}
                  placeholder="e.g. CMO, Owner, Procurement lead"
                />
              </Field>
            </>
          ) : null}
        </div>

        {none ? (
          <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-zinc-500">
            Select a customer type above to reveal the relevant audience fields. Both B2B and B2C are supported.
          </p>
        ) : null}

        <SectionDivider label="Shared preferences" />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Languages" optional>
            <TagsInput
              id="languages"
              values={draft.languages}
              onChange={(values) => updateList("languages", values)}
              placeholder="Type a language and press Enter"
              suggestions={OPTIONS.languages}
            />
          </Field>
          <Field label="Preferred channels" optional>
            <TagsInput
              id="channels"
              values={draft.preferredChannels}
              onChange={(values) => updateList("preferredChannels", values)}
              placeholder="Type a channel and press Enter"
              suggestions={OPTIONS.channels}
            />
          </Field>
        </div>

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

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <div className="h-px flex-1 bg-white/[0.06]" />
    </div>
  );
}

function ViewMarket({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={cn(wide && "sm:col-span-2")}>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-zinc-200">
        {value || <span className="text-zinc-600">Not set</span>}
      </dd>
    </div>
  );
}