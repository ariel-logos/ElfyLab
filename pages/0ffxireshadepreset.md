---
layout: page
title: FFXI ReShade Preset
subtitle: "This is a subtitle"  
permalink: /ffxireshadepreset/         # Set a permalink your your page
hide: false                           # Prevent the page title to appear in the navbar
tags: [reshade,ffxi]
---

Some Content about reshade.

<div id="example" class="bal-container">
  <div class="bal-after">
    <img src="{{ '/img/beforeafter/5.jpg' | relative_url }}">
    <div class="bal-afterPosition afterLabel">
      After
    </div>
  </div>
  <div class="bal-before">
    <div class="bal-before-inset">
    <img src="{{ '/img/beforeafter/4.png' | relative_url }}">
      <div class="bal-beforePosition beforeLabel">
        Before
      </div>
    </div>
  </div>
  <div class="bal-handle">
    <span class=" handle-left-arrow"></span>
    <span class="handle-right-arrow"></span>
  </div>
</div>

<script src="{{ '/assets/js/imagecomparison.js' | relative_url }}"></script>

<script>
        new BeforeAfter({
            id: '#one'
        });
</script>

