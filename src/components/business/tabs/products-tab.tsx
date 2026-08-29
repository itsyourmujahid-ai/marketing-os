"use client";

import { useState } from "react";

import { OFFER_KINDS, PRODUCT_STATUSES, uniqueCurrencyOptions } from "@/lib/business/options";
import type { OfferKind, ProductOrService } from "@/lib/business/types";
import { validateProduct } from "@/lib/business/validation";
import { cn } from "@/lib/utils";

import {
  Badge,
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

type SaveState = "idle" | "saving" | "saved" | "error";

function newProduct(): ProductOrService {
  return {
    id: "",
    kind: "Product",
    name: "",
    shortDescription: "",
    detailedDescription: "",
    price: "",
    currency: "USD",
    keyBenefits: [],
    features: [],
    targetAudience: "",
    status: "Active",
  };
}

function createId(): string {
  const key = "business-prod";
  const base = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${key}-${base}`;
}

export function ProductsTab({
  products,
  onSave,
}: {
  products: ProductOrService[];
  onSave: (next: ProductOrService[]) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [detailErrors, setDetailErrors] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductOrService>(newProduct());

  const viewing = viewingId ? products.find((p) => p.id === viewingId) : null;

  function openNew() {
    setDraft(newProduct());
    setEditingId(null);
    setDetailErrors({});
    setSaveState("idle");
    setErrorMessage(null);
    setViewingId(null);
    setOpen(true);
  }

  function openEdit(item: ProductOrService) {
    setDraft({ ...item });
    setEditingId(item.id);
    setDetailErrors({});
    setSaveState("idle");
    setErrorMessage(null);
    setViewingId(null);
    setOpen(true);
  }

  function closeEditor() {
    setOpen(false);
    setEditingId(null);
    setDetailErrors({});
    setSaveState("idle");
    setErrorMessage(null);
  }

  async function persist(items: ProductOrService[]): Promise<boolean> {
    setSaveState("saving");
    setErrorMessage(null);
    try {
      await onSave(items);
      setSaveState("saved");
      window.setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 2600);
      return true;
    } catch (error) {
      setSaveState("error");
      setErrorMessage(error instanceof Error ? error.message : "Could not save.");
      return false;
    }
  }

  const update = (key: keyof ProductOrService, value: string | string[]) =>
    setDraft({ ...draft, [key]: value });

  return (
    <SectionCard
      title="Products & Services"
      description="Everything you sell — used by strategy, offers, content and campaign modules."
      action={
        <Button variant="ghost" size="sm" onClick={openNew}>
          + Add product / service
        </Button>
      }
    >
      {products.length === 0 && !open ? (
        <EmptyState
          icon="grid"
          title="No products or services yet"
          description="Add your first product or service to give every other module something to market."
          action={
            <Button variant="primary" size="sm" onClick={openNew}>
              + Add product / service
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {products.map((item) => (
            <article
              key={item.id}
              className="group rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.14]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-[15px] font-bold text-white">{item.name || "Untitled"}</h3>
                    <Badge tone={item.kind === "Product" ? "sky" : "violet"}>{item.kind}</Badge>
                    <StatusBadge label={item.status} />
                  </div>
                  {item.shortDescription && (
                    <p className="mt-1 line-clamp-2 max-w-xl text-sm text-zinc-500">{item.shortDescription}</p>
                  )}
                  <p className="mt-1.5 text-xs text-zinc-600">
                    {item.price ? `${item.price} ${item.currency}` : "No price set"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <IconButton icon="eye" label="View" onClick={() => setViewingId(item.id)} />
                  <IconButton icon="pen" label="Edit" onClick={() => openEdit(item)} />
                  <IconButton icon="trash" label="Delete" variant="danger" onClick={() => setPendingDelete(item.id)} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* View mode */}
      {viewing && (
        <div className="anim-fade-in mt-5 rounded-xl border border-amber-400/20 bg-amber-500/[0.04] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base font-bold text-white">{viewing.name}</h3>
              <Badge tone={viewing.kind === "Product" ? "sky" : "violet"}>{viewing.kind}</Badge>
              <StatusBadge label={viewing.status} />
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => openEdit(viewing)}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => setPendingDelete(viewing.id)}>
                Delete
              </Button>
              <Button variant="subtle" size="sm" onClick={() => setViewingId(null)}>
                Close
              </Button>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <ViewItem label="Short description" value={viewing.shortDescription} wide />
            <ViewItem label="Detailed description" value={viewing.detailedDescription} wide />
            <ViewItem label="Price" value={viewing.price ? `${viewing.price} ${viewing.currency}` : "Not set"} />
            <ViewItem label="Target audience" value={viewing.targetAudience} />
            <ViewItem label="Key benefits" value={viewing.keyBenefits.join(" · ")} />
            <ViewItem label="Features" value={viewing.features.join(" · ")} />
          </dl>
        </div>
      )}

      {/* Editor panel */}
      {open && (
        <form
          className="anim-rise-in mt-5 space-y-5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const result = validateProduct(draft);
            setDetailErrors(result.errors);
            if (!result.valid) return;
            const items = editingId
              ? products.map((p) => (p.id === editingId ? { ...draft, id: editingId } : p))
              : [...products, { ...draft, id: createId() }];
            void persist(items).then((success) => {
              if (success) closeEditor();
            });
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-white">
              {editingId ? "Edit product / service" : "Add product / service"}
            </h3>
            <SaveFeedback state={saveState} errorMessage={errorMessage} />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Name" error={detailErrors.name}>
              <TextInput
                id="product-name"
                value={draft.name}
                onChange={(v) => update("name", v)}
                placeholder="e.g. Signature Roast – 1kg bag"
                invalid={Boolean(detailErrors.name)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Type" error={detailErrors.kind}>
                <SelectField
                  id="product-kind"
                  value={draft.kind}
                  onChange={(v) => update("kind", v)}
                  options={OFFER_KINDS}
                  invalid={Boolean(detailErrors.kind)}
                />
              </Field>
              <Field label="Status" error={detailErrors.status}>
                <SelectField
                  id="product-status"
                  value={draft.status}
                  onChange={(v) => update("status", v as OfferKind)}
                  options={PRODUCT_STATUSES}
                  invalid={Boolean(detailErrors.status)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-[1fr_110px] gap-4">
              <Field label="Price" optional error={detailErrors.price}>
                <TextInput
                  id="product-price"
                  inputMode="decimal"
                  value={draft.price}
                  onChange={(v) => update("price", v)}
                  placeholder="e.g. 24.99"
                  invalid={Boolean(detailErrors.price)}
                />
              </Field>
              <Field label="Currency" optional>
                <SelectField
                  id="product-currency"
                  value={draft.currency}
                  onChange={(v) => update("currency", v)}
                  options={uniqueCurrencyOptions()}
                />
              </Field>
            </div>
          </div>

          <Field label="Short description" optional hint="One line shown in lists and previews.">
            <TextArea
              id="product-short"
              value={draft.shortDescription}
              onChange={(v) => update("shortDescription", v)}
              placeholder="One-liner about this product or service."
              rows={2}
            />
          </Field>

          <Field label="Detailed description" optional>
            <TextArea
              id="product-detailed"
              value={draft.detailedDescription}
              onChange={(v) => update("detailedDescription", v)}
              placeholder="Full description used for pages, offers and content."
              rows={4}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Key benefits" hint="Add one per line — Enter to add.">
              <TagsInput
                id="product-benefits"
                values={draft.keyBenefits}
                onChange={(values) => update("keyBenefits", values)}
                placeholder="e.g. Free shipping within 48h"
              />
            </Field>
            <Field label="Features" hint="Add one per line — Enter to add.">
              <TagsInput
                id="product-features"
                values={draft.features}
                onChange={(values) => update("features", values)}
                placeholder="e.g. 100% arabica beans"
              />
            </Field>
          </div>

          <Field label="Target audience" optional hint="Who is this product/service for?">
            <TextInput
              id="product-audience"
              value={draft.targetAudience}
              onChange={(v) => update("targetAudience", v)}
              placeholder="e.g. Home coffee enthusiasts aged 25–45"
            />
          </Field>

          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-white/[0.06] pt-4">
            <SaveFeedback state={saveState} errorMessage={errorMessage} />
            <Button variant="subtle" onClick={closeEditor} disabled={saveState === "saving"}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={saveState === "saving"}
            >
              {editingId ? "Save changes" : "Add"}
            </Button>
          </div>
        </form>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete product / service?"
        description="This permanently removes the item from your business workspace."
        busy={saveState === "saving"}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          const target = pendingDelete;
          if (!target) return;
          const items = products.filter((p) => p.id !== target);
          setPendingDelete(null);
          if (viewingId === target) setViewingId(null);
          if (editingId === target) closeEditor();
          void persist(items);
        }}
      />
    </SectionCard>
  );
}

function ViewItem({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={cn(wide && "sm:col-span-2")}>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
        {value || <span className="text-zinc-600">Not set</span>}
      </dd>
    </div>
  );
}