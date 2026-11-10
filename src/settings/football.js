export const footballSettings = Object.freeze({
  symptomAfterMs:35000,
  repeatAfterMs:10000,
  hydrationMultiplier:1.25,
  kickRange:22,
  kickSpeed:300,
  kickCooldownMs:500,
  ballFriction:.6,
  npcSpeed:112,
  actorRadius:14,
  goalHalfHeight:44,
  kickoffMs:900,
  thirstyThreshold:60,
  tiredThreshold:30,
  stopThreshold:10,
  tiredSpeedMultiplier:.85,
  // Within the existing fence and clear of both goal-frame collision rectangles.
  bounds:Object.freeze({x:968,y:152,width:432,height:280}),
  start:Object.freeze({x:1032,y:278}),
  ballStart:Object.freeze({x:1184,y:288}),
  target:Object.freeze({x:1384,y:288})
});
