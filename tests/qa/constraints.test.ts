import { describe, it, expect } from "vitest";
import { checkConstraints } from "../../src/qa/constraint-checker.js";
import { planRepairs } from "../../src/qa/repair-planner.js";
import { resolveSpec } from "../../src/core/resolve-spec.js";
import { VisualSpec } from "../../src/types/spec.js";

describe("QA Constraint Checker & Repair Planner", () => {
  it("passes QA checks for a well-formed spec within line and margin budgets", () => {
    const spec: VisualSpec = {
      version: "0.1",
      asset: { platform: "instagram", format: "feed_portrait" },
      text: {
        headline: {
          content: "Launch Day is Here",
          exact: true,
          max_lines: 2,
          placement: "upper_third",
        },
      },
    };

    const resolved = resolveSpec(spec);
    const report = checkConstraints(resolved);

    expect(report.passed).toBe(true);
    expect(report.failedChecks).toBe(0);
    expect(report.checks.some(c => c.checkId === "dimensions_valid")).toBe(true);
    expect(report.checks.some(c => c.checkId === "safe_margins_feasible")).toBe(true);
    expect(report.checks.some(c => c.checkId === "exact_text_headline")).toBe(true);
  });

  it("detects line budget overflow and generates targeted repair plan", () => {
    const overflowingSpec: VisualSpec = {
      version: "0.1",
      asset: { platform: "instagram", format: "feed_portrait" },
      text: {
        headline: {
          content: "This headline is intentionally written to be absurdly long so that it will exceed the single line budget and trigger QA failure.",
          exact: true,
          max_lines: 1, // Only 1 line allowed
          placement: "upper_third",
          typography: {
            scale: "xl",
          },
        },
      },
    };

    const resolved = resolveSpec(overflowingSpec);
    const report = checkConstraints(resolved);

    expect(report.passed).toBe(false);
    expect(report.failedChecks).toBeGreaterThan(0);

    const plan = planRepairs(report, resolved);
    expect(plan.feasible).toBe(true);
    expect(plan.actions.some(a => a.type === "rerender_text")).toBe(true);
    expect(plan.actions[0].suggestedPatch?.["text.headline.typography.scale"]).toBe("lg");
  });
});
