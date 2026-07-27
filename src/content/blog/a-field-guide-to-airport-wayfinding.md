---
title: A Field Guide to Airport Wayfinding
standfirst: Airports are the hardest reading environment we have ever built — read at walking pace, under stress, in every language at once. What their signs can teach anyone who makes anything.
date: 2026-07-25
tags:
  - Travel
---

<!-- @format -->

There is a product most of us use a handful of times a year, under the worst possible conditions, and it works so well that we barely notice it exists. It is not the aircraft, which we notice constantly, and it is not the airport, which we experience mostly as a sequence of queues. It is the thin layer of words and arrows bolted to the ceiling: the wayfinding system.

Consider what is being asked of it. The reader is late, or worried about being late, which for reading purposes is the same thing. They are carrying luggage, herding children, holding a passport in their teeth. One traveller in the stream is making the journey for the first time and will never make it again; the sign must work for them on the first pass, because there is no second pass. Another cannot read the local language at all and is navigating by pictogram and typography alone. All of them are moving at more than a metre per second, and the cost of a misreading is not a lost click but a missed aeroplane.

No website operates under conditions like these. Yet the discipline that solves them — patiently, physically, at one-to-one scale — is product design of the purest kind, and it repays study by anyone who makes anything. What follows is a field guide: what to look at the next time you are early for a flight, and what it means.

## The reader in motion

The first thing to understand about an airport sign is that its reader does not stop. Nearly everything we know about typography assumes a stationary reader at a comfortable distance — a book at forty centimetres, a screen at sixty. Wayfinding assumes a reader converging on the text at walking pace, glancing up for perhaps a second at a time, deciding whether to commit to a corridor while still in motion.[^1]

That single fact generates most of the rules. Type must be large, but largeness is crude; what matters is the ratio of letter height to reading distance, which is why the cap height of a departure-board line and the mounting height of a ceiling sign are calculated rather than guessed. Contrast must survive bad conditions: glare from a glass wall at sunrise, the visual noise of a retail concourse, the simple fact that a third of the readers are looking over other people's heads. Open counters and generous spacing beat elegance every time — letters that flow beautifully on a title page melt into each other at thirty metres.

And the vocabulary must be brutal in its economy. A corridor is not the place for synonyms. If the system says _Gates_ at the first decision point, it must say _Gates_ at every subsequent one — never _Departures_ here and _To planes_ there, however reasonable each looks in isolation. A passenger processes a sign the way a driver processes a road marking: by pattern, not by reading. Change the pattern and you force every reader back into slow, deliberate reading, which is precisely what the environment does not allow.

## Three airports

The modern discipline was worked out in public, mostly at three airports, and the systems built there still govern how the world finds its gate.

At **Schiphol** in the late 1960s, Benno Wissing and the designers of Total Design established the convention that everything else now follows or consciously rejects: directional information in black on a field of saturated yellow, hung from the ceiling, relentlessly consistent. The choice of yellow was not decoration. It made the wayfinding layer visually distinct from everything else in the building — advertising, shopfronts, architecture — so that a passenger scanning a crowded concourse could filter for the one colour that meant _this is for finding your way_. The scheme worked so well that it spread across the world's airports, carried in part by the Amsterdam firm that still maintains it, and yellow-and-black remains the nearest thing wayfinding has to a global protocol.

At **Roissy** — now Charles de Gaulle — Adrian Frutiger was commissioned to design the signage typeface for the new airport, and produced letterforms so suited to distance reading that they outgrew the building: released commercially as Frutiger, the face and its descendants have carried directions in airports, hospitals and motorway networks for fifty years.[^2] Frutiger's brief is worth memorising because it is the brief for all interface typography: the letters must be identifiable at speed, at an angle, in poor light, by tired people. Everything in the design — the open apertures, the clear ascenders, the sturdy but unfussy forms — follows from the conditions of use. Nothing follows from fashion.

And at **Stansted** in 1991, Norman Foster's terminal made the sharpest point of all: the best wayfinding is not signage but architecture. The building is a single calm progression on one level, from the forecourt through security to the gates, with a roof that lets daylight mark the route and sightlines that let you see, more or less from the kerb, where the aeroplanes are. When the building itself answers _which way?_, the signs are demoted to confirming details — and a system that only confirms can afford to be small, sparse and quiet.

> Every sign is a patch. The building is the codebase.

That is the uncomfortable rule Stansted teaches. A wall of signage is not evidence of a well-designed system; it is evidence of an architecture that failed to explain itself, now running under heavy annotation. The same is true of any product. Tooltips, onboarding tours, help centres — each one is a sign bolted to a corridor that should have been self-evident. Sometimes the patch is the right engineering decision. It is still a patch.

## The grammar of the system

Spend an hour actually reading an airport and a small grammar reveals itself. Almost every sign in the building is doing one of four jobs.

| Job            | The sentence it speaks          | Typical form                  |
| -------------- | ------------------------------- | ----------------------------- |
| Directional    | "Gates 40–59, this way"         | Arrow, ceiling-hung, yellow   |
| Identification | "You have arrived at Gate 42"   | Large, static, at the place   |
| Informational  | "Flight BA 429 boards at 14:20" | Dynamic board, dense, tabular |
| Regulatory     | "No liquids beyond this point"  | Distinct colour, imperative   |

