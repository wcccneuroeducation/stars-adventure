import { footballSettings as config } from '../settings/football.js';

// Narrative flags persist across matches/scene changes, not hydration depletion.
export function footballHydrationEffects(state) {
  state.footballThoughts ??= {thirsty:false,tired:false};
  const value=state.hydration,flags=state.footballThoughts;
  if(value<=config.stopThreshold){flags.thirsty=true;flags.tired=true;return 'stop';}
  if(value<=config.tiredThreshold&&!flags.tired){flags.thirsty=true;flags.tired=true;return 'tired';}
  if(value<=config.thirstyThreshold&&!flags.thirsty){flags.thirsty=true;return 'thirsty';}
  return null;
}
export function footballSpeed(state) {
  return 150*(state.hydration<=config.tiredThreshold?config.tiredSpeedMultiplier:1);
}
