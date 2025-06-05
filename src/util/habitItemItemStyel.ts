// Helper function to extract a specific style property (color or icon) from item_style

import { HabitItem } from "@/types/habit/habit_item";

// Overload signatures
export function getHabitItemItemStyleProp(
  currentHabitItem: HabitItem | undefined,
  propName: "color"
): string;
export function getHabitItemItemStyleProp(
  currentHabitItem: HabitItem | undefined,
  propName: "icon"
): string;

// Implementation
export function getHabitItemItemStyleProp(
  currentHabitItem: HabitItem | undefined,
  propName: "color" | "icon"
): string | undefined {
  const item_style = currentHabitItem?.item_style;

  if (propName === "color") {
    let color = "#3B82F6"; // Default color
    if (
      typeof item_style === "object" &&
      item_style !== null &&
      "color" in item_style &&
      typeof (item_style as { color?: unknown }).color === "string"
    ) {
      color = (item_style as { color: string }).color;
    }
    return color;
  } else if (propName === "icon") {
    let icon: string | undefined = undefined;
    if (
      typeof item_style === "object" &&
      item_style !== null &&
      "icon" in item_style &&
      typeof (item_style as { icon?: unknown }).icon === "string"
    ) {
      icon = (item_style as { icon: string }).icon;
    }
    return icon;
  }
  if (propName === "color") return "#3B82F6";
  return undefined;
}
