---
layout: post
title: FancyChat&#58; a long, winding journey to a better chat&#33;
thumbnail: img/thumbnails/ffxi/fchat.png
thumbnail_crop: middle
tags: [FFXI, add-on]
hidden: true
---

Hello everyone!

Today I'm trying something different from the usual "here's a new tool" release post and writing more of a journal entry. The subject is <b>FancyChat</b>, an add-on I've been chipping away at for a long while, and rather than just dropping a link and a feature list I want to walk through how it actually came to be, what I had to learn along the way, and which very kind people in the FFXI community ended up dragging me into reverse engineering kicking and screaming. Coffee at hand? Good. Let's go.
<br><br>

### The very early days
The very first version of FancyChat was barely an add-on. It was a little ImGui overlay that hooked into the <span style="color:MediumSeaGreen;">text_in</span> event, ran a couple of string substitutions on incoming messages, and printed them in a single fixed window. No tabs. No fonts. No anything fancy beyond the name, which was an exaggeration on purpose.
<br>

<br>
<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/fancychat/early1.png" style="max-height: 400px;"/>
</div>
<br>

The original goal was modest. I wanted the legacy chat to be readable in some specific FFXI scenarios that personally drove me mad: long quest dialogues that scrolled off too fast, combat-log noise during big fights, that kind of thing. I figured I'd ship a personal-use script in a weekend and move on.
<br>

<br>
<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/fancychat/early2.png" style="max-height: 400px;"/>
</div>
<br>

Spoiler: I did not move on.
<br><br>

### Falling into the Ashita rabbit hole
Pretty quickly, the limits of "just substitute strings" became obvious. To make the add-on actually useful I needed to know things about the game state that Ashita does not surface on a silver plate. <span style="color:DeepPink;">What menu is the player currently on? Is a dialogue box open right now? What is the description text behind that highlighted item?</span> None of those have a tidy <span style="color:MediumSeaGreen;">AshitaCore</span> getter that you can just call.
<br>

<br>
<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/fancychat/menudesc.png" style="max-height: 400px;"/>
</div>
<br>

So I shyly poked my nose into the Ashita Discord, expecting a polite "go read the docs". Instead I bumped into a really kind crew of developers who, instead of pointing me at documentation, sat me down and taught me how to find this stuff myself. Cheat Engine, pointer scans, struct dumps, the whole works. I had never done a single line of reverse engineering in my life before that, and a couple of weeks later I was happily walking memory by hand to find the address of whatever obscure menu state I needed.
<br>

Just to give you a flavour, this is roughly the kind of code you end up writing a lot of in FFXI add-ons once you have crossed that bridge. Chase a pointer, read a value, decode some bytes:
<br>

```lua
-- Read the description text shown for the currently-highlighted menu entry.
-- The address chain was found via Cheat Engine pointer scans on the menu UI.
local function GetMenuDescription()
    local base = ashita.memory.read_uint32(0x10A1234)
    if base == 0 then return nil end

    local descPtr = ashita.memory.read_uint32(base + 0x1C)
    if descPtr == 0 then return nil end

    -- The description is a null-terminated string in the game's own
    -- text encoding (more on that in the next section).
    local raw = ashita.memory.read_string(descPtr, 256)
    return raw:gsub('%z.*', '')
end
```

This little pattern (memory read, pointer follow, null-terminated string decode) is the foundation of probably half of what FancyChat actually does under the hood. It is not glamorous, but each tiny pointer chain unlocks one more "I can react to that" feature for the add-on, and that compounds quickly.
<br><br>

### Wrestling with FFXI's custom SJIS
Of course, just reading the bytes out of memory was only half the battle, because <span style="color:DeepPink;">FFXI does not actually use plain Shift-JIS</span>. The game uses its own flavour of SJIS that Square Enix decorated over the years with custom glyphs sitting on top of the original code points. Star icons, arrow markers, key-item bullets, attack-type symbols, whole stretches of region-specific stuff. None of it survives if you feed the raw bytes into any standard SJIS decoder.
<br>

This was painful to discover. I had carefully decoded a memory string only to see a slot like a star symbol come out as garbage in my overlay.
<br>

<br>
<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/fancychat/sjis-before.png" style="max-height: 400px;"/>
</div>
<br>

The fix was a custom one-pass transcoder. Basically a flat lookup table from FFXI's custom SJIS two-byte sequences to Unicode code points I knew gdifonts could render. The decoder walks the byte stream, and whenever it sees an SJIS lead byte it checks the table for that specific pair. Anything not in the table falls back to standard SJIS.
<br>

```lua
-- Codepage map: raw 2-byte FFXI sequence -> pre-encoded UTF-8 string.
-- Pre-encoding (rather than computing utf8.char on every call) avoids
-- per-call allocations inside what is a very hot byte-walking loop.
utils.FFXI_MAP = {
    -- 0x81 lead: SJIS punctuation and game-specific glyphs
    ['\x81\x40'] = ' ',                 -- ideographic space, mapped to ASCII
    ['\x81\xA8'] = utf8.char(0x2192),   -- right arrow
    ['\x81\xA9'] = utf8.char(0x2190),   -- left arrow
    ['\x81\xAA'] = utf8.char(0x2191),   -- up arrow
    ['\x81\xAB'] = utf8.char(0x2193),   -- down arrow
    ['\x81\x9A'] = utf8.char(0x2605),   -- black star
    ['\x81\x7E'] = utf8.char(0x2715),   -- multiplication X, the red X marker
    -- ... and many, many more.
}
```

Each entry is one little victory. The table grew over months as I discovered "wait, that one is custom too?" glyphs one after the other. After this pass, every incoming chat line goes through the transcoder before anything else touches it, and the rest of the add-on can treat strings as normal UTF-8 without worrying about FFXI's idiosyncrasies.
<br>

