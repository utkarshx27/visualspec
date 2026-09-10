import { VisualSpec } from "../types/spec.js";

export function analyzeBrief(briefText: string): VisualSpec {
  const text = briefText.trim();
  const lower = text.toLowerCase();

  // Detect platform
  let platform = "generic-social";
  if (lower.includes("instagram") || lower.includes("insta")) {
    platform = "instagram";
  } else if (lower.includes("linkedin")) {
    platform = "linkedin";
  } else if (lower.includes("twitter") || lower.includes(" x ")) {
    platform = "generic-social";
  }

  // Detect template / type
  let template = "product-launch";
  let assetType = "product_launch";
  if (lower.includes("quote") || lower.includes("testimonial")) {
    template = "quote-card";
    assetType = "quote_card";
  } else if (lower.includes("stat") || lower.includes("metric") || lower.includes("data")) {
    template = "stat-card";
    assetType = "stat_card";
  } else if (lower.includes("launch") || lower.includes("announcement")) {
    template = "product-launch";
    assetType = "product_launch";
  }

  // Extract Headline
  let headline = "";
  const quotedMatch = text.match(/Headline:\s*["“'‘]([^"”'’\n\r]+)["”'’]/i);
  if (quotedMatch) {
    headline = quotedMatch[1].trim();
  } else {
    const unquotedMatch = text.match(/Headline:\s*([^\n\r]+)/i);
    if (unquotedMatch) {
      headline = unquotedMatch[1].trim().replace(/^["'“”‘’]+|["'“”‘’]+$/g, "").trim();
    } else {
      const quoteMatch = text.match(/["“'‘]([^"”'’\n\r]{10,80})["”'’]/);
      if (quoteMatch) {
        headline = quoteMatch[1].trim();
      } else {
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        headline = (lines[0] || "New Announcement").replace(/^["'“”‘’]+|["'“”‘’]+$/g, "").trim();
      }
    }
  }

  // Extract Subject / Visual description
  let subjectDesc = "";
  const subjectMatch = text.match(/(?:Subject|Visual|Product):\s*([^\n\r]+)/i);
  if (subjectMatch) {
    subjectDesc = subjectMatch[1].trim();
  } else {
    // Look for descriptive sentences
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const candidate = lines.find(l =>
      !l.toLowerCase().startsWith("headline") &&
      !l.toLowerCase().startsWith("no ") &&
      l.length > 15
    );
    subjectDesc = candidate || "minimal futuristic technology showcase";
  }

  // Detect Mood
  const moods: string[] = [];
  if (lower.includes("dark")) moods.push("dark");
  if (lower.includes("minimal")) moods.push("minimal");
  if (lower.includes("futuristic")) moods.push("futuristic");
  if (lower.includes("premium") || lower.includes("luxury")) moods.push("premium");
  if (lower.includes("playful") || lower.includes("vibrant")) moods.push("vibrant");
  if (moods.length === 0) moods.push("modern", "premium");

  // Detect Constraints
  const forbid: string[] = ["extra_text", "watermark", "fake_ui_labels"];
  if (lower.includes("no people") || lower.includes("without people") || lower.includes("no humans")) {
    forbid.push("people", "faces");
  }
  if (lower.includes("no devices") || lower.includes("no extra devices")) {
    forbid.push("extra_devices");
  }

  const spec: VisualSpec = {
    version: "0.1",
    asset: {
      id: `asset-${Date.now().toString(36)}`,
      platform,
      type: assetType,
      template,
      format: "feed_portrait",
    },
    intent: {
      objective: assetType,
      audience: "general",
      message: headline,
      mood: moods,
    },
    brand: {
      palette: {
        primary: "#6C5CE7",
        background: moods.includes("dark") ? "#09090B" : "#F8FAFC",
        text: moods.includes("dark") ? "#FFFFFF" : "#09090B",
        secondary: "#00D2FF",
      },
    },
    subject: {
      description: subjectDesc,
      placement: "lower_center",
      prominence: 0.6,
    },
    background: {
      description: `${moods.join(" ")} aesthetic atmospheric background with subtle gradient and depth`,
      style: moods[0] || "minimal",
      mood: moods.join(", "),
      texture: "subtle_grain",
    },
    composition: {
      hierarchy: ["headline", "subject", "supporting"],
      focal_point: "lower_center",
      negative_space: {
        target: "upper_third",
      },
    },
    text: {
      headline: {
        content: headline,
        exact: true,
        max_lines: 3,
        placement: "upper_third",
        alignment: "left",
        typography: {
          family_class: "grotesk",
          weight: 700,
          scale: "xl",
        },
      },
    },
    constraints: {
      required: ["headline", "subject"],
      forbid,
      preserve: [],
      exact: ["headline"],
    },
    generation: {
      image_layers: ["background", "subject"],
      deterministic_layers: ["headline"],
      variations: 1,
    },
    output: {
      format: "png",
      quality: "high",
    },
  };

  return spec;
}
