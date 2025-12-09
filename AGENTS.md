# Repository Guidelines

## Project Structure & Module Organization
- `src/main.ts` bootstraps the Angular app; `src/app` holds the root standalone component (`app.ts`), template (`app.html`), styles (`app.scss`), routes (`app.routes.ts`), and config (`app.config.ts`).
- Unit specs live alongside sources as `*.spec.ts`; global styles belong in `src/styles.scss`.
- Static assets are served from `public/`. Build and tool settings are in `angular.json`, `tsconfig*.json`, `eslint.config.mjs`, and `prettier.config.mjs`.

## Build, Test, and Development Commands
- `npm start` / `ng serve` — start the dev server at `http://localhost:4200/` with live reload.
- `npm run build` — production build to `dist/` (minified, optimized).
- `npm run watch` — rebuild on change using the development configuration.
- `npm test` — run unit tests with Angular’s Vitest-powered runner.
- `npm run lint` — ESLint over TypeScript and templates; fix issues before sending a PR.
- `ng generate <schematic>` — scaffold components/pipes/etc. to keep structure consistent.

## Coding Style & Naming Conventions
- TypeScript/HTML/SCSS use 2-space indentation; favor small, focused components.
- Prettier enforces `printWidth: 100` and single quotes (see `prettier.config.mjs`); let the formatter handle spacing.
- ESLint/Angular rules require selectors prefixed with `app` (`app-example` elements, `appExample` attributes).
- Name files in kebab-case (e.g., `document-viewer.component.ts`); keep tests as `*.spec.ts` next to the unit under test.

## Testing Guidelines
- Write Vitest specs with Angular TestBed (`@angular/core/testing`); aim to cover new logic, component inputs/outputs, and template branches.
- Keep tests colocated, fast, and deterministic; prefer shallow component tests over brittle DOM snapshots.
- Use `npm test -- --watch` during development to iterate quickly.

## Commit & Pull Request Guidelines
- Use concise, imperative commits (e.g., `Add document tag parser`); group unrelated changes into separate commits.
- PRs should include: a short summary of changes, testing notes (`npm test`, manual steps), screenshots/GIFs for UI updates, and linked issues if applicable.
- Run `npm run lint` and `npm test` before requesting review; flag known gaps or follow-ups in the PR description.

## Security & Configuration Tips
- Do not commit secrets or API tokens; configure environment-specific values via runtime configuration or deployment settings.
- Keep dependencies up to date with `npm install` after lockfile changes and rerun tests before merging.