<br>
<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/fancychat/sjis-after.png" style="max-height: 400px;"/>
</div>
<br>

Worth every minute of the table-building work.
<br><br>

### Combat log, from a wall of text to something readable
The other big saga was the combat log. The default FFXI combat log is, charitably, dense. In a big fight you get a few hundred lines per minute of "X readies Y on Z" and "X hits Z for N points of damage", with the actor names squeezed in the same colour as everything else. Your brain glazes over and the meaningful events drown.
<br>

My first attempt at fixing this was a "compact mode" that simply abbreviated the text. Fewer words, same content, smaller footprint per line.
<br>

<br>
<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/fancychat/combatlog-old.png" style="max-height: 400px;"/>
</div>
<br>

It worked, technically, but in practice it was almost harder to read. Three-letter abbreviations and condensed numbers do not help when you are scanning a hundred lines looking for "did the tank just get hit by a Tier 4 nuke", because everything still looks the same and nothing pops.
<br>

So I started over with a completely different idea: <span style="color:DeepPink;">replace words with icons, and use colour to instantly identify roles</span>. The combat-log rewriter now turns a line like "Eleanor hits Treant Sapling for 23 points of damage" into something visually closer to:
<br>

<b>Eleanor</b> [sword] <b>Treant Sapling</b> &gt; 23 DMG
<br>

with the actor names tinted by their relationship to the player (you, party member, alliance member, foe, unrelated). At a glance the line says everything: who did what to whom, how much.
<br>

```lua
-- Compact-combat formatter for a basic melee hit:
-- "<actor> [icon] <target> > <amount> DMG"
local function FormatHit(actor, target, damage, isRanged, isCritical)
    local icon = isRanged and combatCP.RA or combatCP.ATK
    local line = actor .. ' ' .. icon .. ' ' .. target .. ' '
              .. combatCP.SPLIT .. ' ' .. damage .. ' DMG'
    if isCritical then line = line .. ' ' .. combatCP.CRIT end
    return line
end
```

The <span style="color:MediumSeaGreen;">combatCP</span> table holds Private-Use-Area code points from <span style="color:MediumSeaGreen;">gameicons.ttf</span>, the custom font that ships with the add-on. Each code point is one custom glyph: <span style="color:MediumSeaGreen;">ATK</span> is a sword, <span style="color:MediumSeaGreen;">RA</span> is a bow, <span style="color:MediumSeaGreen;">SPLIT</span> is the small arrow between actor and damage, <span style="color:MediumSeaGreen;">CRIT</span> is the crit marker, and so on. They all live in a single TrueType font I built and ship alongside the add-on.
<br>

<br>
<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/fancychat/combatlog-new.png" style="max-height: 400px;"/>
</div>
<br>

This was the visual jump I was looking for. Suddenly the combat log felt scannable.
<br><br>

### Modifying gdifonts
The icons-and-colours plan ran into one final obstacle: <a href="https://github.com/ThornyFFXI/gdifonttexture" target="_blank">Thorny's gdifonts library</a>, which is what FancyChat uses to render text onto the D3D9 surface, was not built to receive inline colour-switch markers in the middle of a string. Brilliant for rendering text, but the entire string draws in one colour. For the new combat log I needed to switch the active colour halfway through a line, so the actor names could be tinted independently from the rest.
<br>

I ended up forking gdifonts locally and teaching the draw loop to recognise a tiny set of escape codes I define on the FancyChat side. The fork lives next to the add-on source under <span style="color:MediumSeaGreen;">custom gdifonts src/</span>. The core of the change is just a small tokenizer inside the GDI+ draw path:
<br>

```cpp
// Inside the GDI+ draw loop, scan for inline colour escape codes
// of the form 0x1E 0xNN (one-byte palette index) and switch the
// active brush colour accordingly. Anything outside the escape is
// drawn at the current colour, so a single string can carry many
// colour transitions without splitting into separate draw calls.
if (codepoint == 0x1E && i + 1 < length) {
    uint8_t paletteIdx = codepoints[++i];
    currentColor = ResolvePaletteIndex(paletteIdx, originalColor);
    continue;  // do not actually draw the escape bytes
}
```

The escapes are inspired by FFXI's own legacy colour markers, but the palette is mine. The end result is that FancyChat can stuff colour transitions (and a few other custom behaviours) into a regular Lua string, and gdifonts will render the whole thing in one pass with the colour shifts landing in the right places. This is what made the icon-and-colour combat log feasible without slaughtering per-frame performance.
<br>

<span style="color:DeepPink;">Important note though:</span> if you are writing your own add-on and just want a clean GDI font texture library, please use Thorny's original, not this fork. The modifications in <span style="color:MediumSeaGreen;">custom gdifonts src/</span> are tightly coupled to FancyChat's rendering pipeline and are not maintained as a general-purpose drop-in.
<br><br>

### Where things stand
That is roughly the through-line of how FancyChat evolved from a weekend script into the chat overlay it is today. Tabs, Notepad, GuideMe, BigMode, the zone-search map browser, gamepad navigation, all of those sit on top of the foundations I described above. Each of them probably deserves its own little story, but this entry is already four times longer than I planned, so I'll save those for another day.
<br>

In the meantime, the add-on itself lives at <a href="https://github.com/ariel-logos/Fancychat" target="_blank">github.com/ariel-logos/Fancychat</a> if you want to give it a spin, peek at the code, or open an issue.
<br>

A very big thank you to the <b>Ashita team</b> for the patience and for teaching a humble Lua scripter how to actually read what the game is doing, and to <b>Thorny</b> for the gdifonts library that made the whole rendering side possible (and tolerated being forked!).
<br>

See you next time! ❤️🐇
