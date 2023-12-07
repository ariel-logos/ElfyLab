![1](https://github.com/ariel-logos/ElfyLab2/assets/78350872/ab9ad86d-d767-4fbf-ae71-f999df9cbee1)---
layout: page
title: FFXI ReShade Preset
subtitle: "This is a subtitle"  
permalink: /ffxireshadepreset/         # Set a permalink your your page
hide: false                           # Prevent the page title to appear in the navbar
tags: [reshade,ffxi]
---

Some Content about reshade.

<div class="mainSection">
        {% for i in (0..25) %}
        <div id="comp{{i}}" class="bal-container">
        {% assign i = i+1 %}
            <div class="bal-after">
                <img src="/ElfyLab2/img/beforeafter/{{i}}.jpg">
                <div class="bal-afterPosition afterLabel">
                    After
                </div>
            </div>
        {% assign i = i-1 %}
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="/ElfyLab2/img/beforeafter/{{i}}.png">
                    <div class="bal-beforePosition beforeLabel">
                        Before
                    </div>
                </div>
            </div>
        {% assign i = i+2 %}
            <div class="bal-handle">
                <span class="handle-left-arrow"></span>
                <span class="handle-right-arrow"></span>
            </div>
        </div>
        {% endfor %}
    </div>

<script src="/ElfyLab2/assets/js/imagecomparison.js"></script>

<script>
        new BeforeAfter({
            id: '#one'
        });
        new BeforeAfter({
            id: '#two'
        });
</script>

