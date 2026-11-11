// Fictional game tuning: points per second, never clinical measurements.
export const playerStatusSettings=Object.freeze({
 maxFrameMs:250,
 hydrationPerSecond:.025,
 walkingHydrationPerSecond:.08,
 sunnyOutdoorMultiplier:1.25,
 exertion:{running:{hydration:.35,tiredness:.4},football:{hydration:1.1,tiredness:1.8},pe:{hydration:.6,tiredness:1}},
 seatedRecoveryPerSecond:1,
 dedicatedRecoveryPerSecond:3,
 maxFootballSpeedReduction:.12
});
