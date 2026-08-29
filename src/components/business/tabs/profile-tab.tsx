"use client";

import { BUSINESS_TYPES, INDUSTRIES } from "@/lib/business/options";
import type { BusinessProfile } from "@/lib/business/types";
import { validateProfile } from "@/lib/business/validation";
import { cn } from "@/lib/utils";

import {
  Button,
  EmptyState,
  Field,
  SaveFeedback,
  SectionCard,
  SelectField,
  TextArea,
  TextInput,
} from "@/components/business/primitives";
import { useSectionEditor } from "@/components/business/useSectionEditor";

export function ProfileTab({
  profile,
  onSave,
}: {
  profile: BusinessProfile;
  onSave: (next: BusinessProfile) => Promise<void>;
}) {
  const editor = useSectionEditor(profile, onSave);
  const { draft, setDraft, editing } = editor;
  const errors = editing ? validateProfile(draft).errors : {};

  const update = (key: keyof BusinessProfile, value: string) =>
    setDraft({ ...draft, [key]: value });

  if (!editing) {
    const hasData = Object.values(profile).some((v) => (Array.isArray(v) ? v.length > 0 : Boolean(String(v).trim())));
    return (
      <SectionCard
        title="Business Profile"
        description="The core facts about your business — used across every Marketing OS module."
        action={
          <Button variant="ghost" size="sm" onClick={editor.startEditing}>
            {hasData ? "Edit" : "Add profile"}
          </Button>
        }
      >
        {hasData ? (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <ProfileItem label="Business name" value={profile.businessName} />
            <ProfileItem label="Industry" value={profile.industry} />
            <ProfileItem label="Business type" value={profile.businessType} />
            <ProfileItem label="Country" value={profile.country} />
            <ProfileItem label="City / region" value={profile.cityRegion} />
            <ProfileItem label="Website" value={profile.website} href={profile.website} />
            <ProfileItem label="Business email" value={profile.businessEmail} />
            <ProfileItem label="Business phone" value={profile.businessPhone} />
            <ProfileItem label="Short description" value={profile.shortDescription} wide />
            <ProfileItem label="Full description" value={profile.fullDescription} wide />
          </dl>
        ) : (
          <EmptyState
            icon="building"
            title="No business profile yet"
            description="Add your business name, industry, location and contact details to set up the workspace."
          />
        )}
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Business Profile"
      description="The core facts about your business — used across every Marketing OS module."
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (Object.keys(errors).length === 0) void editor.save();
        }}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Business name" error={errors.businessName}>
            <TextInput
              id="business-name"
              value={draft.businessName}
              onChange={(v) => update("businessName", v)}
              placeholder="e.g. Northwind Coffee Co."
              invalid={Boolean(errors.businessName)}
            />
          </Field>
          <Field label="Industry" error={errors.industry} hint="What sector does your business operate in?">
            <SelectField
              id="industry"
              value={draft.industry}
              onChange={(v) => update("industry", v)}
              options={INDUSTRIES}
              placeholder="Select industry…"
              invalid={Boolean(errors.industry)}
            />
          </Field>
          <Field label="Business type" error={errors.businessType} hint="B2B, B2C, agency, SaaS, service business, etc.">
            <SelectField
              id="business-type"
              value={draft.businessType}
              onChange={(v) => update("businessType", v)}
              options={BUSINESS_TYPES}
              placeholder="Select business type…"
              invalid={Boolean(errors.businessType)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Country" error={errors.country}>
              <TextInput
                id="country"
                value={draft.country}
                onChange={(v) => update("country", v)}
                placeholder="e.g. United States"
                invalid={Boolean(errors.country)}
              />
            </Field>
            <Field label="City / region" optional>
              <TextInput
                id="city-region"
                value={draft.cityRegion}
                onChange={(v) => update("cityRegion", v)}
                placeholder="e.g. Austin, TX"
              />
            </Field>
          </div>
          <Field label="Website" optional error={errors.website}>
            <TextInput
              id="website"
              value={draft.website}
              onChange={(v) => update("website", v)}
              placeholder="https://example.com"
              autoComplete="url"
              invalid={Boolean(errors.website)}
            />
          </Field>
          <Field label="Business email" optional error={errors.businessEmail}>
            <TextInput
              id="business-email"
              type="email"
              value={draft.businessEmail}
              onChange={(v) => update("businessEmail", v)}
              placeholder="hello@yourbusiness.com"
              autoComplete="email"
              invalid={Boolean(errors.businessEmail)}
            />
          </Field>
          <Field label="Business phone" optional error={errors.businessPhone}>
            <TextInput
              id="business-phone"
              type="tel"
              value={draft.businessPhone}
              onChange={(v) => update("businessPhone", v)}
              placeholder="+1 (555) 000-0000"
              autoComplete="tel"
              invalid={Boolean(errors.businessPhone)}
            />
          </Field>
        </div>

        <Field label="Short description" optional hint="One or two sentences shown across the workspace.">
          <TextArea
            id="short-description"
            value={draft.shortDescription}
            onChange={(v) => update("shortDescription", v)}
            placeholder="e.g. Specialty coffee roastery delivering single-origin beans to homes and offices."
            rows={2}
          />
        </Field>

        <Field label="Full business description" optional hint="A fuller account used as context for reports and marketing content.">
          <TextArea
            id="full-description"
            value={draft.fullDescription}
            onChange={(v) => update("fullDescription", v)}
            placeholder="Describe your business, its history, what makes it different and who it serves…"
            rows={5}
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

function ProfileItem({
  label,
  value,
  href,
  wide,
}: {
  label: string;
  value: string;
  href?: string;
  wide?: boolean;
}) {
  const content = value?.trim() ? (
    href ? (
      <a
        href={href.startsWith("http") ? href : `https://${href}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-amber-300/90 transition-colors hover:text-amber-200"
      >
        {value}
      </a>
    ) : (
      <span className="whitespace-pre-wrap text-zinc-200">{value}</span>
    )
  ) : (
    <span className="text-zinc-600">Not set</span>
  );
  return (
    <div className={cn(wide && "sm:col-span-2")}>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed">{content}</dd>
    </div>
  );
}

export function FormFooter({
  saveState,
  errorMessage,
  onCancel,
  valid,
}: {
  saveState: "idle" | "saving" | "saved" | "error";
  errorMessage?: string | null;
  onCancel: () => void;
  valid: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
      <SaveFeedback state={saveState} errorMessage={errorMessage} />
      <div className="flex items-center gap-2.5">
        <Button variant="subtle" onClick={onCancel} disabled={saveState === "saving"}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={saveState === "saving" || !valid}>
          Save changes
        </Button>
      </div>
    </div>
  );
}