// Typing module - state machine for typing sessions

// Types
export * from "./types";

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

// Hook
export { useTypingStateMachine } from "./useTypingStateMachine";
