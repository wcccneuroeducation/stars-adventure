// Nurse-reviewable scripted scenario; none of these messages depend on hydration.
export const footballText = {
  join:'Join the game',decline:'Not now',leave:'Leave football',
  hint:'Blue: you + Jay · Orange: opponents · touch the ball to kick · E / INTERACT to leave',
  score:(blue,orange)=>`Blue ${blue} – Orange ${orange}`,
  thirsty:"Game thought: I'm feeling thirsty.",
  tired:"Game thought: I'm feeling tired. I could take a break.",
  gameRule:'These are fictional game rules, not medical measurements or predictions of symptoms.',
  low:"I don't feel right. I need to stop and tell someone.",
  tellJay:'Tell Jay and leave the game',
  tellAdult:'Tell a trusted adult / seek advice',
  adultTitle:'Getting support',
  adultReply:'Tell a trusted adult how you are feeling. If symptoms persist or are concerning, seek appropriate medical advice and follow your personal care plan. This game cannot assess symptoms.',
  title:'A moment during football',
  first:"I'm getting really tired. I think I need a break.",
  continuing:"I'm still feeling really tired. I can stop and tell Jay how I'm feeling.",
  rest:'Tell Jay and take a rest.',water:'Stop playing and get some water.',continue:'Keep playing for now.',
  restReply:'Of course. We can stop playing. You can use the shaded bench if you want.',
  waterReply:'No problem. We can stop. Your backpack and the drinking-water fountain are available.',
  safety:'Rest and water are not guaranteed treatment for concerning symptoms. If symptoms persist or become concerning, tell a trusted adult and seek appropriate medical advice.',
  close:'Return to the park',backpack:'Open backpack',
  explanation:'This is a scripted learning scenario, not a prediction based on the hydration meter.'
};
