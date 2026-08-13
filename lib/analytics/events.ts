export type AnalyticsEvent = "lesson_viewed" | "lesson_completed" | "experiment_started" | "experiment_completed" | "practice_answered" | "practice_correct" | "lab_started" | "lab_step_completed" | "lab_completed" | "capstone_phase_completed" | "game_started" | "game_completed" | "game_replayed" | "game_debrief_action_clicked" | "visitor_session_reset";

export type AnalyticsPayload = { event: AnalyticsEvent; properties?: Record<string, string | number | boolean>; timestamp: string };

export function createAnalyticsPayload(event: AnalyticsEvent, properties?: AnalyticsPayload["properties"]): AnalyticsPayload { return { event, properties, timestamp: new Date().toISOString() }; }

export function trackAnalytics(event: AnalyticsEvent, properties?: AnalyticsPayload["properties"]) { const payload = createAnalyticsPayload(event, properties); if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("fde:analytics", { detail: payload })); return payload; }
