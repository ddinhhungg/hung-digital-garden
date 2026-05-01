# Hưng's Digital Garden

> "Thinking out loud — one slow idea at a time."

Personal digital garden built with Next.js 14 + MDX. A place to log notes, projects, and thoughts — not a blog, not a CV.

## Stack

- **Next.js 14** (App Router, static export)
- **MDX** for content (write like markdown, rendered with design template)
- **CSS Variables** design system — cream/ink/tomato/sage palette
- **Vercel** for deployment

## Publishing a new post

1. Create a new file in `content/notes/` — e.g. `content/notes/my-new-note.mdx`
2. Fill in the frontmatter:

```yaml
---
title: "Tiêu đề bài viết"
title_en: "english title for breadcrumb"
date: "May 02, 2026"
tag: "note"          # note | project | thought
readTime: 5
excerpt: "One or two sentences summary..."
tags: ["tag1", "tag2"]
---
```

3. Write content below using Markdown
4. `git add . && git commit -m "add: new note" && git push`
5. Vercel auto-deploys in ~60 seconds

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Design credits

Designed with Claude Design (claude.ai/design) · Built with Claude Code
