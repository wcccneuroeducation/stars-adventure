// Interface and scenario copy, independent of hydration calculations.
export const streetText = {
  hydration: 'Hydration',
  fictional: 'Fictional game status — not a clinical measurement',
  backpack: 'Backpack',
  drink: 'Drink water',
  bottleSips: (remaining, capacity) => `Water Bottle — ${remaining}/${capacity} sips`,
  pause: 'Pause',
  paused: 'Paused',
  pausedMessage: 'The adventure is paused.',
  resume: 'Continue',
  park: 'Park entrance',
  parkPrompt: '[ E ] ENTER PARK',
  parkHint: 'Park entrance · press E or tap INTERACT',
  parkWelcome: 'Welcome to Small Heath Park! This is where the next part of the adventure will begin.',
  close: 'Close'
};
