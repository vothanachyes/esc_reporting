import type { ReportData } from "./types";
import { parseMarkdownToReportData } from "@/utils/markdownParser";

// Import the markdown file
// In a real scenario, you'd fetch this or import it
// For now, we'll create a function to load it

let reportData: ReportData | null = null;

export async function loadReportDataFromMarkdown(): Promise<ReportData> {
  if (reportData) {
    return reportData;
  }

  try {
    // Fetch the markdown file
    const response = await fetch("/z_sandbox/monthlyPlan/October_2025_Report.md");
    if (!response.ok) {
      throw new Error("Failed to fetch markdown file");
    }
    const markdown = await response.text();
    reportData = parseMarkdownToReportData(markdown);
    return reportData;
  } catch (error) {
    console.error("Error loading report data:", error);
    // Return default/fallback data
    return getDefaultReportData();
  }
}

export function loadReportData(data: ReportData): void {
  reportData = data;
}

export function getReportData(): ReportData | null {
  return reportData;
}

function getDefaultReportData(): ReportData {
  return {
    mainWrapper: {
      title: "October Task Report",
      handler: {
        name: "Vothana CHY",
        avatar: "",
      },
      teamLeader: {
        name: "Team Leader",
        avatar: "",
      },
      period: "October 1-31, 2025",
      statistics: {
        totalTasks: 0,
        completedTasks: 0,
        features: 13,
        refactorings: 7,
      },
    },
    slides: [],
  };
}

// Export function to generate JSON from markdown
export async function generateJSONFromMarkdown(): Promise<string> {
  const data = await loadReportDataFromMarkdown();
  return JSON.stringify(data, null, 2);
}
