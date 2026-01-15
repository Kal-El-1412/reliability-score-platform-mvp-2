# Bolt Guardrails Contract

Whenever you (Bolt) modify this repository, you MUST follow this process:

1. Verify working directory:
   - Run `pwd` and ensure you are in the project root (NOT /tmp or any temp dir).
   - Run `ls` and confirm package.json, frontend/, prisma/, src/ are present.

2. Show current git status:
   - Run `git status -sb` and show the output.

3. Apply changes ONLY in the real project directory:
   - Do not modify files under /tmp or any directory outside the repo.

4. Show proof of changes:
   - Run `git diff` and show the output.
   - For each file you claim to have modified, show the relevant content using `sed -n 'start,endp <file>'` so I can visually confirm.

5. Run at least one verification command:
   - For backend changes: `npm run dev:backend` OR `npm test`.
   - For frontend changes: `npm run dev:frontend` OR `npm run test:frontend:smoke`.
   - For database/schema changes: `npm run prisma:generate` OR `npx prisma validate`.
   - Show the command output and clearly state SUCCESS or FAILURE.

6. If git diff shows no changes:
   - You MUST NOT claim that you updated any files.
   - Instead, fix the issue by editing the real file and re-run `git diff`.

7. Never migrate or remove Prisma without an explicit request:
   - Prisma is the primary ORM for this project.
   - Do NOT replace it with Supabase/Supabase client unless explicitly requested in a future task.
