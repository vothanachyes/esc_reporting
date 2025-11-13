import Fuse from "fuse.js";
import type { SlideCard, ContentItem, ContentStats, ContentTable } from "@/data/types";

export type MatchIndices = [number, number][];

export type SearchResult = {
  slide: SlideCard;
  reportLabel: string;
  reportPath: string;
  pageIndex: number;
  matchScore: number;
  matchedFields: string[];
  searchableText: string;
  titleMatches?: MatchIndices;
  contentMatches?: MatchIndices;
  contentText?: string; // The actual content text for highlighting
};

type ReportSearchData = {
  slides: SlideCard[];
  reportLabel: string;
  reportPath: string;
};

/**
 * Extract all searchable text from a slide
 */
function extractSearchableText(slide: SlideCard): string {
  const parts: string[] = [];

  // Add title
  if (slide.title) {
    parts.push(slide.title);
  }

  // Add subtitle (can be string or array)
  if (slide.subtitle) {
    if (Array.isArray(slide.subtitle)) {
      parts.push(...slide.subtitle);
    } else {
      parts.push(slide.subtitle);
    }
  }

  // Add content based on type
  if (typeof slide.content === "string") {
    // Remove HTML tags for search
    const textContent = slide.content.replace(/<[^>]*>/g, "");
    parts.push(textContent);
  } else if (Array.isArray(slide.content)) {
    // ContentItem[]
    slide.content.forEach((item: ContentItem) => {
      if (item.title) parts.push(item.title);
      if (item.description) parts.push(item.description);
      if (item.points) {
        parts.push(...item.points);
      }
    });
  } else if (typeof slide.content === "object" && slide.content !== null) {
    if ("type" in slide.content) {
      if (slide.content.type === "stats") {
        const stats = slide.content as ContentStats;
        if (stats.text) parts.push(stats.text);
        if (stats.stats) {
          stats.stats.forEach((stat) => {
            if (stat.label) parts.push(stat.label);
            if (stat.value) parts.push(String(stat.value));
          });
        }
      } else if (slide.content.type === "table") {
        const table = slide.content as ContentTable;
        if (table.rows) {
          table.rows.forEach((row) => {
            if (row.title) parts.push(row.title);
            if (row.description) parts.push(row.description);
            if (row.points) {
              parts.push(...row.points);
            }
          });
        }
      }
    }
  }

  return parts.join(" ");
}

/**
 * Extract only content text (without title/subtitle) for highlighting
 */
function extractContentText(slide: SlideCard): string {
  const parts: string[] = [];

  // Add content based on type (same as extractSearchableText but without title/subtitle)
  if (typeof slide.content === "string") {
    const textContent = slide.content.replace(/<[^>]*>/g, "");
    parts.push(textContent);
  } else if (Array.isArray(slide.content)) {
    slide.content.forEach((item: ContentItem) => {
      if (item.title) parts.push(item.title);
      if (item.description) parts.push(item.description);
      if (item.points) {
        parts.push(...item.points);
      }
    });
  } else if (typeof slide.content === "object" && slide.content !== null) {
    if ("type" in slide.content) {
      if (slide.content.type === "stats") {
        const stats = slide.content as ContentStats;
        if (stats.text) parts.push(stats.text);
        if (stats.stats) {
          stats.stats.forEach((stat) => {
            if (stat.label) parts.push(stat.label);
            if (stat.value) parts.push(String(stat.value));
          });
        }
      } else if (slide.content.type === "table") {
        const table = slide.content as ContentTable;
        if (table.rows) {
          table.rows.forEach((row) => {
            if (row.title) parts.push(row.title);
            if (row.description) parts.push(row.description);
            if (row.points) {
              parts.push(...row.points);
            }
          });
        }
      }
    }
  }

  return parts.join(" ");
}

/**
 * Create search index from report data
 */
