---
layout: post
title: ［FFXI］React in time to skills with SkillWatch!

tags: [FFXI, add-on]
---

Skillwatch is an add-on for FFXI's third-party loader and hook Ashita (https://www.ashitaxi.com/).
Very simply, the purpose of this add-on is to have a clearer way to identify the moment when enemy mobs "ready" a skill.
This could be useful in a variety of situations, for example, when people are playing with relevant ping issues or the time window to react to such event is in general too short.
<br></br>
### What is not?
This add-on is <b>NOT</b> a bot. It simply provides enhanced feedback on enemy mobs readying their skills with the same timing the typical "X readies Y" message would appear in the chat box.
<br></br>
### How does it work?
In short, it's a combination of parsing the chat box looking for a message, matching it with Entity informations provided by Ashita hook and drawing some visual feedback overlay.
<br></br>
### Main features
By default, the add-on displays on an overlay (text +  background box + time bar) ALL the incoming skills from enemy mobs with the exception of those without charging time (e.g. Jump).\
The overlay can be configured in different ways (see details below), for example, by filtering certain skills to add a blinking alert effect to the overlay when they are incoming.\
It is also possible to just display the filtered skills (very useful to target specific skill to which you'd like to react with a stun!).\
The overlay has different visual options such as size adjustment, repositioning, blinking color, etc.

![Overlay1](./../img/overlay1fixed.gif)  | ![Overlay2](https://github.com/ariel-logos/ElfyLab/blob/master/img/overlay2.gif)
:------------------|------------------
Normal ability overlay | Filtered ability overlay (blinking alert effect)

### More details
Head over the Git repo <a href="https://github.com/ariel-logos/SkillWatch/" target="_blank">here</a> and follow the instructions!

