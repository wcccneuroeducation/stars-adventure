// Editable scenario copy. Keep choices neutral: no scores or recommended items.
export const sunnyDayText = {
  objectives:{explore:'Explore',headHome:'Head home',complete:'Adventure Complete!'},
  objectiveLabel:label=>`Objective: ${label}`,
  parkGoodbye:"That was fun! We'd better head home. See you tomorrow!",
  headHomeReminder:'See you soon! Take care on the way home.',
  homeDoor:'Front door',homePrompt:'[ E ] ENTER HOME',homeHint:'Front door · press E or tap INTERACT',
  homeWelcome:"You're home! What a day!",completeTitle:'Adventure Complete!',
  completeMessage:'Your adventure has come to an end.',playAgain:'Play Again',finish:'Finish',
  finishMessage:'Thanks for playing STARS Adventure.',
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
