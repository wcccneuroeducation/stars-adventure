// Editable scenario copy. Keep choices neutral: no scores or recommended items.
export const sunnyDayText = {
  objectives:{explore:'Explore',headHome:'Head home',complete:'Adventure Complete!'},
  objectiveLabel:label=>`Objective: ${label}`,
  parkGoodbye:"That was fun! We'd better head home. See you tomorrow!",
  headHomeReminder:'See you soon! Take care on the way home.',
  homeDoor:'Front door',homePrompt:'[ E ] ENTER HOME',homeHint:'Front door · press E or tap INTERACT',
  homeWelcome:"You're home! What a day!",completeTitle:'Adventure Complete!',
  completeMessage:'You made it home after a sunny day at the park!',playAgain:'Play Again',finish:'Finish',
  nextAdventure:'Next Adventure',comingSoon:'Coming Soon — Pharmacy Panic!',
  completionAdvice:{
    waterTaken:"Great! You remembered to take your water bottle. Having water with you is important when you're out on a sunny day.",
    waterForgotten:"Next time you're heading out on a sunny day, remember to take some water with you so you can drink regularly.",
    rested:'Well done for taking a break! Resting somewhere cool or shady is a good way to avoid getting too hot.',
    noRest:"Remember to take regular breaks when you're active, especially in warm weather. Find somewhere cool or shady to rest.",
    lowHydration:"Your hydration indicator dropped quite low during the adventure. Remember to drink regularly rather than waiting until you're very thirsty.",
    regularDrinking:"Remember to keep drinking regularly when you're out enjoying yourself, even if you don't feel thirsty.",
    hatTaken:'Great! You remembered your sun hat. Protecting yourself from the sun is important on hot days.',
    noHat:"On sunny days, remember your hat and try to find shade when it's hot.",
    fictional:'The hydration indicator is fictional game status, not a clinical measurement.'
  },
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
