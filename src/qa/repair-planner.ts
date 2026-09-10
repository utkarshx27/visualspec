import { QAReport, RepairAction, RepairPlan } from "../types/qa.js";
import { ResolvedVisualSpec, TextScale } from "../types/spec.js";

const SCALE_DOWN: Record<TextScale, TextScale> = {
  "3xl": "2xl",
  "2xl": "xl",
  xl: "lg",
  lg: "md",
  md: "sm",
  sm: "xs",
  xs: "xs",
};

export function planRepairs(qaReport: QAReport, spec: ResolvedVisualSpec): RepairPlan {
  if (qaReport.passed) {
    return {
      feasible: true,
      actions: [],
      summary: "All QA checks passed. No repair needed.",
    };
  }

  const actions: RepairAction[] = [];
  const failedChecks = qaReport.checks.filter(c => !c.passed);

  for (const check of failedChecks) {
    if (check.checkId.startsWith("max_lines_")) {
      const key = (check.details as any)?.key || "headline";
      const currentScale = spec.resolvedText[key]?.typography?.scale || "xl";
      const nextScale = SCALE_DOWN[currentScale];

      actions.push({
        type: "rerender_text",
        target: key,
        reason: `Text '${key}' exceeded line budget. Reducing typography scale from '${currentScale}' to '${nextScale}'.`,
        suggestedPatch: {
          [`text.${key}.typography.scale`]: nextScale,
        },
      });
    } else if (check.checkId.startsWith("safe_margin_compliance_")) {
      const key = (check.details as any)?.key || "headline";
      const currentScale = spec.resolvedText[key]?.typography?.scale || "xl";
      const nextScale = SCALE_DOWN[currentScale];

      actions.push({
        type: "adjust_layout",
        target: key,
        reason: `Element '${key}' breached safe margin boundary. Adjusting scale to '${nextScale}' and recomputing region.`,
        suggestedPatch: {
          [`text.${key}.typography.scale`]: nextScale,
        },
      });
    } else if (check.checkId.startsWith("required_slot_")) {
      const slot = check.checkId.replace("required_slot_", "");
      actions.push({
        type: "recompile_spec",
        target: slot,
        reason: `Required slot '${slot}' is missing. Recompiling visual spec to supply slot content.`,
        suggestedPatch: {
          [`text.${slot}`]: { content: `Default ${slot} content`, exact: true },
        },
      });
    } else if (check.checkId === "output_dimensions_match") {
      actions.push({
        type: "rerender_text",
        reason: "Output canvas dimensions did not match target spec. Re-exporting with explicit dimensions.",
        suggestedPatch: {
          "canvas.width": spec.canvas.width,
          "canvas.height": spec.canvas.height,
        },
      });
    }
  }

  // Deduplicate actions for same target
  const uniqueActions: RepairAction[] = [];
  const seenTargets = new Set<string>();
  for (const act of actions) {
    const id = `${act.type}:${act.target || ""}`;
    if (!seenTargets.has(id)) {
      seenTargets.add(id);
      uniqueActions.push(act);
    }
  }

  const summary =
    uniqueActions.length > 0
      ? `Found ${uniqueActions.length} targeted repair action(s). Localized repairs can be applied deterministically without regenerating base images.`
      : "Failures require regenerating base visual assets or updating spec.";

  return {
    feasible: uniqueActions.length > 0,
    actions: uniqueActions,
    summary,
  };
}
