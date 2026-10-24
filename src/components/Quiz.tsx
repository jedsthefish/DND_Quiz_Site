"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  calculateResult,
  classes,
  COMPASS_MAX,
  COMPASS_MIN,
  CompassPosition,
  questions,
  ReactionAnswer,
  REACTION_DURATION_MS,
  REACTION_DURATION_SECONDS,
} from "@/data/questions";

type SubmissionState = "idle" | "sending" | "sent" | "error";

export default function Quiz() {
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [reaction, setReaction] = useState<ReactionAnswer | null>(null);
  const [reactionSecondsLeft, setReactionSecondsLeft] = useState(REACTION_DURATION_SECONDS);
  const [compassPosition, setCompassPosition] = useState<CompassPosition | null>(null);
  const [result, setResult] = useState<ReturnType<typeof calculateResult> | null>(null);
  const [submission, setSubmission] = useState<SubmissionState>("idle");
  const reactionStartedAt = useRef<number | null>(null);

  useEffect(() => {
    if (current !== questions.length || reaction) return;

    const startedAt = Date.now();
    reactionStartedAt.current = startedAt;
    setReactionSecondsLeft(REACTION_DURATION_SECONDS);
    const intervalId = window.setInterval(() => {
      const elapsedMs = Date.now() - startedAt;
      const remainingMs = REACTION_DURATION_MS - elapsedMs;
      if (remainingMs <= 0) {
        window.clearInterval(intervalId);
        setReaction({ choice: null, elapsedMs: REACTION_DURATION_MS });
        setCurrent(questions.length + 1);
        return;
      }
      setReactionSecondsLeft(Math.ceil(remainingMs / 1000));
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [current, reaction]);

  function start(event: FormEvent) {
    event.preventDefault();
    if (name.trim()) setStarted(true);
  }

  function choose(answerId: string) {
    const nextAnswers = [...answers, answerId];
    setAnswers(nextAnswers);
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      return;
    }
    setCurrent(questions.length);
  }

  function chooseReaction(choice: NonNullable<ReactionAnswer["choice"]>) {
    const startedAt = reactionStartedAt.current;
    if (startedAt === null || reaction) return;
    setReaction({
      choice,
      elapsedMs: Math.min(REACTION_DURATION_MS, Date.now() - startedAt),
    });
    setCurrent(questions.length + 1);
  }

  async function submitCompassPosition() {
    if (!compassPosition || !reaction) return;
    const nextResult = calculateResult(answers, compassPosition, reaction);
    setResult(nextResult);
    setSubmission("sending");
    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), result: classes[nextResult.winner].name }),
      });
      if (!response.ok) throw new Error("Result notification failed");
      setSubmission("sent");
    } catch {
      setSubmission("error");
    }
  }

  if (result) {
    const winner = classes[result.winner];
    return (
      <main className="shell result-shell">
        <p className="eyebrow">Your adventurer&apos;s path</p>
        <h1>{name}, you are a {winner.name}.</h1>
        <p className="lead">{winner.description}</p>
        <div className="result-card">
          <span className="result-mark">✦</span>
          <p>Your closest alternate paths are {result.alternatives.map((id) => classes[id].name).join(" and ")}.</p>
        </div>
        {submission === "sending" && <p className="notice">Sending your result...</p>}
        {submission === "sent" && <p className="notice">Your result has been recorded. Thanks for adventuring!</p>}
        {submission === "error" && <p className="notice error">Your result is ready, but its notification could not be sent.</p>}
        <button className="button secondary" onClick={() => window.location.reload()}>Take it again</button>
      </main>
    );
  }

  if (!started) {
    return (
      <main className="shell intro-shell">
        <p className="eyebrow">A personality quiz for adventurers</p>
        <h1>Which D&D class is waiting for you?</h1>
        <p className="lead">Answer five quick questions, then place yourself on the compass. We&apos;ll match you with the class that fits your spirit.</p>
        <form onSubmit={start} className="name-form">
          <label htmlFor="name">What should we call you?</label>
          <input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" maxLength={80} required />
          <button className="button" type="submit">Begin the quest <span aria-hidden="true">→</span></button>
        </form>
      </main>
    );
  }

  if (current === questions.length) {
    const elapsedSeconds = REACTION_DURATION_SECONDS - reactionSecondsLeft;
    return (
      <main className="shell quiz-shell reaction-shell">
        <div className="progress-row">
          <span>Question {questions.length + 1} of {questions.length + 2}</span>
          <span>{Math.round(((questions.length + 1) / (questions.length + 2)) * 100)}%</span>
        </div>
        <div className="progress-track"><div style={{ width: `${((questions.length + 1) / (questions.length + 2)) * 100}%` }} /></div>
        <p className="eyebrow">Reaction test</p>
        <h1>Quickly choose your fate!</h1>
        <p className="lead">Choose a bow, sword, or staff before time runs out.</p>
        <div className="countdown" role="timer" aria-live="off">{reactionSecondsLeft}</div>
        <div className="reaction-buttons" role="group" aria-label="Choose your fate">
          <button className="reaction-button reaction-button--bow" onClick={() => chooseReaction("bow")} aria-label="Choose bow">
            <span className="reaction-particles reaction-particles--electric" aria-hidden="true">
              <span>⚡</span><span>⚡</span><span>⚡</span><span>⚡</span><span>⚡</span>
            </span>
            <svg viewBox="0 0 120 100" aria-hidden="true">
              <path className="bow-limbs" d="M28 7C55 8 79 17 88 32c5 9-5 15-23 18 18 3 28 9 23 18-9 15-33 24-60 25" />
              <path className="bow-string" d="M28 7 28 93" />
              <path className="bow-arrow" d="M14 50h92m-14-13 14 13-14 13" />
              <path className="bow-fletching" d="m33 44 12 6-12 6m5-13 10 7-10 7" />
              <path className="bow-grip" d="M59 45v10m5-10v10" />
            </svg>
            <span>Bow</span>
          </button>
          <button className="reaction-button reaction-button--sword" onClick={() => chooseReaction("sword")} aria-label="Choose sword">
            <span className="reaction-particles reaction-particles--fire" aria-hidden="true">
              <span /><span /><span /><span /><span />
            </span>
            <svg viewBox="0 0 100 180" aria-hidden="true">
              <defs>
                <linearGradient id="sword-steel" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#716d67" />
                  <stop offset=".22" stopColor="#f0e9dc" />
                  <stop offset=".5" stopColor="#a7a196" />
                  <stop offset=".78" stopColor="#eee7da" />
                  <stop offset="1" stopColor="#5e5a55" />
                </linearGradient>
              </defs>
              <g className="sword-metal">
                <path d="M50 4 59 10 56 21 50 25 44 21 41 10Z" />
                <circle cx="50" cy="14" r="4.5" />
                <path d="M46 23 47 46 53 46 54 23M46 29 54 29M46 35 54 35M46 41 54 41" />
                <path d="M45 46 40 51 30 49 22 43 16 51 22 63 36 67 45 60 50 66 55 60 64 67 78 63 84 51 78 43 70 49 60 51 55 46Z" />
                <path d="M16 51 9 46 13 62 22 70 34 72 43 66M84 51 91 46 87 62 78 70 66 72 57 66" />
                <path d="M45 62 42 68 45 72 50 68 55 72 58 68 55 62" />
                <path className="sword-blade" d="M43 69 47 74 50 79 53 74 57 69 55 154 50 177 45 154Z" />
                <path d="M50 80 50 164M43 74 47 154M57 74 53 154" />
                <path d="m50 50 2 3-2 3-2-3zM27 53l5 5-5 4-4-5zM73 53l-5 5 5 4 4-5z" />
                <circle cx="50" cy="55" r="3.5" />
              </g>
            </svg>
            <span>Sword</span>
          </button>
          <button className="reaction-button reaction-button--staff" onClick={() => chooseReaction("staff")} aria-label="Choose staff">
            <span className="reaction-particles reaction-particles--snow" aria-hidden="true">
              <span>❄</span><span>❄</span><span>❄</span><span>❄</span><span>❄</span>
            </span>
            <svg viewBox="0 0 120 140" aria-hidden="true">
              <path className="staff-wood" d="m11 133 6 3L86 35l-7-6z" />
              <path className="staff-grain" d="m17 131 12-17-2-6 14-16-1-7 13-15-1-6 14-15m-31 52 9-5 5-10 12-8 4-10 12-8 4-9 12-9" />
              <path className="staff-wrap" d="m44 91 9 6m1-15 9 6m1-15 9 6m1-15 9 6m1-15 9 6" />
              <path className="staff-head" d="m79 34-13-9-1-15 12-9 17 1 10 12-3 16-13 9z" />
              <path className="staff-flourish" d="M76 28c-10-7-11-18-4-25m22 34c12-7 16-18 9-29M69 16l-8-5 5 10m27 7 10 4-6-9" />
              <path className="staff-crystal" d="m78 7 10 1 6 8-4 10-10 2-7-8z" />
              <circle className="staff-core" cx="83" cy="16" r="4" />
            </svg>
            <span>Staff</span>
          </button>
        </div>
        <p className="reaction-time">Time elapsed: {elapsedSeconds}s</p>
      </main>
    );
  }

  if (current === questions.length + 1) {
    const left = ((compassPosition?.x ?? 0) - COMPASS_MIN) / (COMPASS_MAX - COMPASS_MIN) * 100;
    const top = (COMPASS_MAX - (compassPosition?.y ?? 0)) / (COMPASS_MAX - COMPASS_MIN) * 100;
    return (
      <main className="shell quiz-shell">
        <div className="progress-row"><span>Question {questions.length + 2} of {questions.length + 2}</span><span>100%</span></div>
        <div className="progress-track"><div style={{ width: "100%" }} /></div>
        <p className="eyebrow">Final question</p>
        <h1>Where would you place yourself on the political compass?</h1>
        <p className="lead">Your placement helps tune your class match. It is used only in this browser to calculate your result and is not included in the result email.</p>
        <div
          className="compass-grid"
          aria-hidden="true"
          onClick={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            const x = Math.round(COMPASS_MIN + ((event.clientX - bounds.left) / bounds.width) * (COMPASS_MAX - COMPASS_MIN));
            const y = Math.round(COMPASS_MAX - ((event.clientY - bounds.top) / bounds.height) * (COMPASS_MAX - COMPASS_MIN));
            setCompassPosition({
              x: Math.max(COMPASS_MIN, Math.min(COMPASS_MAX, x)),
              y: Math.max(COMPASS_MIN, Math.min(COMPASS_MAX, y)),
            });
          }}
        >
          <span className="compass-axis-label top">Authoritarian</span>
          <span className="compass-axis-label bottom">Libertarian</span>
          <span className="compass-axis-label left">Economic Left</span>
          <span className="compass-axis-label right">Economic Right</span>
          {compassPosition && <span className="compass-marker" style={{ left: `${left}%`, top: `${top}%` }} />}
        </div>
        <div className="compass-controls">
          <label htmlFor="compass-x">Economic axis: {compassPosition?.x ?? "not set"}</label>
          <input
            id="compass-x"
            type="range"
            min={COMPASS_MIN}
            max={COMPASS_MAX}
            value={compassPosition?.x ?? 0}
            onChange={(event) => setCompassPosition((position) => ({
              x: Number(event.target.value),
              y: position?.y ?? 0,
            }))}
          />
          <label htmlFor="compass-y">Authority axis: {compassPosition?.y ?? "not set"}</label>
          <input
            id="compass-y"
            type="range"
            min={COMPASS_MIN}
            max={COMPASS_MAX}
            value={compassPosition?.y ?? 0}
            onChange={(event) => setCompassPosition((position) => ({
              x: position?.x ?? 0,
              y: Number(event.target.value),
            }))}
          />
        </div>
        <button className="button" disabled={!compassPosition || !reaction} onClick={submitCompassPosition}>See my result <span aria-hidden="true">→</span></button>
      </main>
    );
  }

  const question = questions[current];
  return (
    <main className="shell quiz-shell">
      <div className="progress-row"><span>Question {current + 1} of {questions.length}</span><span>{Math.round(((current + 1) / questions.length) * 100)}%</span></div>
      <div className="progress-track"><div style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>
      <p className="eyebrow">Choose what feels most like you</p>
      <h1>{question.text}</h1>
      <div className="answers">{question.answers.map((answer) => <button className="answer" key={answer.id} onClick={() => choose(answer.id)}>{answer.text}<span aria-hidden="true">↗</span></button>)}</div>
    </main>
  );
}