The system's discipline lies in never letting the jobs blur. A directional sign does not explain; an identification sign does not point; a regulatory sign does not advertise. Each job has its own visual register — its colour, weight and position — so that a passenger can tell _what kind of statement a sign is making_ before reading a word of it. The reader filters first, reads second.

### Pictograms, or shipping an icon set

The other half of the grammar is pictographic. A symbol for baggage or a lift is not a decoration beside the word; for a traveller who cannot read the script on the sign, it is the entire message. The canonical set — the spare, geometric figures for arrivals, departures, toilets, customs — descends largely from the symbol system commissioned by the US Department of Transportation in the 1970s, drawn so that each figure stays legible at small sizes and long distances and, crucially, stays distinct from its neighbours.[^3] It is an icon set in the exact modern sense, shipped half a century early, and the constraints its designers worked under — cultural neutrality, distance legibility, mutual distinctness — are the same ones every interface icon library negotiates today.

## Decision points

Signs are expensive to read, so the system spends them where decisions actually happen. Between junctions, a corridor needs almost nothing — an occasional reassurance that you are still on the route. At the junction itself, the passenger needs the answer to exactly three questions, in this order:

1. Where am I now?
2. Which way to the thing I am trying to reach?
3. Roughly how far is it?

Everything else — the retail, the lounge access, the seventeen other destinations the corridor also serves — is a tax on the three questions and is rationed accordingly. Good systems enforce a message budget: a sign carries a handful of destinations at most, ordered by the direction of travel, and every candidate message must fight for its place. The destinations that lose the fight are not deleted; they are deferred to the next decision point, where they become relevant. The technique has a familiar name in interface work — progressive disclosure — but airports were practising it before software existed to name it.

There is also a quieter mechanism at work: reassurance. After a long unsigned stretch, doubt accumulates — _did I miss the turn?_ — and doubting passengers stop, backtrack and clog the flow. So mature systems repeat the destination with its distance at intervals calculated against nothing more scientific than human nerve. The sign that says _Gates 40–59 · 6 minutes_ halfway down an unremarkable corridor is not giving directions. It is managing confidence, which turns out to be a designable quantity.

---

## When the system lies

The most instructive signs in any airport are the ones nobody designed: the laminated A4 sheet taped below the official panel, the handwritten arrow by the temporary hoarding, the security officer stationed permanently at a junction to answer the same question four hundred times a day. Each is a defect report filed by reality. The taped sheet marks the exact spot where the designed system and the building's actual behaviour parted company — a diversion the ceiling signs never learned about, a lift that stopped being the route, a door that everyone tries and nobody may use.

A wayfinding audit therefore starts not with the drawings but with a walk, looking for the patches. Where the improvised signs cluster, the system is wrong, whatever the drawings say. The parallel with software is exact: the support macro that every agent keeps pinned, the FAQ entry with ten times the traffic of its neighbours, the workaround that spreads by word of mouth — all laminated A4, all telling you precisely where the designed path and the real path diverge. Users file the most accurate bug reports without knowing they are filing anything. The only skill is going to look.

And when the audit is done, the fix is almost never _more signs_. It is usually fewer, better-placed ones — or, where the budget allows, a change to the building itself: open the sightline, move the queue, make the door look like what it is. The hierarchy of remedies runs from architecture down to annotation, and every step down the hierarchy is cheaper to install and more expensive to read.

## What the airport teaches

The lessons travel well beyond the terminal, which is why this guide belongs on a site about product rather than a site about aviation.

Design for the first-time user in motion, because that is who your reader actually is. The airport cannot assume a returning visitor and neither, honestly, can most software; the sign that needs explaining has already failed, and so has the screen. Spend messages at decision points and be silent in the corridors. Keep one word for one thing, everywhere, for ever. Give every kind of statement its own register, so the reader can filter before reading. Repeat yourself exactly as often as doubt accumulates, and no more. Treat improvised signs — wherever in your product they appear — as the truest map of your system's failures. And remember the Stansted rule, which is the whole discipline in a sentence: the structure should answer most questions, so the words only have to answer the rest.

None of this is glamorous. Wayfinding is a craft of kerning and mounting heights, of walking the route again after the hoarding moves, of arguing a seventh destination off an overcrowded panel. But it is practised at scale, in public, under merciless conditions, and it quietly moves more people through more stress than any interface most of us will ever ship. The next time you are early for a flight, look up. Somebody designed that, tested it against a crowd, and made it better. Everything is product — even the way to Gate 42.

[^1]: The word itself comes from urban planning rather than aviation: Kevin Lynch used "way-finding" in _The Image of the City_ (1960) for the process by which people form a workable mental image of a place and navigate it.

[^2]: The typeface was designed for the airport's opening in the mid-1970s and released commercially as Frutiger shortly afterwards; its descendants remain among the most widely used signage faces in the world.

[^3]: The DOT symbol set was developed with the American Institute of Graphic Arts from 1974 — thirty-four symbols initially, later extended to fifty — and released into the public domain, which is a large part of why its figures still feel universal.
