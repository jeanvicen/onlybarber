type ProgressInput = {
  currentSeconds: number;
  requestedSeconds: number;
  durationSeconds: number;
};

export function updateProgress(input: ProgressInput) {
  if (
    !Number.isFinite(input.currentSeconds) ||
    !Number.isFinite(input.requestedSeconds) ||
    !Number.isFinite(input.durationSeconds) ||
    input.currentSeconds < 0 ||
    input.requestedSeconds < 0 ||
    input.durationSeconds <= 0
  ) {
    throw new Error("INVALID_PROGRESS");
  }
  const positionSeconds = Math.min(
    input.durationSeconds,
    Math.max(input.currentSeconds, input.requestedSeconds),
  );
  return {
    positionSeconds,
    completed: positionSeconds / input.durationSeconds >= 0.95,
  };
}
