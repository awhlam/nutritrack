# Deploying NutriTrack

NutriTrack is a static site — HTML, CSS, JS, and nothing else. There's no
server, no database, and no API keys, because every session lives in the
browser's `localStorage`. Any static host will do.

The repo ships with a GitHub Pages workflow, which is the least-effort option
since the code already lives on GitHub.

## GitHub Pages (configured)

`.github/workflows/deploy.yml` lints, typechecks, tests, and builds on every
push and pull request, then publishes `dist/` to Pages on pushes to `main`.

### One-time setup

The workflow can't turn Pages on for you — that's a repository setting:

1. Go to **Settings → Pages** in the repo.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

That's it. Push to `main` (or hit **Run workflow** on the Actions tab) and the
site goes live at:

```
https://awhlam.github.io/nutritrack/
```

Check **Actions → CI & Deploy** for progress; the deploy job prints the URL when
it finishes.

### The base path

Pages serves project sites from a subdirectory, so `vite.config.ts` sets
`base` to `/nutritrack/`. It's overridable:

```bash
BASE_PATH=/ npm run build        # for a host that serves from the domain root
```

If you rename the repo, update the default in `vite.config.ts` to match.

## Other hosts

All of these serve from the domain root, so build with `BASE_PATH=/`.

| Host | Setup |
|---|---|
| **Netlify** | Connect the repo. Build command `BASE_PATH=/ npm run build`, publish directory `dist`. |
| **Vercel** | Import the repo; the Vite preset is detected. Add `BASE_PATH` = `/` as an environment variable. |
| **Cloudflare Pages** | Connect the repo. Build command `BASE_PATH=/ npm run build`, output directory `dist`. |

To host it yourself, `npm run build` and serve `dist/` behind any web server.
Because it's a single-page app, point unknown paths at `index.html`.

## Using it on your phone

**HTTPS is required.** The image export's share-sheet handoff uses the Web Share
API, which browsers only expose over HTTPS. All the hosts above provide it.

**Install it.** Open the site and use **Add to Home Screen** (Share menu on iOS
Safari, the ⋮ menu on Android Chrome). You get an icon, no browser chrome, and a
portrait-locked window.

**It works without signal.** A service worker precaches the whole app on first
visit, so it starts even with no connectivity — which matters when you reopen
the app four hours into a ride with no bars. Your log is in `localStorage` and
was never going over the network anyway.

**Updates show a prompt.** The service worker checks for a new deploy every 30
minutes while the app is open, and on every fresh launch. When it finds one, a
banner appears — "A new version of NutriTrack is available" with a Refresh
button — instead of updating silently in the background where it's easy to
miss. Tap Refresh and it reloads on the new version immediately.

If you're not seeing a change you expect and no banner has appeared, tap
"Check for Updates" next to the version number on the start screen to force a
recheck on the spot.

<details>
<summary>Still not seeing the update?</summary>

- **Check for Updates:** tap it on the start screen (next to the version
  number) to force a recheck immediately, instead of waiting for the
  automatic one.
- **Home-screen installed app:** fully close it (swipe it away in the app
  switcher — backgrounding it doesn't count) and reopen. This sometimes takes
  two reopens: the first fetches the update, the second serves it.
- **iOS Safari (not installed):** pull-to-refresh doesn't bypass the cached
  service worker. Go to Settings → Safari → Advanced → Website Data, find the
  site, and delete it, then reopen fresh.
- **Desktop:** hard refresh (`Cmd+Shift+R` / `Ctrl+Shift+R`), or open DevTools
  → Application → Service Workers → Unregister, then reload normally.
- **Last resort:** clear the site's data entirely. This also wipes any
  unexported sessions — see "Backing up your data" below first.

</details>

## Backing up your data

Everything is in `localStorage` under the `nutritrack:*` keys, which means it's
tied to one browser on one device and is lost if you clear site data. Export the
sessions you care about — that's what the text and image exports are for.

Note that switching hosts (or moving between `github.io` and a custom domain)
means a different origin, and `localStorage` doesn't follow: past sessions won't
appear on the new URL. Export anything you want to keep first.
