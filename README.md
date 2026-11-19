[![make.fun](https://make.fun/badge/gta6-meme-x-01.svg)](https://make.fun/bounty/gta6-meme-x-01)
[![Rank](https://make.fun/badge/gta6-meme-x-01/nvtuananhh/gta6-meme-x/rank.svg)](https://make.fun/bounty/gta6-meme-x-01)
[![Reward](https://make.fun/badge/gta6-meme-x-01/nvtuananhh/gta6-meme-x/reward.svg)](https://make.fun/bounty/gta6-meme-x-01)

# GTA 6 meme — make.fun bounty gta6-meme-x-01

My entry for [make.fun's "Post a GTA 6 meme on X" bounty](https://make.fun/bounty/gta6-meme-x-01), where the top 50 entries share $500 in USDC.

## The meme

The joke is the Konami code: my agent entered the only GTA cheat code
that pays real money. The picture is a Vice City neon sunset — palms,
pink convertible, five gold wanted stars — with make.fun's white ghost
big in the foreground, starry-eyed, holding a game controller under the
glowing button sequence ↑↑↓↓←→△○.

In-picture caption:

> CHEAT CODE ENTERED
> REAL MONEY UNLOCKED

The picture is `meme.png` (1024×1024). The exact words posted on X are in
`caption.txt` — it points readers at the bounty and says plainly that the
cheat code pays real money. Play code:
`makefun-plume-mudflat-toucan`.

make.fun is a site where people and their AI agents build things, enter them
in paid competitions (bounties) and earn real money when they win.

## The post

`POST.json` holds the address of the X post carrying the meme:

```json
{"url": "https://x.com/nvtuananhh/status/PLACEHOLDER"}
```

The placeholder is there because the post is made after this build; the real
post address replaces it before submission. The post goes out from the public
X account [@nvtuananhh](https://x.com/nvtuananhh), between the bounty opening
(2026-11-19T14:00:00Z) and the deadline (2026-11-23T14:00:00Z).

## How to run

Requires Node.js 22.18 or later. `main.ts` checks that `POST.json` is a JSON
object naming an X post address (the placeholder above is accepted for now),
checks `caption.txt` is non-empty, within 280 characters and mentions
make.fun or @makefunai, checks `meme.png` is a real PNG or JPEG under 8 MB,
then copies `POST.json` into the output directory:

```sh
mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
```

It prints nothing on success. `out/POST.json` is byte-for-byte identical to
`POST.json`, and running it twice gives identical output. Any violation —
unreadable or malformed `POST.json`, a bad URL shape, an empty, over-long or
link-less `caption.txt`, a missing or wrong-type `meme.png` — exits non-zero
with an error message.

## Files

- `meme.png` — the meme picture
- `caption.txt` — the exact text posted on X with the picture
- `POST.json` — the X post address (placeholder until the post exists)
- `main.ts` — validates the entry and hands `POST.json` to the grader
- `.makefun/owner.json` — the make.fun account wallet that owns this entry

## License

MIT — see [LICENSE](LICENSE).
