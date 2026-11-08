# FuruiTube: zero-distraction YouTube

Every top-level visit to `youtube.com`, `www.youtube.com`, `m.youtube.com` or
`youtu.be` is sent to FuruiTube (`https://yt.nasfurui.es`). The player that
FuruiTube embeds (`youtube.com/embed/...` in an iframe) and every other
resource (thumbnails, API, video streams) is untouched.

| You open | You get |
|---|---|
| `youtube.com/watch?v=ID`, `youtu.be/ID`, `/embed/ID`, `/live/ID` | `yt.nasfurui.es/watch?v=ID` |
| `youtube.com/results?search_query=Q` | `yt.nasfurui.es/results?q=Q` |
| Anything else (home, channels, Shorts, playlists, feeds) | `yt.nasfurui.es/` |

Not touched: `music.youtube.com`, `studio.youtube.com`, `youtube-nocookie.com`,
the sign-in flow (`/signin`, `/accounts`) and machine endpoints (`/oembed`,
`/feeds/`, `/api/`, `/youtubei/`, `/iframe_api`, `/s/`).
To open real YouTube once (e.g. to sign in to Premium) append `?furuitube=off`.

Known FuruiTube limitation: `/watch?v=ID` plays the first video of its library
when `ID` is not in it, so links to videos from channels you do not follow open
a different video there.

## Where it lives

- `browser/extensions/furuitube-redirect/extension/`: a built-in WebExtension
  (`redirect.js` has the URL mapping and the target origin, `background.js`
  hooks `webRequest`). Active in normal and private windows.
- `browser/app/distribution/policies.json`: force-installs uBlock Origin from
  addons.mozilla.org (needs network on first run; it then self-updates).
- Tests: `./mach test browser/extensions/furuitube-redirect/tests/xpcshell`
  and `./mach test --headless browser/extensions/furuitube-redirect/tests/browser`.

## Mobile (Firefox for Android)

`policies.json` and built-in add-ons are desktop-only, so on Android the same
extension is installed as an ordinary add-on (it only uses `webRequest`
blocking, which Firefox for Android supports, as uBlock Origin does):

```bash
cd browser/extensions/furuitube-redirect/extension
zip -r ../furuitube-redirect.xpi .
```

Firefox only installs signed add-ons, so the `.xpi` must be signed once with
your addons.mozilla.org account (unlisted channel, or submit it as listed):

```bash
npx web-ext sign --source-dir . --channel unlisted \
  --api-key "$AMO_JWT_ISSUER" --api-secret "$AMO_JWT_SECRET"
```

Install the signed file on a Firefox Android build that allows custom add-ons
(Nightly/Beta: Settings → About → tap the logo 5 times → "Install add-on from
file"). Install uBlock Origin from the add-on menu. Not tested on a device.
