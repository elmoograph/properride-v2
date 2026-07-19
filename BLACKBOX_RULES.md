# ProperRide AI Development Rules

## Project

ProperRide is a React Native Expo application using:

- Expo Router
- TypeScript strict mode
- Supabase
- React Native StyleSheet
- Feature-based architecture

## Architecture

- Route files inside `app/` must remain thin.
- Screens belong in `src/features/<feature>/screens`.
- Feature-specific components belong in `src/features/<feature>/components`.
- Supabase access belongs in repository files.
- Shared reusable code belongs in `src/shared`.
- Do not create duplicate components, helpers, repositories, or types.
- Reuse existing theme tokens, components, helpers, and types whenever possible.
- Do not move files or rename existing modules unless explicitly requested.

## Working Rules

1. Read and understand the relevant files before making changes.
2. Do not edit files during an analysis-only request.
3. Work on only one clearly defined task at a time.
4. Modify only files explicitly approved for the task.
5. If another file is required, stop and explain why before modifying it.
6. Do not change `package.json`, lock files, `tsconfig.json`, Expo configuration, environment files, database schema, migrations, or dependencies unless explicitly requested.
7. Do not use `any`, `@ts-ignore`, `@ts-expect-error`, or unsafe type assertions as shortcuts.
8. Fix the root cause instead of hiding TypeScript, database, navigation, or runtime errors.
9. Preserve existing behavior outside the requested task.
10. Avoid unrelated refactoring, formatting, cleanup, or renaming.
11. Do not duplicate existing business logic.
12. Keep Supabase operations inside repository or data-access modules.
13. Keep route files thin and move feature logic into the relevant feature layer.
14. Maintain TypeScript strict-mode compatibility.
15. Do not commit, push, reset, stash, merge, or change branches unless explicitly requested.

## ProperRide Product Rules

- Use Builder Name as the main public identity.
- `profiles.full_name` represents Full Name.
- `profiles.username` represents Builder Name.
- Use Indonesian for subtitles, descriptions, helper text, validation, success messages, error messages, pop-ups, and common buttons.
- Feature titles such as Feed, Explore, Garage, Build, Gallery, Setup, Part, and Profile may remain in English.
- Add Part must always preserve the selected motorcycle context.
- Gallery represents motorcycle documentation.
- Posts represent social content owned by the user.
- Do not change established product behavior without explicitly reporting it first.

## Validation

After implementation:

1. Run `npx tsc --noEmit --pretty false`.
2. Report every file created, changed, moved, or deleted.
3. Summarize the reason for each change.
4. Report the TypeScript validation result.
5. Provide exact manual emulator test scenarios.
6. Report any assumptions, risks, or unresolved issues.
7. Do not commit or push.
