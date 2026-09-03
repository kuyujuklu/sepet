# sepet

This repo holds several independent apps, each on its own branch:

- `backend` — Go API
- `admin-front` — admin panel (React)
- `front` — customer-facing site (Next.js)
- `app` — customer mobile app (Expo/React Native)
- `courier-app` — courier mobile app wrapper (Expo/React Native)
- `nginx` — reverse proxy image sources

`main` intentionally holds no app code — only copies of the deploy workflows
under `.github/workflows/`. GitHub only shows the "Run workflow" button for a
`workflow_dispatch` workflow if it exists on the repo's default branch, even
when the workflow actually targets a different branch. Keeping `main` as the
default branch with just these workflow copies makes all three deploy
workflows dispatchable; when you run one and pick e.g. `backend` as the
target branch, it checks out and builds from that branch's real content, not
from `main`.
