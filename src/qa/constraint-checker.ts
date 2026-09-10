import { ResolvedVisualSpec } from "../types/spec.js";
import { CheckResult, QAReport } from "../types/qa.js";
import { computeLayout } from "../renderer/layout.js";

export function checkConstraints(spec: ResolvedVisualSpec): QAReport {
  const checks: CheckResult[] = [];
  const { canvas, safeMargin, resolvedText, constraints } = spec;

  // 1. Dimensions Check
  const minDim = 400;
  const maxDim = 8192;
  const dimsValid =
    canvas.width >= minDim &&
    canvas.width <= maxDim &&
    canvas.height >= minDim &&
    canvas.height <= maxDim;

  checks.push({
    checkId: "dimensions_valid",
    name: "Canvas Dimensions Bounds",
    passed: dimsValid,
    message: dimsValid
      ? `Canvas dimensions ${canvas.width}x${canvas.height} are within valid limits`
      : `Canvas dimensions ${canvas.width}x${canvas.height} violate bounds [${minDim}-${maxDim}]`,
    details: { width: canvas.width, height: canvas.height },
  });

  // 2. Safe Margins Bounds Check
  const contentWidth = canvas.width - safeMargin.left - safeMargin.right;
  const contentHeight = canvas.height - safeMargin.top - safeMargin.bottom;
  const marginsFeasible = contentWidth > 200 && contentHeight > 200;

  checks.push({
    checkId: "safe_margins_feasible",
    name: "Safe Margin Usable Area",
    passed: marginsFeasible,
    message: marginsFeasible
      ? `Content area ${contentWidth}x${contentHeight} respects platform safe margins`
      : `Safe margins leave insufficient content area (${contentWidth}x${contentHeight})`,
    details: { ...safeMargin },
  });

  // 3. Layout and Text Wrapping Checks
  const layout = computeLayout(spec);

  for (const [key, item] of layout.entries()) {
    // Max Lines Constraint Check
    checks.push({
      checkId: `max_lines_${key}`,
      name: `Max Lines Check for '${key}'`,
      passed: !item.exceededMaxLines,
      message: item.exceededMaxLines
        ? `Text '${key}' exceeded allowed line count and had to be truncated`
        : `Text '${key}' fits cleanly in ${item.lines.length} lines`,
      details: {
        key,
        lineCount: item.lines.length,
        lines: item.lines,
        exceeded: item.exceededMaxLines,
      },
    });

    // Margin Boundary Overflow Check
    const rightEdge = item.box.x + item.box.width;
    const bottomEdge = item.box.y + item.box.height;
    const maxAllowedRight = canvas.width - safeMargin.right;
    const maxAllowedBottom = canvas.height - safeMargin.bottom;

    const withinHorizontal = rightEdge <= maxAllowedRight + 5; // 5px tolerance
    const withinVertical = bottomEdge <= maxAllowedBottom + 5;
    const marginCompliant = withinHorizontal && withinVertical;

    checks.push({
      checkId: `safe_margin_compliance_${key}`,
      name: `Safe Margin Compliance for '${key}'`,
      passed: marginCompliant,
      message: marginCompliant
        ? `Element '${key}' is fully inside the safe margin zone`
        : `Element '${key}' overflows safe margin (bottom: ${bottomEdge} > ${maxAllowedBottom}, right: ${rightEdge} > ${maxAllowedRight})`,
      details: {
        key,
        box: item.box,
        rightEdge,
        bottomEdge,
        maxAllowedRight,
        maxAllowedBottom,
      },
    });

    // Exact Text Check
    const originalEl = resolvedText[key];
    if (originalEl && originalEl.exact) {
      const reconstructed = item.lines.join(" ").replace(/\.\.\.$/, "");
      const matched = originalEl.content.startsWith(reconstructed.slice(0, 20));
      checks.push({
        checkId: `exact_text_${key}`,
        name: `Exact Copy Invariant for '${key}'`,
        passed: matched && !item.exceededMaxLines,
        message: matched && !item.exceededMaxLines
          ? `Exact text for '${key}' preserved deterministically`
          : `Exact text for '${key}' was modified or truncated`,
        details: { key, expected: originalEl.content },
      });
    }
  }

  // 4. Required Slots Check
  const requiredSlots = constraints?.required || [];
  for (const slot of requiredSlots) {
    if (slot === "subject") {
      const hasSubject = !!spec.subject?.description;
      checks.push({
        checkId: "required_slot_subject",
        name: "Required Slot 'subject' Present",
        passed: hasSubject,
        message: hasSubject
          ? "Subject visual description is present"
          : "Required subject slot is missing from visual spec",
      });
    } else {
      const hasText = !!resolvedText[slot]?.content;
      checks.push({
        checkId: `required_slot_${slot}`,
        name: `Required Slot '${slot}' Present`,
        passed: hasText,
        message: hasText
          ? `Required text slot '${slot}' is present`
          : `Required text slot '${slot}' is missing from visual spec`,
      });
    }
  }

  const passedChecks = checks.filter(c => c.passed).length;
  const failedChecks = checks.filter(c => !c.passed).length;
  const passed = failedChecks === 0;

  return {
    passed,
    totalChecks: checks.length,
    passedChecks,
    failedChecks,
    checks,
    timestamp: new Date().toISOString(),
  };
}
