import type { SlideCard, TableRow, ContentItem } from "@/data/types";

/**
 * Get status priority for sorting (lower number = higher priority)
 */
function getStatusPriority(status: "done" | "todo" | "in-progress"): number {
  switch (status) {
    case "done":
      return 1;
    case "in-progress":
      return 2;
    case "todo":
      return 3;
    default:
      return 4;
  }
}

/**
 * Sort table rows by status priority (done → in-progress → todo), then by title
 */
export function sortByStatus(items: TableRow[]): TableRow[] {
  return [...items].sort((a, b) => {
    const statusDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
    if (statusDiff !== 0) {
      return statusDiff;
    }
    // If same status, sort by title alphabetically
    return a.title.localeCompare(b.title);
  });
}

/**
 * Extract content items from a slide and convert to table rows
 */
function extractItemsFromSlide(slide: SlideCard): TableRow[] {
  const rows: TableRow[] = [];

  // Only process slides with ContentItem[] content
  if (!Array.isArray(slide.content)) {
    return rows;
  }

  for (const item of slide.content) {
    // Check if it's a ContentItem (has status and title)
    if (typeof item === "object" && "status" in item && "title" in item) {
      const contentItem = item as ContentItem;
      rows.push({
        status: contentItem.status,
        title: contentItem.title,
        description: contentItem.description,
        slideTitle: slide.title,
        doneDate: contentItem.doneDate,
        points: contentItem.points,
      });
    }
  }

  return rows;
}

/**
 * Extract all items from slides with type === "Feature"
 */
export function extractFeaturesTableData(slides: SlideCard[]): TableRow[] {
  const rows: TableRow[] = [];

  for (const slide of slides) {
    if (slide.type === "Feature") {
      const slideRows = extractItemsFromSlide(slide);
      rows.push(...slideRows);
    }
  }

  return sortByStatus(rows);
}

/**
 * Extract items from slides where type is not "Feature", "Introduction", "Closing", or "Image"
 */
export function extractOtherTypesTableData(slides: SlideCard[]): TableRow[] {
  const rows: TableRow[] = [];
  const excludedTypes = ["Feature", "Introduction", "Closing", "Image"];

  for (const slide of slides) {
    if (slide.type && !excludedTypes.includes(slide.type)) {
      const slideRows = extractItemsFromSlide(slide);
      rows.push(...slideRows);
    }
  }

  return sortByStatus(rows);
}

/**
 * Extract all items with status === "todo" from both Features and Other Types
 */
export function extractTodoTableData(slides: SlideCard[]): TableRow[] {
  const featuresRows = extractFeaturesTableData(slides);
  const otherTypesRows = extractOtherTypesTableData(slides);

  const allRows = [...featuresRows, ...otherTypesRows];
  const todoRows = allRows.filter((row) => row.status === "todo");

  // Sort by title since all are todo
  return todoRows.sort((a, b) => a.title.localeCompare(b.title));
}

