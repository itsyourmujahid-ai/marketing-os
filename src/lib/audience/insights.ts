import type { AudienceInsight, AudienceRecommendation, AudienceState } from "./types";

/** Rule-based insights, always derived from the actual saved audience data. */
export function buildAudienceInsights(state: AudienceState): AudienceInsight[] {
  const { segments, personas } = state;
  const insights: AudienceInsight[] = [];

  if (segments.length === 0) {
    insights.push({
      id: "empty-state",
      tone: "info",
      message:
        "You have not defined any audience segments yet. Segments are the building blocks personas and campaigns rely on.",
    });
    return insights;
  }

  const anyPains = segments.some((s) => s.painPoints.length > 0);
  const allPains = segments.every((s) => s.painPoints.length === 0);
  const anyTriggers = segments.some((s) => s.buyingTriggers.length > 0);
  const anyChannels = segments.some((s) => s.preferredChannels.length > 0);
  const anyPrimary = segments.some((s) => s.role === "Primary");
  const anyActive = segments.some((s) => s.status === "Active");

  if (anyPains && !allPains) {
    insights.push({
      id: "pains-defined",
      tone: "positive",
      message:
        "Pain points are documented for your audience — messaging can directly address the problems you solve.",
    });
  }
  if (personas.length > 0) {
    insights.push({
      id: "personas-defined",
      tone: "positive",
      message:
        `${personas.length} persona${personas.length === 1 ? "" : "s"} bring your segments to life with day-to-day detail.`,
    });
  }
  if (anyTriggers) {
    insights.push({
      id: "triggers-defined",
      tone: "positive",
      message: "Buying triggers are recorded, so campaigns can target moments when your audience is most ready to act.",
    });
  }

  if (allPains && !anyPains) {
    insights.push({
      id: "no-pains",
      tone: "warning",
      message:
        "No segment documents the problems it faces. Add pain points so offers and content can speak to real needs.",
    });
  }
  if (!anyTriggers) {
    insights.push({
      id: "no-triggers",
      tone: "warning",
      message:
        "Buying triggers are missing everywhere. Without them it is hard to say why someone would buy now.",
    });
  }
  if (anyTriggers && !anyChannels) {
    insights.push({
      id: "triggers-no-channels",
      tone: "info",
      message:
        "You know what pushes your audience to buy, but not where to reach them — define preferred channels.",
    });
  }
  if (!anyPrimary) {
    insights.push({
      id: "no-primary",
      tone: "warning",
      message:
        `No segment is marked as Primary${segments.length > 1 ? " — with " + segments.length + " segments, campaigns need a priority target" : ""}.`,
    });
  }
  if (!anyActive) {
    insights.push({
      id: "no-active",
      tone: "info",
      message: "All segments are drafts. Activate at least one so campaigns and dashboards can treat it as live.",
    });
  }
  if (personas.length === 0) {
    insights.push({
      id: "no-personas",
      tone: "warning",
      message:
        "No personas have been created from your segments. Personas turn segment data into a person you can write to.",
    });
  }

  return insights.slice(0, 6);
}

/** Actionable recommendations for missing pieces, ranked by importance. */
export function buildAudienceRecommendations(state: AudienceState): AudienceRecommendation[] {
  const { segments, personas } = state;
  const recs: AudienceRecommendation[] = [];

  if (segments.length === 0) {
    return [
      {
        id: "first-segment",
        missing: "Audience segments",
        recommendation:
          "Define your first segment — name who you sell to and mark the audience type (B2B or B2C).",
      },
    ];
  }

  const needsDecisionMaker = segments.some(
    (s) => s.audienceType === "B2B" && (!s.decisionMakerRole || s.decisionMakerRole.trim() === ""),
  );
  if (needsDecisionMaker) {
    recs.push({
      id: "decision-maker",
      missing: "Decision maker",
      recommendation:
        "Name who approves purchases in each B2B segment so outreach reaches the person who signs off.",
    });
  }

  const missingTriggers = segments.filter((s) => s.buyingTriggers.length === 0);
  if (missingTriggers.length > 0) {
    recs.push({
      id: "buying-triggers",
      missing: "Buying triggers",
      recommendation:
        "Document what pushes this audience to buy — a trigger is the moment your message has the most leverage.",
    });
  }

  const missingPains = segments.filter((s) => s.painPoints.length === 0);
  if (missingPains.length > 0) {
    recs.push({
      id: "pain-points",
      missing: "Pain points",
      recommendation:
        "Add the problems each segment faces so offers and content can address real needs instead of guesses.",
    });
  }

  const missingChannels = segments.filter((s) => s.preferredChannels.length === 0);
  if (missingChannels.length > 0) {
    recs.push({
      id: "channels",
      missing: "Preferred channels",
      recommendation:
        "Record where each segment spends time so campaigns are placed where the audience actually is.",
    });
  }

  const missingObjections = segments.filter((s) => s.objections.length === 0);
  if (missingObjections.length > 0) {
    recs.push({
      id: "objections",
      missing: "Objections",
      recommendation:
        "List common objections per segment so future copy and offers can pre-empt the reasons for hesitation.",
    });
  }

  if (!segments.some((s) => s.role === "Primary")) {
    recs.push({
      id: "primary-segment",
      missing: "Primary segment",
      recommendation:
        "Mark your most important segment as Primary — campaigns and dashboards use it as the priority target.",
    });
  }

  if (!segments.some((s) => s.status === "Active")) {
    recs.push({
      id: "active-status",
      missing: "Active segments",
      recommendation:
        "Activate at least one segment so the Workspace can treat your audience as live for campaigns.",
    });
  }

  if (personas.length === 0) {
    recs.push({
      id: "create-personas",
      missing: "Personas",
      recommendation:
        "Create personas from your segments — a named, detailed buyer makes every piece of marketing more concrete.",
    });
  }

  return recs.slice(0, 8);
}