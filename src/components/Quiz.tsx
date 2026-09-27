"use client";

import { FormEvent, useState } from "react";
import { calculateResult, classes, questions } from "@/data/questions";

type SubmissionState = "idle" | "sending" | "sent" | "error";

export default function Quiz() {
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<ReturnType<typeof calculateResult> | null>(null);
  const [submission, setSubmission] = useState<SubmissionState>("idle");

  function start(event: FormEvent) {
    event.preventDefault();
    if (name.trim()) setStarted(true);
  }

  async function choose(answerId: string) {
    const nextAnswers = [...answers, answerId];
    setAnswers(nextAnswers);
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      return;
    }
    const nextResult = calculateResult(nextAnswers);
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
        <p className="lead">Answer five questions about how you think, act, and adventure. We&apos;ll match you with the class that fits your spirit.</p>
        <form onSubmit={start} className="name-form">
          <label htmlFor="name">What should we call you?</label>
          <input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" maxLength={80} required />
          <button className="button" type="submit">Begin the quest <span aria-hidden="true">→</span></button>
        </form>
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
