# GLOS Frontend

## Run Frontend

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`.

## Sanity Environment

Set these variables in `.env`:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=v5u3xa8m
NEXT_PUBLIC_SANITY_DATASET=glos
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_READ_TOKEN=your_read_token
SANITY_VISUAL_EDITOR_SECRET=your_shared_preview_secret
```

`SANITY_API_READ_TOKEN` is required for draft preview/live editing.
`SANITY_VISUAL_EDITOR_SECRET` should match Studio's `SANITY_STUDIO_VISUAL_EDITOR_SECRET`.

## Draft Mode Routes

- Enable: `/api/draft-mode/enable`
- Disable: `/api/draft-mode/disable`

When draft mode is active, data is fetched with Sanity `previewDrafts` perspective and no cache so admins can see edits immediately in Presentation preview.
