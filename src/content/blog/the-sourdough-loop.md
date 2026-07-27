---
title: The Sourdough Loop
standfirst: What a jar of flour and water teaches about feedback, patience and the discipline of changing one thing at a time.
date: 2026-07-12
tags:
  - Food
---

A sourdough starter is the tightest product loop most kitchens will ever run. You observe, you intervene, you wait, and the jar tells you — without flattery and without mercy — whether the intervention worked. There is no committee to persuade and no dashboard to misread. The loaf is the release, and everyone who eats it is a user.

<aside>Sourdough predates written recipes; the earliest leavened loaves are older than the alphabet that later described them.</aside>

That honesty is why sourdough rewards the same habits that make any product better: observe before you optimise, change one variable at a time, and keep a record you can actually trust.

## Observe before you optimise

The first mistake is to start adjusting before you know what "normal" looks like. A starter has a rhythm: it rises after feeding, peaks, then falls as the food runs out. Until you can recognise the peak — the dome just beginning to flatten, the surface pocked with burst bubbles, the smell tipping from yoghurt towards vinegar — you have no baseline, and without a baseline every change is a guess.[^1]

So for the first week, the discipline is deliberately dull: feed at the same time, with the same flour, at the same ratio, and write down what happens. Not what you hoped would happen. What happened.

<figure>
  <div class="placeholder ratio-16x7"><span>diagram · feed → rise → peak → fall</span></div>
  <figcaption>Fig. 1 — The starter's rhythm. Latency: 4–12 hours.</figcaption>
</figure>

## Change one variable

Once the rhythm is legible, you earn the right to experiment — one change per bake, never two. Hydration is the classic first variable because its effects are visible at every stage: in the mixing bowl, under your hands, and in the crumb.

<aside>Times and temperatures assume a kitchen at 21 °C. Colder rooms lengthen every step; the loop, not the clock, is the authority.</aside>

Every experiment needs a control, and mine is the reference formula — the loaf that every change is measured against:

### The reference formula

<dl>
  <dt>Strong white flour</dt><dd>450 g</dd>
  <dt>Wholemeal rye flour</dt><dd>50 g</dd>
  <dt>Water, 26 °C</dt><dd>350 g</dd>
  <dt>Ripe starter</dt><dd>100 g</dd>
  <dt>Fine sea salt</dt><dd>10 g</dd>
</dl>

| Bake | Hydration | Bulk time | Result                                   |
| ---- | --------- | --------- | ---------------------------------------- |
| 1    | 65%       | 4 h       | Tight crumb, easy handling, dull flavour |
| 2    | 70%       | 4 h       | More open, slight spread on the stone    |
| 3    | 75%       | 3.5 h     | Open crumb, blistered crust, sticky work |
| 4    | 75%       | 4 h       | Over-proofed; flat loaf, gummy centre    |

Bakes 3 and 4 are the whole lesson in miniature: the same hydration, half an hour apart in bulk fermentation, and two entirely different loaves. If both hydration and time had changed between them, the record would prove nothing.

### Reading the crumb

The crumb is the postmortem. Even, small holes and a pale crust say the dough wanted more time; a dense band at the base says it ran out of strength; large caverns under the crust say the shaping was too gentle for the hydration. Each pattern points back to exactly one stage of the process, which is what makes the loop closeable at all.

<figure class="breakout">
  <div class="placeholder ratio-3x2"><span>photograph · crumb shot, morning light · 3:2</span></div>
  <figcaption>Fig. 2 — An open, even crumb is a green build.</figcaption>
</figure>

Because the record matters more than memory, it is worth keeping honestly — even a few lines of code will do:

```python
from dataclasses import dataclass


@dataclass
class Bake:
    number: int
    hydration: float
    bulk_hours: float
    notes: str


def hydration(flour_g: float, water_g: float) -> float:
    """Baker's percentage: water as a share of flour."""
    return round(water_g / flour_g * 100, 1)


log = [
    Bake(3, hydration(500, 375), 3.5, "open crumb, blistered crust"),
    Bake(4, hydration(500, 375), 4.0, "over-proofed, gummy centre"),
]
```

The point is not the tooling — a notebook works as well as a dataclass. The point is that the entry is written before the loaf is cut, so the prediction is on record before the result can edit it.[^2]

<details>
  <summary>Variations — rye, spelt and the weekday loaf</summary>
  <p>Each variation changes exactly one variable, because changing two teaches you nothing.</p>
  <ul>
    <li>Swap the rye for spelt and drop the water to 330 g; spelt is thirstier than it looks.</li>
    <li>For a weekday loaf, double the starter and halve the bulk time. Faster loop, shallower flavour.</li>
    <li>Ten per cent toasted seeds is the largest change that requires no other change.</li>
  </ul>
</details>

---

The loop closes at the table. Someone tears the heel off the loaf, and you watch whether they reach for a second piece. That, and not the scoring pattern or the ear or the photograph, is the measure that matters. The starter goes back in the jar, the note goes in the log, and the next bake begins where this one ended: with an observation, one planned change, and the patience to let the result arrive.

[^1]: The overnight leaven built from a spoonful of starter is properly a levain, but the distinction matters less than the habit of watching it.

[^2]: Anyone who has "remembered" a bulk fermentation as shorter than it was, because the loaf turned out well, understands why.
