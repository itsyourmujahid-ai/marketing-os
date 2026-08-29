"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { suggestedAudienceType } from "@/lib/audience/factory";
import { getAudienceService } from "@/lib/audience/service";
import type {
  AudienceSegment,
  AudienceState,
  Persona,
  PersonaDraft,
  SegmentDraft,
} from "@/lib/audience/types";
import { buildAudienceInsights, buildAudienceRecommendations } from "@/lib/audience/insights";
import { PRIORITIES, ROLES, STATUSES } from "@/lib/audience/options";
import { getBusinessService } from "@/lib/business/service";
import type { Business } from "@/lib/business/types";

import { Button, ConfirmDialog, EmptyState, SelectField, TextInput } from "@/components/business/primitives";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

import { PersonaEditor } from "./PersonaEditor";
import { SegmentCard } from "./SegmentCard";
import { SegmentEditor } from "./SegmentEditor";

const RANK: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const ROLE_RANK: Record<string, number> = { Primary: 0, Secondary: 1, Experimental: 2 };
const STATUS_RANK: Record<string, number> = { Active: 0, Draft: 1, Archived: 2 };

export function AudiencePage() {
  const service = useMemo(() => getAudienceService(), []);
  const businessService = useMemo(() => getBusinessService(), []);
  const [state, setState] = useState<AudienceState | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [segmentEditor, setSegmentEditor] = useState<{ initial: AudienceSegment | null } | null>(null);
  const [personaEditor, setPersonaEditor] = useState<{ initial: Persona | null; segmentId: string } | null>(null);
  const [segmentToDelete, setSegmentToDelete] = useState<{ segment: AudienceSegment; personaCount: number } | null>(null);
  const [personaToDelete, setPersonaToDelete] = useState<Persona | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [audience, biz] = await Promise.all([
        service.getState(),
        businessService.getBusiness(),
      ]);
      setState(audience);
      setBusiness(biz);
    } catch {
      setLoadError("Could not load audience data.");
    } finally {
      setLoading(false);
    }
  }, [service, businessService]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const segments = useMemo(() => state?.segments ?? [], [state]);
  const personas = useMemo(() => state?.personas ?? [], [state]);

  const personasBySegment = useMemo(() => {
    const map = new Map<string, Persona[]>();
    for (const persona of personas) {
      const list = map.get(persona.segmentId) ?? [];
      list.push(persona);
      map.set(persona.segmentId, list);
    }
    return map;
  }, [personas]);

  const defaultPersonaSegmentId = useMemo(() => {
    return (
      segments.find((s) => s.role === "Primary" && s.status === "Active") ??
      segments.find((s) => s.status === "Active") ??
      segments[0] ??
      null
    )?.id;
  }, [segments]);

  const filteredSegments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return segments
      .filter((s) => {
        if (q) {
          const haystack = JSON.stringify({
            name: s.name,
            description: s.description,
            notes: s.notes,
            location: s.location,
            industries: s.industries,
            jobTitle: s.jobTitle,
            interests: s.interests,
            painPoints: s.painPoints,
            buyingTriggers: s.buyingTriggers,
            preferredChannels: s.preferredChannels,
          }).toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        if (typeFilter && s.audienceType !== typeFilter) return false;
        if (priorityFilter && s.priority !== priorityFilter) return false;
        if (statusFilter && s.status !== statusFilter) return false;
        if (roleFilter && s.role !== roleFilter) return false;
        return true;
      })
      .sort(
        (a, b) =>
          STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
          ROLE_RANK[a.role] - ROLE_RANK[b.role] ||
          RANK[a.priority] - RANK[b.priority] ||
          a.name.localeCompare(b.name),
      );
  }, [segments, search, typeFilter, priorityFilter, statusFilter, roleFilter]);

  const insights = useMemo(() => (state ? buildAudienceInsights(state) : []), [state]);
  const recommendations = useMemo(() => (state ? buildAudienceRecommendations(state) : []), [state]);

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setPriorityFilter("");
    setStatusFilter("");
    setRoleFilter("");
  };

  const handleSegmentSave = async (draft: SegmentDraft) => {
    const next = segmentEditor?.initial
      ? await service.updateSegment(segmentEditor.initial.id, draft)
      : await service.createSegment(draft);
    setState(next);
    setSegmentEditor(null);
    setPageError(null);
  };

  const handlePersonaSave = async (draft: PersonaDraft) => {
    const next = personaEditor?.initial
      ? await service.updatePersona(personaEditor.initial.id, draft)
      : await service.createPersona(draft);
    setState(next);
    setPersonaEditor(null);
    setPageError(null);
  };

  const confirmDeleteSegment = async () => {
    if (!segmentToDelete) return;
    setBusy(true);
    setPageError(null);
    try {
      const next = await service.removeSegment(segmentToDelete.segment.id, { cascade: true });
      setState(next);
      setSegmentToDelete(null);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Could not delete segment.");
    } finally {
      setBusy(false);
    }
  };

  const confirmDeletePersona = async () => {
    if (!personaToDelete) return;
    setBusy(true);
    setPageError(null);
    try {
      setState(await service.removePersona(personaToDelete.id));
      setPersonaToDelete(null);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Could not delete persona.");
    } finally {
      setBusy(false);
    }
  };

  const duplicatePersona = async (persona: Persona) => {
    setPageError(null);
    try {
      setState(await service.duplicatePersona(persona.id));
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Could not duplicate persona.");
    }
  };

  if (loading && !state) {
    return <AudienceSkeleton />;
  }

  if (loadError && !state) {
    return (
      <div className="glass-panel mx-auto max-w-xl rounded-2xl p-8 text-center">
        <Icon name="info" className="mx-auto h-8 w-8 text-rose-300" />
        <h2 className="mt-3 font-display text-lg font-bold text-white">Something went wrong</h2>
        <p className="mt-1 text-sm text-zinc-500">{loadError}</p>
        <div className="mt-4 flex justify-center gap-2.5">
          <button
            type="button"
            onClick={() => void refresh()}
            className="inline-flex items-center gap-2 rounded-xl bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 hover:bg-white/[0.14]"
          >
            <Icon name="refresh" className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!state) return null;

  const hasSegments = segments.length > 0;
  const hasFilters = Boolean(search || typeFilter || priorityFilter || statusFilter || roleFilter);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Audience
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-bold text-white">Audience &amp; Personas</h1>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="ghost"
              onClick={() =>
                setPersonaEditor(
                  defaultPersonaSegmentId
                    ? { initial: null, segmentId: defaultPersonaSegmentId }
                    : null,
                )
              }
              disabled={!defaultPersonaSegmentId}
            >
              <Icon name="plus" className="h-4 w-4" />
              Create Persona
            </Button>
            <Button variant="primary" onClick={() => setSegmentEditor({ initial: null })}>
              <Icon name="plus" className="h-4 w-4" />
              Create Segment
            </Button>
          </div>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {hasSegments || personas.length > 0
            ? `${segments.length} segment${segments.length === 1 ? "" : "s"} · ${personas.length} persona${personas.length === 1 ? "" : "s"} — the people Marketing OS speaks to.`
            : "Define who you want to reach. Segments and personas power every marketing decision."}
        </p>
      </div>

      {pageError && (
        <p className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {pageError}
        </p>
      )}

      {hasSegments && (
        <>
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 sm:flex-row sm:items-center">
            <TextInput
              id="audience-search"
              value={search}
              onChange={setSearch}
              placeholder="Search segments & personas…"
            />
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-1">
              <SelectField id="filter-type" value={typeFilter} onChange={setTypeFilter} options={["B2B", "B2C"]} placeholder="All types" />
              <SelectField id="filter-role" value={roleFilter} onChange={setRoleFilter} options={ROLES} placeholder="All roles" />
              <SelectField id="filter-priority" value={priorityFilter} onChange={setPriorityFilter} options={PRIORITIES} placeholder="All priorities" />
              <SelectField id="filter-status" value={statusFilter} onChange={setStatusFilter} options={STATUSES} placeholder="All statuses" />
            </div>
            {hasFilters && (
              <Button variant="subtle" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>

          {insights.length > 0 && (
            <div className="mb-6 space-y-2">
              {insights.map((insight) => (
                <InsightRow key={insight.id} insight={insight} />
              ))}
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="glass-panel mb-8 rounded-2xl p-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Things to add
              </p>
              <div className="flex flex-wrap gap-2">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-[13px] text-zinc-400"
                    title={rec.recommendation}
                  >
                    <span className="font-semibold text-zinc-200">{rec.missing}</span>
                    <span className="ml-1.5">{rec.recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {hasSegments ? (
        <div className="space-y-6">
          {filteredSegments.map((segment) => (
            <SegmentCard
              key={segment.id}
              segment={segment}
              personas={personasBySegment.get(segment.id) ?? []}
              onEdit={() => setSegmentEditor({ initial: segment })}
              onDelete={() =>
                setSegmentToDelete({
                  segment,
                  personaCount: (personasBySegment.get(segment.id) ?? []).length,
                })
              }
              onAddPersona={() => setPersonaEditor({ initial: null, segmentId: segment.id })}
              onEditPersona={(persona) =>
                setPersonaEditor({ initial: persona, segmentId: persona.segmentId })
              }
              onDuplicatePersona={(persona) => void duplicatePersona(persona)}
              onDeletePersona={(persona) => setPersonaToDelete(persona)}
            />
          ))}
          {filteredSegments.length === 0 && (
            <EmptyState
              icon="search"
              title="No segments match your filters"
              description="Try clearing the search or filters to see all segments."
              action={
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <EmptyState
          icon="users"
          title="No audience segments yet"
          description="Define who you want to reach. Create your first segment, then add personas and let Marketing OS build on it."
          action={
            <Button variant="primary" onClick={() => setSegmentEditor({ initial: null })}>
              <Icon name="plus" className="h-4 w-4" />
              Create Segment
            </Button>
          }
        />
      )}

      {segmentEditor && (
        <SegmentEditor
          key={segmentEditor.initial?.id ?? "new-segment"}
          initial={segmentEditor.initial}
          suggestedType={suggestedAudienceType(business)}
          onClose={() => setSegmentEditor(null)}
          onSave={handleSegmentSave}
        />
      )}

      {personaEditor && (
        <PersonaEditor
          key={personaEditor.initial?.id ?? `new-persona-${personaEditor.segmentId}`}
          initial={personaEditor.initial}
          defaultSegmentId={personaEditor.segmentId}
          segmentName={segments.find((s) => s.id === personaEditor.segmentId)?.name ?? "this segment"}
          onClose={() => setPersonaEditor(null)}
          onSave={handlePersonaSave}
        />
      )}

      <ConfirmDialog
        open={Boolean(segmentToDelete)}
        title="Delete segment?"
        description={
          segmentToDelete
            ? segmentToDelete.personaCount > 0
              ? `This segment has ${segmentToDelete.personaCount} attached persona${segmentToDelete.personaCount === 1 ? "" : "s"}. The segment and its personas will be permanently deleted.`
              : `"${segmentToDelete.segment.name}" will be permanently deleted.`
            : ""
        }
        confirmLabel="Delete segment"
        busy={busy}
        onConfirm={() => void confirmDeleteSegment()}
        onCancel={() => setSegmentToDelete(null)}
      />

      <ConfirmDialog
        open={Boolean(personaToDelete)}
        title="Delete persona?"
        description={
          personaToDelete ? `"${personaToDelete.name}" will be permanently deleted.` : ""
        }
        confirmLabel="Delete persona"
        busy={busy}
        onConfirm={() => void confirmDeletePersona()}
        onCancel={() => setPersonaToDelete(null)}
      />
    </div>
  );
}

function InsightRow({ insight }: { insight: { tone: "positive" | "warning" | "info"; message: string } }) {
  const toneStyles = {
    positive: "border-emerald-400/20 bg-emerald-500/[0.06] text-emerald-200",
    warning: "border-amber-400/20 bg-amber-500/[0.06] text-amber-200",
    info: "border-sky-400/20 bg-sky-500/[0.06] text-sky-200",
  } as const;
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm leading-relaxed",
        toneStyles[insight.tone],
      )}
    >
      <Icon name={insight.tone === "positive" ? "check" : "info"} className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{insight.message}</span>
    </div>
  );
}

function AudienceSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <div className="h-8 w-56 rounded-xl bg-white/[0.04]" />
      <div className="mt-3 h-4 w-80 rounded-lg bg-white/[0.03]" />
      <div className="mt-8 h-12 rounded-2xl bg-white/[0.03]" />
      <div className="mt-8 h-64 rounded-3xl bg-white/[0.03]" />
    </div>
  );
}