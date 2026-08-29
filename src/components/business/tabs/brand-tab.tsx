"use client";

import { useState, type ChangeEvent } from "react";

import { BRAND_TONES } from "@/lib/business/options";
import type { BrandAsset, BrandAssetType, BrandIdentity, BrandVoice } from "@/lib/business/types";
import {
  MAX_ASSET_BYTES,
  MAX_IMAGE_BYTES,
  validateAssetType,
  validateBrandIdentity,
  validateBrandVoice,
  validateFile,
  validateImageType,
} from "@/lib/business/validation";

import {
  Badge,
  Button,
  ChipGroup,
  ColorInput,
  ConfirmDialog,
  EmptyState,
  Field,
  IconButton,
  SectionCard,
  TagsInput,
  TextArea,
  TextInput,
} from "@/components/business/primitives";
import { Icon } from "@/components/ui/icon";
import { FormFooter } from "./profile-tab";
import { useSectionEditor } from "@/components/business/useSectionEditor";

const ASSET_TYPES: BrandAssetType[] = ["Logo", "Image", "Reference", "Document"];

function createEmptyBrandAsset(): BrandAsset {
  return {
    id: "",
    type: "Image",
    name: "",
    notes: "",
    createdAt: new Date().toISOString(),
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

export function BrandTab({
  voice,
  identity,
  onSaveVoice,
  onSaveIdentity,
}: {
  voice: BrandVoice;
  identity: BrandIdentity;
  onSaveVoice: (next: BrandVoice) => Promise<void>;
  onSaveIdentity: (next: BrandIdentity) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <BrandVoiceSection voice={voice} onSave={onSaveVoice} />
      <BrandIdentitySection identity={identity} onSave={onSaveIdentity} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Brand Voice
// ---------------------------------------------------------------------------

function BrandVoiceSection({
  voice,
  onSave,
}: {
  voice: BrandVoice;
  onSave: (next: BrandVoice) => Promise<void>;
}) {
  const editor = useSectionEditor(voice, onSave);
  const { draft, setDraft, editing } = editor;
  const errors = editing ? validateBrandVoice(draft).errors : {};
  const hasData = Boolean(
    draft.tones.length || draft.personality || draft.wordsToUse.length || draft.communicationStyle,
  );

  if (!editing) {
    return (
      <SectionCard
        title="Brand Voice"
        description="How your brand sounds — the writing DNA for every message, post and email."
        action={
          <Button variant="ghost" size="sm" onClick={editor.startEditing}>
            {hasData ? "Edit" : "Define brand voice"}
          </Button>
        }
      >
        {hasData ? (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">Tone</dt>
              <dd className="flex flex-wrap gap-2">
                {draft.tones.map((tone) => (
                  <Badge key={tone} tone="amber">
                    {tone}
                  </Badge>
                ))}
              </dd>
            </div>
            <VoiceView label="Brand personality" value={draft.personality} />
            <VoiceView label="Communication style" value={draft.communicationStyle} />
            <VoiceView label="Words to use" value={draft.wordsToUse.join(", ")} />
            <VoiceView label="Words to avoid" value={draft.wordsToAvoid.join(", ")} />
            <VoiceView label="Writing preferences" value={draft.writingPreferences} wide />
          </dl>
        ) : (
          <EmptyState
            icon="type"
            title="No brand voice defined"
            description="Set your tone and personality so every piece of content sounds like you."
          />
        )}
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Brand Voice"
      description="Select one or more tones, then capture the personality that guides every word."
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (Object.keys(errors).length === 0) void editor.save();
        }}
      >
        <Field label="Tone" error={errors.tones} hint="Multiple tones allowed.">
          <ChipGroup
            options={BRAND_TONES}
            selected={draft.tones}
            onChange={(tones) => setDraft({ ...draft, tones })}
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Brand personality" error={errors.personality} hint="How would friends describe your brand?">
            <TextInput
              id="personality"
              value={draft.personality}
              onChange={(v) => setDraft({ ...draft, personality: v })}
              placeholder="e.g. Trusted, energetic and a little witty"
              invalid={Boolean(errors.personality)}
            />
          </Field>
          <Field label="Communication style" hint="Formal? Casual? Directive?">
            <TextInput
              id="communication-style"
              value={draft.communicationStyle}
              onChange={(v) => setDraft({ ...draft, communicationStyle: v })}
              placeholder="e.g. Short sentences, action-first, friendly"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Words to use">
            <TagsInput
              id="words-to-use"
              values={draft.wordsToUse}
              onChange={(values) => setDraft({ ...draft, wordsToUse: values })}
              placeholder="e.g. craft, freshness"
              suggestions={["craft", "fresh", "quality", "feel-good"]}
            />
          </Field>
          <Field label="Words to avoid">
            <TagsInput
              id="words-to-avoid"
              values={draft.wordsToAvoid}
              onChange={(values) => setDraft({ ...draft, wordsToAvoid: values })}
              placeholder="e.g. cheap, jargon"
            />
          </Field>
        </div>

        <Field label="Writing preferences" hint="Sentence length, formatting, examples to follow.">
          <TextArea
            id="writing-preferences"
            value={draft.writingPreferences}
            onChange={(v) => setDraft({ ...draft, writingPreferences: v })}
            placeholder="e.g. Use plain language, avoid exclamation marks, write in second person."
            rows={3}
          />
        </Field>

        <Field label="Additional brand guidelines" optional hint="Anything else — hashtags, emoji policy, disclaimers.">
          <TextArea
            id="brand-guidelines"
            value={draft.additionalGuidelines}
            onChange={(v) => setDraft({ ...draft, additionalGuidelines: v })}
            placeholder="Free-form notes that don't fit elsewhere…"
            rows={3}
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

function VoiceView({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-zinc-200">
        {value || <span className="text-zinc-600">Not set</span>}
      </dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Brand Identity
// ---------------------------------------------------------------------------

function BrandIdentitySection({
  identity,
  onSave,
}: {
  identity: BrandIdentity;
  onSave: (next: BrandIdentity) => Promise<void>;
}) {
  const editor = useSectionEditor(identity, onSave);
  const { draft, setDraft, editing } = editor;
  const errors = editing ? validateBrandIdentity(draft).errors : {};
  const hasData = Boolean(
    draft.logoDataUrl ||
      draft.primaryColor ||
      draft.secondaryColor ||
      draft.accentColor ||
      draft.preferredFont ||
      draft.assets.length,
  );

  if (!editing) {
    return (
      <SectionCard
        title="Brand Identity"
        description="Visual identity — logos, colors, font and organized brand assets."
        action={
          <Button variant="ghost" size="sm" onClick={editor.startEditing}>
            {hasData ? "Edit" : "Set up brand identity"}
          </Button>
        }
      >
        {hasData ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <LogoPreview label="Primary logo" dataUrl={draft.logoDataUrl} />
              <LogoPreview label="Secondary logo" dataUrl={draft.secondaryLogoDataUrl} />
              <LogoPreview label="Favicon" dataUrl={draft.faviconDataUrl} />
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">Preferred font</dt>
                <dd className="mt-1 text-sm text-zinc-200">{draft.preferredFont || "Not set"}</dd>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <ColorChip label="Primary" value={draft.primaryColor} />
              <ColorChip label="Secondary" value={draft.secondaryColor} />
              <ColorChip label="Accent" value={draft.accentColor} />
              <ColorChip label="Background" value={draft.backgroundColor} />
            </div>
            {draft.assets.length > 0 && (
              <div>
                <dt className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                  Brand assets ({draft.assets.length})
                </dt>
                <BrandAssetList assets={draft.assets} />
              </div>
            )}
            {draft.brandNotes && (
              <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-zinc-400">
                {draft.brandNotes}
              </p>
            )}
          </div>
        ) : (
          <EmptyState
            icon="palette"
            title="No brand identity yet"
            description="Upload logos, set brand colors and pick a font."
          />
        )}
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Brand Identity"
      description="Visual identity — logos, colors, font and organized brand assets. Files are stored locally for now."
    >
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (Object.keys(errors).length === 0) void editor.save();
        }}
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <LogoUploadField
            label="Primary logo"
            value={draft.logoDataUrl}
            onPick={(dataUrl) => setDraft({ ...draft, logoDataUrl: dataUrl })}
            onClear={() => setDraft({ ...draft, logoDataUrl: undefined, logoFileName: undefined })}
          />
          <LogoUploadField
            label="Secondary logo"
            value={draft.secondaryLogoDataUrl}
            onPick={(dataUrl) => setDraft({ ...draft, secondaryLogoDataUrl: dataUrl })}
            onClear={() => setDraft({ ...draft, secondaryLogoDataUrl: undefined, secondaryLogoFileName: undefined })}
          />
          <LogoUploadField
            label="Favicon"
            value={draft.faviconDataUrl}
            onPick={(dataUrl) => setDraft({ ...draft, faviconDataUrl: dataUrl })}
            onClear={() => setDraft({ ...draft, faviconDataUrl: undefined, faviconFileName: undefined })}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Primary brand color" optional error={errors.primaryColor}>
            <ColorInput
              id="color-primary"
              value={draft.primaryColor}
              onChange={(v) => setDraft({ ...draft, primaryColor: v })}
              placeholder="#F59E0B"
              invalid={Boolean(errors.primaryColor)}
            />
          </Field>
          <Field label="Secondary brand color" optional error={errors.secondaryColor}>
            <ColorInput
              id="color-secondary"
              value={draft.secondaryColor}
              onChange={(v) => setDraft({ ...draft, secondaryColor: v })}
              placeholder="#3B82F6"
              invalid={Boolean(errors.secondaryColor)}
            />
          </Field>
          <Field label="Accent color" optional error={errors.accentColor}>
            <ColorInput
              id="color-accent"
              value={draft.accentColor}
              onChange={(v) => setDraft({ ...draft, accentColor: v })}
              placeholder="#A855F7"
              invalid={Boolean(errors.accentColor)}
            />
          </Field>
          <Field label="Background color" optional error={errors.backgroundColor}>
            <ColorInput
              id="color-bg"
              value={draft.backgroundColor}
              onChange={(v) => setDraft({ ...draft, backgroundColor: v })}
              placeholder="#070910"
              invalid={Boolean(errors.backgroundColor)}
            />
          </Field>
        </div>

        <Field label="Preferred font" optional hint="e.g. Inter, Space Grotesk, Montserrat">
          <TextInput
            id="font"
            value={draft.preferredFont}
            onChange={(v) => setDraft({ ...draft, preferredFont: v })}
            placeholder="e.g. Inter for UI, Space Grotesk for display"
          />
        </Field>

        <BrandAssetsEditor
          assets={draft.assets}
          onChange={(assets) => setDraft({ ...draft, assets })}
        />

        <Field label="Additional brand notes" optional>
          <TextArea
            id="brand-notes"
            value={draft.brandNotes}
            onChange={(v) => setDraft({ ...draft, brandNotes: v })}
            placeholder="Anything else that defines the brand…"
            rows={3}
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

function LogoPreview({ label, dataUrl }: { label: string; dataUrl?: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">{label}</dt>
      <dd className="mt-2">
        {dataUrl ? (
          <div className="grid h-20 w-20 place-items-center rounded-xl border border-white/10 bg-white/[0.04] p-2">
            <img src={dataUrl} alt={label} className="max-h-full max-w-full object-contain" />
          </div>
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-[11px] text-zinc-600">
            Not set
          </div>
        )}
      </dd>
    </div>
  );
}

function ColorChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5">
      <span className="h-4 w-4 rounded-full ring-1 ring-white/20" style={{ backgroundColor: value || "#333" }} />
      <span className="text-xs text-zinc-400">{label}</span>
      <span className="font-mono text-[11px] text-zinc-600">{value || "—"}</span>
    </div>
  );
}

function BrandAssetList({ assets }: { assets: BrandAsset[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3"
        >
          {asset.dataUrl && asset.type !== "Reference" ? (
            <img src={asset.dataUrl} alt={asset.name} className="h-10 w-10 flex-shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-white/[0.04]">
              <AssetIcon type={asset.type} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{asset.name}</p>
            <p className="truncate text-[11px] text-zinc-600">{asset.notes || asset.type}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function LogoUploadField({
  label,
  value,
  onPick,
  onClear,
}: {
  label: string;
  value?: string;
  onPick: (dataUrl: string) => void;
  onClear: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!validateFile(file, MAX_IMAGE_BYTES).ok) {
      if (!validateImageType(file.type)) {
        setError("Unsupported file type. Use PNG, JPEG, WebP or SVG.");
        return;
      }
      setError("Logo must be under 1 MB for local storage.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onPick(dataUrl);
    } catch {
      setError("Could not read the file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Field label={label} hint={value ? "Pick a file to replace it." : "PNG / JPEG / WebP / SVG, max 1 MB"}>
      <div className="flex items-center gap-3">
        <div className="grid h-16 w-16 flex-shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
          {value ? (
            <img src={value} alt={label} className="h-full w-full object-contain" />
          ) : (
            <span className="text-[10px] text-zinc-500">none</span>
          )}
        </div>
        <div className="min-w-0">
          <label
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/[0.06] px-3 py-2 text-xs font-medium text-zinc-200 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.12]"
            title="Upload"
          >
            {busy ? "Reading…" : value ? "Replace" : "Upload"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleFile}
              className="hidden"
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={onClear}
              className="ml-2 text-xs text-zinc-500 transition-colors hover:text-rose-300"
            >
              Remove
            </button>
          )}
          {error && <p className="mt-1 text-[11px] text-rose-400">{error}</p>}
        </div>
      </div>
    </Field>
  );
}

// ---------------------------------------------------------------------------
// Brand Assets
// ---------------------------------------------------------------------------

function BrandAssetsEditor({
  assets,
  onChange,
}: {
  assets: BrandAsset[];
  onChange: (assets: BrandAsset[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [draft, setDraft] = useState<BrandAsset>(createEmptyBrandAsset);

  function addAsset() {
    setDraft(createEmptyBrandAsset());
    setError(null);
    setOpen(true);
  }

  function createId(): string {
    const base =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `asset-${base}`;
  }

  async function handlePick(type: BrandAssetType) {
    if (type === "Reference") {
      setDraft({ ...draft, type });
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "Document" ? "application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "image/png,image/jpeg,image/webp,image/svg+xml";
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (!validateAssetType(file.type)) {
        setError("Unsupported file type.");
        return;
      }
      const check = validateFile(file, MAX_ASSET_BYTES);
      if (!check.ok) {
        setError(check.error ?? "File too large.");
        return;
      }
      setError(null);
      setBusy(true);
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setDraft({
          ...draft,
          type,
          name: draft.name || file.name,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          dataUrl,
        });
      } catch {
        setError("Could not read the file.");
      } finally {
        setBusy(false);
      }
    };
    input.click();
  }

  function maybeAdd() {
    if (!draft.name.trim()) {
      setError("Name is required.");
      return;
    }
    onChange([...assets, { ...draft, id: createId() }]);
    setOpen(false);
    setError(null);
  }

  function remove(id: string) {
    onChange(assets.filter((a) => a.id !== id));
    setPendingDelete(null);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-medium text-zinc-300">Brand assets</p>
          <p className="text-xs text-zinc-600">Organize logos, images, references and documents.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={addAsset}>
          + Add asset
        </Button>
      </div>

      {assets.length === 0 && !open ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-center text-sm text-zinc-600">
          No assets yet — add logos, photography, brand references or PDF documents.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <div key={asset.id} className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
              {asset.dataUrl && asset.type !== "Reference" ? (
                <img src={asset.dataUrl} alt={asset.name} className="h-10 w-10 flex-shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-white/[0.04]">
                  <AssetIcon type={asset.type} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{asset.name}</p>
                <p className="text-[11px] text-zinc-600">{asset.type}</p>
              </div>
              <IconButton
                icon="trash"
                label="Delete asset"
                variant="danger"
                onClick={() => setPendingDelete(asset.id)}
              />
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="anim-rise-in mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="flex flex-wrap items-center gap-2">
            {ASSET_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => void handlePick(type)}
                disabled={busy}
                className="rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: draft.type === type ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)",
                  color: draft.type === type ? "#fcd34d" : "#a1a1aa",
                  borderColor: draft.type === type ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.1)",
                }}
              >
                {type === "Reference" ? `+ ${type} (link only)` : busy && draft.type === type ? "Reading…" : `+ ${type}`}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-4">
            <Field label="Name *" error={!draft.name.trim() ? "Name is required" : undefined}>
              <TextInput
                id="asset-name"
                value={draft.name}
                onChange={(v) => setDraft({ ...draft, name: v })}
                placeholder="e.g. Hero product photo"
              />
            </Field>
            <Field label="Notes" optional>
              <TextInput
                id="asset-notes"
                value={draft.notes ?? ""}
                onChange={(v) => setDraft({ ...draft, notes: v })}
                placeholder="Optional context for this asset"
              />
            </Field>
            {draft.type === "Reference" && (
              <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-zinc-500">
                References are saved as name + notes links for this phase — add the URL in notes.
              </p>
            )}
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <div className="flex justify-end gap-2.5">
              <Button variant="subtle" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={maybeAdd} disabled={busy}>
                Add asset
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete asset?"
        description="This removes the asset from your brand identity."
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && remove(pendingDelete)}
      />
    </div>
  );
}

function AssetIcon({ type }: { type: BrandAssetType }) {
  if (type === "Logo") return <Icon name="crown" className="h-4 w-4 text-zinc-400" />;
  if (type === "Document") return <Icon name="file" className="h-4 w-4 text-zinc-400" />;
  if (type === "Reference") return <Icon name="external" className="h-4 w-4 text-zinc-400" />;
  return <Icon name="image" className="h-4 w-4 text-zinc-400" />;
}