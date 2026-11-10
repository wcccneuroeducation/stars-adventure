// Fictional game tuning, not physiological or clinical measurements.
export const hydrationSettings = Object.freeze({
  initial: 100,
  // About 20 points over the ~1,780px direct doorstep-to-park walk at 150px/s.
  // Applied only to resolved walking distance, never idle real-world time.
  pointsPerSecond: 1.7,
  drinkAmount: 25,
  walkingSpeed: 150
});
