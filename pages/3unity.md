---
layout: page
title: Unity Stuff
permalink: /unity/
feature-img: "img/misc/featureImg4.png"
tags: [Page]
---
### BunnyCore
##### A single-player Unity arcade time-attack
<br/>

<p align="center">
  <img src="/ElfyLab/img/thumbnails/unity/bunnycore.png" style="max-width: 100%; height: auto;" alt="BunnyCore banner">
</p>

<b>Repository:</b> <a href="https://github.com/ariel-logos/BunnyCore" target="_blank">github.com/ariel-logos/BunnyCore</a>

A small single-player time-attack arcade built in Unity (2022.3). You control a bunny tending a four-port energy reactor at the centre of the play area: each port wants a specific colour of energy cell, and you have to fetch them from randomly-timed spawners scattered around the room and drop the right ones in before the reactor's central timer drains. Every correct delivery refills the timer with bonus time and reshuffles the next colour the slot wants; wrong-colour drops simply don't register. The HUD bar shifts from blue → yellow → orange → red as time runs short, and a final countdown kicks in for the last few seconds — your score is just how long you survived.

Under the hood the project uses Unity's new Input System for keyboard / gamepad bindings, ScriptableObjects to define each energy-cell colour as typed game data, an event-driven setup (`OnInteractPerformed`, `OnDoorsActivated`, `OnConsumedCell`) for inter-system messaging, and a three-scene flow (Home → Loading → Game) for transitions. Most of the visible models — bunny, reactor, spawners, cells, doors — are custom-made.
