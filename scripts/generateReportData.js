import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple markdown parser for generating JSON
function parseMarkdownToJSON(markdown) {
  const mainWrapper = {
    title: "October Task Report - October 1-31, 2025",
    handler: {
      name: "Vothana CHY",
      avatar: "",
      role: "Developer",
    },
    teamLeader: {
      name: "Team Leader",
      avatar: "",
      role: "Team Leader",
    },
    period: "October 1-31, 2025",
    statistics: {
      totalTasks: 0,
      completedTasks: 0,
      features: 13,
      refactorings: 7,
    },
  };

  const slides = [];

  // This is a placeholder - the actual parsing will be done by the TypeScript parser
  // This script is just to generate the initial structure

  return {
    mainWrapper,
    slides,
  };
}

// Read markdown file
const markdownPath = resolve(__dirname, "../../z_sandbox/monthlyPlan/October_2025_Report.md");
const markdown = readFileSync(markdownPath, "utf-8");

// Parse and generate JSON
const reportData = parseMarkdownToJSON(markdown);

// Write JSON file
const outputPath = resolve(__dirname, "../src/data/octoberReport.json");
writeFileSync(outputPath, JSON.stringify(reportData, null, 2), "utf-8");

console.log("✅ Report data generated successfully!");
console.log(`📄 Output: ${outputPath}`);

