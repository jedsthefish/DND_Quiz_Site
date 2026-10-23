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
            <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 8C48 18 48 46 18 56M18 8v48M21 32h34M44 24l11 8-11 8" /></svg>
            <span>Bow</span>
          </button>
          <button className="reaction-button reaction-button--sword" onClick={() => chooseReaction("sword")} aria-label="Choose sword">
            <span className="reaction-particles reaction-particles--fire" aria-hidden="true">
              <span /><span /><span /><span /><span />
            </span>
            <svg viewBox="0 0 64 64" aria-hidden="true"><path d="m18 46 28-28 6 6-28 28-8 2zM14 42l10 10M39 25l6 6M47 17l4-4 6 6-4 4" /></svg>
            <span>Sword</span>
          </button>
          <button className="reaction-button reaction-button--staff" onClick={() => chooseReaction("staff")} aria-label="Choose staff">
            <span className="reaction-particles reaction-particles--snow" aria-hidden="true">
              <span>❄</span><span>❄</span><span>❄</span><span>❄</span><span>❄</span>
            </span>
            <svg viewBox="0 0 64 64" aria-hidden="true"><path d="M27 54 37 15M24 59l5-2M32 11a8 8 0 1 0 10 0M34 6h6M37 2v4" /></svg>
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