function createSearchIndex(reports: ReportSearchData[]): Fuse<SearchResult> {
  // Flatten all slides with their report info
  const searchableItems: SearchResult[] = [];

  reports.forEach((report) => {
    report.slides.forEach((slide) => {
      const searchableText = extractSearchableText(slide);
      // Extract just the content part (without title/subtitle) for highlighting
      const contentText = extractContentText(slide);
      searchableItems.push({
        slide,
        reportLabel: report.reportLabel,
        reportPath: report.reportPath,
        pageIndex: slide.pageIndex ?? 0,
        matchScore: 0,
        matchedFields: [],
        searchableText,
        contentText,
      });
    });
  });

  // Configure Fuse.js for fuzzy search
  const fuse = new Fuse(searchableItems, {
    keys: [
      { name: "slide.title", weight: 0.4 },
      { name: "searchableText", weight: 0.6 },
    ],
    threshold: 0.5, // 0.0 = exact match, 1.0 = match anything
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    ignoreLocation: true,
    findAllMatches: true,
  });

  return fuse;
}

/**
 * Global search composable
 * @param reports Array of report data to search through
 * @param currentMode Current mode ('mini' or 'detail') to filter results (can be reactive)
 */
export function useGlobalSearch(
  reports: ReportSearchData[],
  currentMode: "mini" | "detail" | (() => "mini" | "detail")
) {
  // Get mode value (handle both static and reactive)
  const getMode = (): "mini" | "detail" => {
    return typeof currentMode === "function" ? currentMode() : currentMode;
  };

  // Filter reports by current mode
  const getFilteredReports = (): ReportSearchData[] => {
    const mode = getMode();
    return reports.filter((report) => {
      const isMini = report.reportPath.includes("_mini.json");
      return mode === "mini" ? isMini : !isMini;
    });
  };

  /**
   * Perform search query
   */
  const search = (query: string, limit: number = 50): SearchResult[] => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    // Get filtered reports based on current mode
    const filteredReports = getFilteredReports();
    const searchIndex = createSearchIndex(filteredReports);
    const results = searchIndex.search(query.trim(), { limit });

    return results.map((result) => {
      const matchedFields: string[] = [];
      let titleMatches: MatchIndices | undefined;
      let contentMatches: MatchIndices | undefined;

      if (result.matches) {
        result.matches.forEach((match) => {
          if (match.key === "slide.title" && match.indices) {
            matchedFields.push("title");
            titleMatches = match.indices as MatchIndices;
          } else if (match.key === "searchableText" && match.indices) {
            matchedFields.push("content");
            // Adjust indices from searchableText to contentText
            const searchableText = result.item.searchableText;
            const contentText = result.item.contentText || "";
            
            // Find where content starts in searchableText
            // searchableText is created by joining parts with " "
            const titlePart = result.item.slide.title || "";
            const subtitlePart = Array.isArray(result.item.slide.subtitle)
              ? result.item.slide.subtitle.join(" ")
              : result.item.slide.subtitle || "";
            
            // Calculate prefix: title + space (if subtitle exists) + subtitle + space (if content exists)
            let prefixLength = 0;
            if (titlePart) {
              prefixLength += titlePart.length;
              if (subtitlePart || contentText) prefixLength += 1; // space
            }
            if (subtitlePart) {
              prefixLength += subtitlePart.length;
              if (contentText) prefixLength += 1; // space
            }
            
            // Adjust indices to be relative to contentText
            const adjustedMatches: MatchIndices = (match.indices as MatchIndices)
              .map(([start, end]) => {
                // Only include matches that are in the content part
                if (start >= prefixLength && contentText.length > 0) {
                  const adjustedStart = start - prefixLength;
                  const adjustedEnd = Math.min(end - prefixLength, contentText.length - 1);
                  if (adjustedStart >= 0 && adjustedEnd >= adjustedStart) {
                    return [adjustedStart, adjustedEnd] as [number, number];
                  }
                }
                return null;
              })
              .filter((match): match is [number, number] => match !== null);
            
            if (adjustedMatches.length > 0) {
              contentMatches = adjustedMatches;
            }
          }
        });
      }

      return {
        ...result.item,
        matchScore: result.score ?? 1,
        matchedFields: Array.from(new Set(matchedFields)),
        titleMatches,
        contentMatches,
      };
    });
  };

  return {
    search,
  };
}

