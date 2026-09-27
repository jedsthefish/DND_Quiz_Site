# D&D Class Quiz

A Next.js quiz that matches a user to a D&D class and emails the result to the quiz owner through Resend. Quiz submissions are not stored in a database.

## Local setup

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Fill in:
   - `RESEND_API_KEY`: an API key from Resend.
   - `RESULT_RECIPIENT_EMAIL`: the address that should receive quiz results.
   - `RESULT_SENDER_EMAIL`: a sender address from a domain verified in Resend.
5. Run `npm run dev`.

The public quiz is available at `http://localhost:3000`.

## Editing questions

Questions and scoring are intentionally kept separate from the quiz interface in [`src/data/questions.ts`](./src/data/questions.ts). To add or edit a question:

1. Add or update an entry in the `questions` array.
2. Give every answer a unique `id`.
3. Add class weights in the answer's `scores` object. Higher values make a class more likely to win.
4. Run the quiz locally and check the result balance.
5. Deploy the change.

This is the initial content-management workflow: question edits are version-controlled code changes. A future admin editor can use the same `Question`, `Answer`, and scoring shape without changing the quiz or email APIs.
