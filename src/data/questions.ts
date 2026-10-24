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
  imageSrc?: string;
};

export type Question = {
  id: string;
  text: string;
  answers: Answer[];
  layout?: "image-grid";
};

export type CompassPosition = {
  x: number;
  y: number;
};

export type ReactionChoiceId = "bow" | "sword" | "staff";

export type ReactionAnswer = {
  choice: ReactionChoiceId | null;
  elapsedMs: number;
};

type ClassProfile = {
  name: string;
  description: string;
  compassPosition: CompassPosition;
};

// Initial, subjective placements; adjust these coordinates to tune class matching.
export const classes: Record<ClassId, ClassProfile> = {
  barbarian: { name: "Barbarian", description: "A fierce force of instinct, courage, and unstoppable power.", compassPosition: { x: -4, y: -6 } },
  bard: { name: "Bard", description: "A charismatic storyteller who turns creativity into adventure.", compassPosition: { x: -2, y: -2 } },
  cleric: { name: "Cleric", description: "A devoted champion who draws strength from a higher purpose.", compassPosition: { x: 2, y: 5 } },
  druid: { name: "Druid", description: "A guardian of the natural world with an adaptable spirit.", compassPosition: { x: -7, y: -5 } },
  fighter: { name: "Fighter", description: "A disciplined master of skill, tactics, and determination.", compassPosition: { x: 4, y: 4 } },
  monk: { name: "Monk", description: "A focused seeker who turns patience and practice into power.", compassPosition: { x: -1, y: -8 } },
  paladin: { name: "Paladin", description: "A principled protector who leads through conviction.", compassPosition: { x: 6, y: 8 } },
  ranger: { name: "Ranger", description: "A resourceful wanderer equally at home in the wild and the unknown.", compassPosition: { x: -5, y: -3 } },
  rogue: { name: "Rogue", description: "A clever problem-solver who thrives on precision and opportunity.", compassPosition: { x: 7, y: -5 } },
  sorcerer: { name: "Sorcerer", description: "A bold spellcaster whose magic comes from within.", compassPosition: { x: 3, y: -6 } },
  warlock: { name: "Warlock", description: "A curious seeker who is willing to pursue forbidden possibilities.", compassPosition: { x: 6, y: 1 } },
  wizard: { name: "Wizard", description: "A thoughtful scholar who solves problems through knowledge and preparation.", compassPosition: { x: 0, y: 2 } },
};

export const COMPASS_MIN = -10;
export const COMPASS_MAX = 10;
export const COMPASS_MAX_BONUS_POINTS = 5;
export const REACTION_DURATION_MS = 10_000;
export const REACTION_DURATION_SECONDS = REACTION_DURATION_MS / 1000;

// Fill these in with the class weights for each reaction choice.
export const REACTION_CHOICE_SCORES: Record<ReactionChoiceId, Partial<Record<ClassId, number>>> = {
  bow: {},
  sword: {},
  staff: {},
};

// Scores interpolate from fast to slow over the countdown. Ranger and Warlock are starter examples.
export const REACTION_TIME_SCORES: Record<ClassId, { fast: number; slow: number }> = {
  barbarian: { fast: 0, slow: 0 },
  bard: { fast: 0, slow: 0 },
  cleric: { fast: 0, slow: 0 },
  druid: { fast: 0, slow: 0 },
  fighter: { fast: 0, slow: 0 },
  monk: { fast: 0, slow: 0 },
  paladin: { fast: 0, slow: 0 },
  ranger: { fast: 2, slow: 0 },
  rogue: { fast: 0, slow: 0 },
  sorcerer: { fast: 0, slow: 0 },
  warlock: { fast: 0, slow: 2 },
  wizard: { fast: 0, slow: 0 },
};

// Add class weights here for participants who let the timer expire.
export const REACTION_TIMEOUT_SCORES: Partial<Record<ClassId, number>> = {};

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
  {
    id: "home",
    text: "Pick a place you'd like to live.",
    layout: "image-grid",
    answers: [
      {
        id: "countryside-farm",
        text: "A farm in the countryside",
        imageSrc: "/images/places/countryside-farm.svg",
        scores: { druid: 3, ranger: 2, cleric: 1 },
      },
      {
        id: "busy-city",
        text: "A busy city",
        imageSrc: "/images/places/busy-city.svg",
        scores: { bard: 3, rogue: 2, fighter: 1 },
      },
      {
        id: "mountainside-castle",
        text: "A castle on a mountainside",
        imageSrc: "/images/places/mountainside-castle.svg",
        scores: { paladin: 3, fighter: 2, cleric: 1 },
      },
      {
        id: "beach-shack",
        text: "A shack by the beach",
        imageSrc: "/images/places/beach-shack.svg",
        scores: { ranger: 2, bard: 2, druid: 1, sorcerer: 1 },
      },
      {
        id: "remote-hermitage",
        text: "A remote hermitage",
        imageSrc: "/images/places/remote-hermitage.svg",
        scores: { monk: 3, druid: 2, cleric: 1, wizard: 1 },
      },
      {
        id: "techno-city",
        text: "A techno city",
        imageSrc: "/images/places/techno-city.svg",
        scores: { wizard: 3, rogue: 2, sorcerer: 1, warlock: 1 },
      },
    ],
  },
];

export function calculateResult(
  answerIds: string[],
  compassPosition: CompassPosition,
  reaction: ReactionAnswer,
) {
  const totals = Object.fromEntries(Object.keys(classes).map((id) => [id, 0])) as Record<ClassId, number>;
  questions.forEach((question) => {
    const answer = question.answers.find((candidate) => answerIds.includes(candidate.id));
    if (answer) {
      Object.entries(answer.scores).forEach(([classId, points]) => {
        totals[classId as ClassId] += points ?? 0;
      });
    }
  });
  if (reaction.choice) {
    Object.entries(REACTION_CHOICE_SCORES[reaction.choice]).forEach(([classId, points]) => {
      totals[classId as ClassId] += points ?? 0;
    });
  } else {
    Object.entries(REACTION_TIMEOUT_SCORES).forEach(([classId, points]) => {
      totals[classId as ClassId] += points ?? 0;
    });
  }
  const reactionProgress = Math.max(0, Math.min(1, reaction.elapsedMs / REACTION_DURATION_MS));
  Object.entries(REACTION_TIME_SCORES).forEach(([classId, scores]) => {
    const points = scores.fast + (scores.slow - scores.fast) * reactionProgress;
    totals[classId as ClassId] += Math.round(points * 100) / 100;
  });
  const maxDistance = Math.hypot(COMPASS_MAX - COMPASS_MIN, COMPASS_MAX - COMPASS_MIN);
  Object.entries(classes).forEach(([classId, profile]) => {
    const distance = Math.hypot(
      compassPosition.x - profile.compassPosition.x,
      compassPosition.y - profile.compassPosition.y,
    );
    const proximity = Math.max(0, 1 - distance / maxDistance);
    const bonus = COMPASS_MAX_BONUS_POINTS * proximity;
    totals[classId as ClassId] += Math.round(bonus * 100) / 100;
  });
  const ranked = (Object.keys(totals) as ClassId[]).sort((a, b) => totals[b] - totals[a]);
  return { winner: ranked[0], alternatives: ranked.slice(1, 3), totals };
}
