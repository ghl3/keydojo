// Typing module - state machine for typing sessions

// Types
export * from "./typingState";

// Reducer
export { typingReducer, createInitialState } from "./typingReducer";

// Selectors
export {
  findFirstErrorIndex,
  computeVisualState,
  deriveVisualState,
  visualStateToClassName,
  countMistakes,
  calculateAccuracy,
} from "./typingSelectors";

// Session helpers
export {
  createDefaultBoundaryErrorState,
  createDefaultLiveStats,
  calculateGrossWPM,
  calculateLiveStatsFromState,
  buildSessionResult,
  IDLE_THRESHOLD_MS,
} from "./sessionHelpers";
export type {
  BoundaryErrorState,
  UseTypingStateMachineOptions,
  BuildSessionResultParams,
} from "./sessionHelpers";
