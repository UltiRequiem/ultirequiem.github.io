# ulti.js.org

Eliaz Bobadilla's libraries, editor plugins and apps, ranked by what people actually install.

The page is built from GitHub and npm, so it updates itself:

- A repository appears when it is public, not archived, not a fork and has the `showcase` topic:
  `gh repo edit UltiRequiem/<repo> --add-topic showcase`.
- `scripts/build-catalog.mjs` reads each repo's `package.json` and README (the usage snippet is the first
  code block under "Usage"), the npm version and last-month downloads, and the GitHub stars.
- It is rebuilt on every push to `main` and once a day.

```sh
pnpm install
pnpm dev      # fetches the catalog, then starts Astro
pnpm build    # production build into dist/
```

Set `GITHUB_TOKEN` to avoid GitHub's anonymous rate limit while developing.

## Licence

Licensed under the MIT License 📄
