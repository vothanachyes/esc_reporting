import type { SlideCard, ContentTable, AnimationType } from "@/data/types";
import {
  extractFeaturesTableData,
  extractOtherTypesTableData,
  extractTodoTableData,
} from "./tableDataExtractor";

// Animation presets for appendix slides
const appendixAnimations: { in: AnimationType[]; out: AnimationType[] }[] = [
  { in: ["fade", "slideUp"], out: ["fade", "slideUp"] },
  { in: ["fade", "slideDown"], out: ["fade", "slideUp"] },
  { in: ["fade", "scale"], out: ["fade", "scale"] },
];

let animationIndex = 0;

function getNextAnimation(): { in: AnimationType[]; out: AnimationType[] } {
  const anim = appendixAnimations[animationIndex % appendixAnimations.length];
  animationIndex++;
  return anim;
}

/**
 * Generate 3 appendix slides with summary tables
 */
export function generateAppendixSlides(slides: SlideCard[]): SlideCard[] {
  const appendixSlides: SlideCard[] = [];

  // Reset animation index for consistency
  animationIndex = 0;

  // 1. Features Summary Table
  const featuresData = extractFeaturesTableData(slides);
  if (featuresData.length > 0) {
    const anim1 = getNextAnimation();
    const featuresTable: ContentTable = {
      type: "table",
      rows: featuresData,
    };

    appendixSlides.push({
      title: "Features Summary",
      subtitle: [`Total: ${featuresData.length} items`],
      content: featuresTable,
      animationIn: anim1.in,
      animationOut: anim1.out,
      pageIndex: 0, // Will be updated later
      type: "Appendix",
    });
  }

  // 2. Improvements & Other Types Summary Table
  const otherTypesData = extractOtherTypesTableData(slides);
  if (otherTypesData.length > 0) {
    const anim2 = getNextAnimation();
    const otherTypesTable: ContentTable = {
      type: "table",
      rows: otherTypesData,
    };

    appendixSlides.push({
      title: "Improvements & Other Types Summary",
      subtitle: [`Total: ${otherTypesData.length} items`],
      content: otherTypesTable,
      animationIn: anim2.in,
      animationOut: anim2.out,
      pageIndex: 0, // Will be updated later
      type: "Appendix",
    });
  }

  // 3. Todo Items Summary Table
  const todoData = extractTodoTableData(slides);
  if (todoData.length > 0) {
    const anim3 = getNextAnimation();
    const todoTable: ContentTable = {
      type: "table",
      rows: todoData,
    };

    appendixSlides.push({
      title: "Todo Items Summary",
      subtitle: [`Total: ${todoData.length} items`],
      content: todoTable,
      animationIn: anim3.in,
      animationOut: anim3.out,
      pageIndex: 0, // Will be updated later
      type: "Appendix",
    });
  }

  return appendixSlides;
}

