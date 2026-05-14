---
layout: post
title: BunnyCore&#58; a hungry reactor, some bunny, and a lot of colours&#33;
thumbnail: img/thumbnails/unity/bunnycore.png
tags: [Unity, Blender, Game]
---

Hello everyone!
Today I'm bringing into the Lab a project a bit different from the usual FFXI add-ons and ReShade tweaks: BunnyCore!
<br><br>

### What is BunnyCore?
BunnyCore is a small single-player time-attack arcade game I built in Unity (2022.3).
You play as a bunny tending a big four-port energy reactor in the middle of the play area, and your only job is to keep it running for as long as possible before it goes dark.
<br>

The catch? Every port of the reactor demands a specific colour of energy cell, and the colour each port wants reshuffles every single time you feed it. So you'll be running around the room, picking up energy cells from spawners scattered around, and dropping them into the right ports of the reactor before its central timer drains.
<br><br>

<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/bunnycore/gameplay.png" style="max-height: 400px;"/>
</div>
<br>

### How to play
Movement is your classic four-directional input, camera-relative so the bunny goes where the stick points relative to where you're looking. Nothing fancy, just enough to feel responsive.
<br>

Around the play area there are <span style="color:MediumSeaGreen;">spawners</span> that, on a random timer between 2 and 10 seconds, produce a coloured energy cell. The cells come in <span style="color:Red;">red</span>, <span style="color:Yellow;">yellow</span>, <span style="color:Lime;">green</span>, and <span style="color:DeepSkyBlue;">blue</span>, and you can only carry one at a time. Walk up to a spawner with a cell ready, press the interact key, and you'll grab whatever it has produced.
<br>

The <span style="color:MediumSeaGreen;">reactor</span> in the centre has four drop points around it, each one lit up with the colour it's currently demanding. Bring a cell that matches the slot, press interact again, and the reactor will consume it after a short charging animation, refilling the central timer with a chunk of bonus time. The doors close while the reactor is consuming, then reopen so you can come back with the next one. If you bring a cell of the wrong colour, well, nothing happens (other than the time you wasted on the trip 🙃).
<br>

<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/bunnycore/reactor.png" style="max-height: 400px;"/>
</div>
<br>

As long as you keep feeding the reactor the right colours, you can keep the run going. The central timer drains at all times, no exceptions, and once it hits zero it's game over. Your final score is just how long you survived.
<br>

The HUD has a single big progress bar that doubles as your "how scared should I be" meter. It starts <span style="color:DeepSkyBlue;">blue</span> when you have plenty of time, shifts to <span style="color:Yellow;">yellow</span>, then <span style="color:Orange;">orange</span>, and finally <span style="color:Red;">red</span> when things are really getting dire. Once you're in the red, a numeric countdown also pops up so you know exactly how many seconds you have left to <span style="color:DeepPink;">panic</span>. 😱

<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/bunnycore/hudred.png" style="max-height: 400px;"/>
</div>
<br>

### Behind the scenes
This project was originally my excuse to dig into a few Unity features I wanted to learn properly, so under the hood it's a bit more interesting than the gameplay loop might suggest.
<br>

Some of the things I leaned on most heavily:
<ul>
	<li><b>New Input System:</b> all the controls (movement, interact, pause) are routed through Unity's new Input System, so the game supports keyboard and gamepad out of the box without me having to duplicate any binding logic.</li>
	<li><b>ScriptableObjects:</b> each energy-cell colour is its own <span style="color:MediumSeaGreen;">EnergyCellSO</span> asset, so the colour, label, and other per-cell metadata live as typed game data on disk instead of being hardcoded in scripts.</li>
	<li><b>Event-driven messaging:</b> the player, the reactor, the spawners, and the sound controller all communicate via C# events (<span style="color:MediumSeaGreen;">OnInteractPerformed</span>, <span style="color:MediumSeaGreen;">OnConsumedCell</span>, <span style="color:MediumSeaGreen;">OnDoorsActivated</span>, <span style="color:MediumSeaGreen;">OnGameOver</span>, and a few more). Each system subscribes only to the events it cares about and stays decoupled from the others.</li>
	<li><b>Three-scene flow:</b> <span style="color:MediumSeaGreen;">HomeScene</span> for the main menu, <span style="color:MediumSeaGreen;">LoadingScene</span> as a small transition buffer, and <span style="color:MediumSeaGreen;">GameScene</span> for the actual run. A tiny <span style="color:MediumSeaGreen;">SceneData</span> static class carries the "next scene" target across the loading screen.</li>
	<li><b>Singletons (only where they made sense):</b> <span style="color:MediumSeaGreen;">Reactor</span> and <span style="color:MediumSeaGreen;">PlayerInput</span> are the only two singletons in the project, since they're the central reference points everyone else needs to talk to.</li>
</ul>
<br>

### Models and shaders, all home-made!
This is the part I'm most proud of: <span style="color:DeepPink;">every single 3D model in the game is made by me in Blender</span>. 🎨 The bunny, the reactor, the spawners, the cells, the doors, the table that holds the reactor, the disposer, all of it. Not a single asset-store mesh in the scene.
<br>

The same goes for a handful of the shaders. My favourite of the bunch is the <span style="color:MediumSeaGreen;">warning-flickering light</span> that pulses on top of the reactor as the timer runs short. ✨ It's a fully custom shader that combines a colour ramp with a noisy flicker tied to the urgency of the remaining time, and honestly it sells the "you're about to lose, do something" feeling way more than the HUD bar does on its own.

<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/bunnycore/warninglight.gif" style="max-height: 400px;"/>
</div>
<br>

### See it in action
Here's a (long, sorry! 😅) clip of an actual run. Feel free to skip around to get a feel for the cell pickup, the drop-point colour rotation, and the panic mode when the bar goes red:
<br>

<div class="custom-image-container-centered">
	<video src="/ElfyLab/clips/BunnyCore%20demo.mp4" controls width="720" height="480" preload="none" style="max-width: 100%; height: auto;"></video>
</div>
<br>

### More details
If you want to peek at the code, check the Blender models, or just clone the whole thing and tinker, the full project is on GitHub <a href="https://github.com/ariel-logos/BunnyCore" target="_blank">here</a>.
<br>

This was a fun one to put together, especially for the modelling-and-shader part of it. I hope you enjoyed the read!
See you next time! ❤️🐇
