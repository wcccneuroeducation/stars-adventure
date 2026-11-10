// Editable scenario copy. Keep choices neutral: no scores or recommended items.
export const sunnyDayText = {
  title: 'A Sunny Day',
  eyebrow: 'KICKSTART · A SUNNY DAY',
  subtitle: 'Your bedroom',
  roomLabel: 'BEDROOM',
  roomHint: 'Bedroom',
  nearObject: name => `${name} · press E or tap INTERACT`,
  callTitle: 'Incoming call – Jay',
  ringing: 'RING RING',
  call: [
    "Hey! We're meeting at the park. It's really sunny today. Are you coming?",
    'Great! See you there!'
  ],
  continue: 'Continue',
  close: 'Close',
  objects: {
    window: 'Window', wardrobe: 'Wardrobe', water: 'Water bottle',
    hat: 'Sun hat', backpack: 'Backpack', door: 'Bedroom door'
  },
  window: 'Sunshine streams through the window. Outside, the sky is clear and it’s a hot, sunny day.',
  wardrobe: 'Choose an outfit.',
  currentOutfit: label => `Current outfit: ${label}`,
  outfits: [
    { id: 'everyday', label: 'Everyday clothes' },
    { id: 'shorts', label: 'T-shirt and shorts' },
    { id: 'long-sleeves', label: 'Long-sleeved top and trousers' }
  ],
  wear: 'Wear selected outfit',
  pickup: name => `${name}. Put it in your backpack?`,
  take: 'Put in backpack',
  leaveItem: 'Leave it here',
  emptyBackpack: 'Your backpack is empty.',
  inventoryIntro: 'In your backpack:',
  door: 'Leave the bedroom?',
  leaveRoom: 'Leave',
  stay: 'Stay'
};
