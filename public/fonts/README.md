# Self-hosted webfonts

Every family ships under the SIL Open Font License 1.1; the licence text
sits beside each family's files, copied verbatim from the same upstream
commit as the fonts. Files are byte-identical to upstream (sizes checked
against the repository listings at download).

| Family | Files | Upstream (pinned commit) | Licence file |
|---|---|---|---|
| Cormorant Garamond | CormorantGaramond-Regular/-Medium/-Italic.woff2 | github.com/CatharsisFonts/Cormorant @ `9719e26aa8e26d7a30e736667427b9e05b5db059`, `fonts/webfonts/` | `OFL.txt` |
| EB Garamond | EBGaramond-Variable.woff2 (upstream `EBGaramond[wght].woff2`), EBGaramond-Italic-Variable.woff2 (upstream `EBGaramond-Italic[wght].woff2`) | github.com/octaviopardo/EBGaramond12 @ `106a4a6d377987459ae5e68673a4570f13b957fb`, `fonts/webfonts/` | `OFL.txt` |
| IBM Plex Mono | IBMPlexMono-Regular/-Medium.woff2 | github.com/IBM/plex @ `2f9ba1b25957d958db71a849e85d72e3ecfb845a`, `packages/plex-mono/fonts/complete/woff2/` | `LICENSE.txt` |

Selection rationale (plan §8 criteria): fewest files satisfying the
publication's weights — 400/500 plus italics. Cormorant Garamond ships
three statics (400 upright exists solely for the section-break ornament;
500 carries display; 400 italic carries standfirst, pull quote and
summary). EB Garamond ships its two variable files, which cover 400–500
in fewer bytes than three statics; the @font-face descriptors clamp them
to `font-weight: 400 500`. IBM Plex Mono ships 400 and 500 uprights; the
design uses no mono italic. The EB Garamond files are renamed only
because the upstream names contain `[wght]`, which is hostile in URLs;
contents are untouched.
