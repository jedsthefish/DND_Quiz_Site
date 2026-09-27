export type ClassId =
  | "barbarian"
  | "bard"
  | "cleric"
  | "druid"
  | "fighter"
  | "monk"
  | "paladin"
  | "ranger"
  | "rogue"
  | "sorcerer"
  | "warlock"
  | "wizard";

export type Answer = {
  id: string;
  text: string;
  scores: Partial<Record<ClassId, number>>;
};

export type Question = {
  id: string;
  text: string;
  answers: Answer[];
};

export const classes: Record<ClassId, { name: string; description: string }> = {
  barbarian: { name: "Barbarian", description: "A fierce force of instinct, courage, and unstoppable power." },
  bard: { name: "Bard", description: "A charismatic storyteller who turns creativity into adventure." },
  cleric: { name: "Cleric", description: "A devoted champion who draws strength from a higher purpose." },
  druid: { name: "Druid", description: "A guardian of the natural world with an adaptable spirit." },
  fighter: { name: "Fighter", description: "A disciplined master of skill, tactics, and determination." },
  monk: { name: "Monk", description: "A focused seeker who turns patience and practice into power." },
  paladin: { name: "Paladin", description: "A principled protector who leads through conviction." },
  ranger: { name: "Ranger", description: "A resourceful wanderer equally at home in the wild and the unknown." },
  rogue: { name: "Rogue", description: "A clever problem-solver who thrives on precision and opportunity." },
  sorcerer: { name: "Sorcerer", description: "A bold spellcaster whose magic comes from within." },
  warlock: { name: "Warlock", description: "A curious seeker who is willing to pursue forbidden possibilities." },
  wizard: { name: "Wizard", description: "A thoughtful scholar who solves problems through knowledge and preparation." },
};

// Add or edit quiz content here. Published questions are the entries in this array.
export const questions: Question[] = [
  {
    id: "challenge",
    text: "When a difficult challenge appears, what is your first instinct?",
    answers: [
      { id: "charge", text: "Meet it head-on and trust my strength.", scores: { barbarian: 3, fighter: 1 } },
      { id: "study", text: "Pause, research, and make a careful plan.", scores: { wizard: 3, cleric: 1 } },
      { id: "talk", text: "Find the right words or recruit some help.", scores: { bard: 3, paladin: 1 } },
      { id: "angle", text: "Look for an overlooked weakness or clever shortcut.", scores: { rogue: 3, ranger: 1 } },
    ],
  },
  {
    id: "ideal",
    text: "Which ideal would you most want to be known for?",
    answers: [
      { id: "freedom", text: "Freedom: nobody should be chained by tradition.", scores: { sorcerer: 2, barbarian: 2, rogue: 1 } },
      { id: "service", text: "Service: my strength should protect other people.", scores: { paladin: 3, cleric: 2 } },
      { id: "balance", text: "Balance: every action should respect the natural world.", scores: { druid: 3, ranger: 2 } },
      { id: "mastery", text: "Mastery: there is always another skill to perfect.", scores: { monk: 3, fighter: 2 } },
    ],
  },
  {
    id: "adventure",
    text: "What would make an adventure unforgettable?",
    answers: [
      { id: "mystery", text: "Discovering a secret that changes everything.", scores: { warlock: 3, wizard: 2 } },
      { id: "wild", text: "Following an unmarked trail into the wilderness.", scores: { ranger: 3, druid: 2 } },
      { id: "legend", text: "A daring story that people will tell for years.", scores: { bard: 3, paladin: 1 } },
      { id: "victory", text: "Overcoming an opponent who seemed impossible to beat.", scores: { fighter: 3, monk: 1 } },
    ],
  },
  {
    id: "team",
    text: "In a group, what role do you naturally take?",
    answers: [
      { id: "anchor", text: "The dependable anchor who keeps everyone standing.", scores: { cleric: 3, fighter: 1 } },
      { id: "scout", text: "The scout who notices danger before anyone else.", scores: { ranger: 2, rogue: 2 } },
      { id: "spark", text: "The spark who keeps morale and momentum high.", scores: { bard: 3, sorcerer: 1 } },
      { id: "specialist", text: "The specialist with an unusual solution.", scores: { wizard: 2, warlock: 2 } },
    ],
  },
  {
    id: "power",
    text: "How would you prefer to wield power?",
    answers: [
      { id: "earned", text: "Through relentless training and discipline.", scores: { monk: 3, fighter: 2 } },
      { id: "inherited", text: "As an instinctive gift that is uniquely mine.", scores: { sorcerer: 3, barbarian: 1 } },
      { id: "bargained", text: "By reaching beyond the ordinary for new knowledge.", scores: { warlock: 3, wizard: 1 } },
      { id: "sacred", text: "As a responsibility entrusted to me.", scores: { paladin: 3, cleric: 2 } },
    ],
  },
];

export function calculateResult(answerIds: string[]) {
  const totals = Object.fromEntries(Object.keys(classes).map((id) => [id, 0])) as Record<ClassId, number>;
  questions.forEach((question) => {
    const answer = question.answers.find((candidate) => answerIds.includes(candidate.id));
    if (answer) {
      Object.entries(answer.scores).forEach(([classId, points]) => {
        totals[classId as ClassId] += points ?? 0;
      });
    }
  });
  const ranked = (Object.keys(totals) as ClassId[]).sort((a, b) => totals[b] - totals[a]);
  return { winner: ranked[0], alternatives: ranked.slice(1, 3), totals };
}
