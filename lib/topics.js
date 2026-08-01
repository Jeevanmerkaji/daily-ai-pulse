// lib/topics.js
//
// The fixed list of topics someone can follow instead of the general daily
// story. This is the ONE place this list lives — the daily job loops over
// it to know which stories to generate, the account page uses it to draw
// the radio buttons, and the topic-update route uses it to reject anything
// that isn't a real topic. Add/remove a topic here and nothing else needs
// to change.

export const DEFAULT_TOPIC = "general";

export const TOPICS = [
  {
    id: "general",
    label: "General",
    description: "The single most important AI story overall — today's default.",
  },
  {
    id: "ai-safety",
    label: "AI Safety",
    description: "Risk, regulation, and safety news.",
  },
  {
    id: "robotics",
    label: "Robotics",
    description: "Physical, embodied AI and robotics news.",
  },
  {
    id: "coding-tools",
    label: "Coding Tools",
    description: "AI tools for writing and shipping software.",
  },
  {
    id: "business-applications",
    label: "Business Applications",
    description: "AI being used to run or grow a business.",
  },
];

export function isValidTopic(id) {
  return TOPICS.some((topic) => topic.id === id);
}
