---
layout: page
title: FFXI ReShade Preset
subtitle: "This is a subtitle"  
permalink: /ffxireshadepreset/         # Set a permalink your your page
hide: false                           # Prevent the page title to appear in the navbar
tags: [reshade,ffxi]
---

Some Content about reshade.

<div class="mainSection">
        <div id="one" class="bal-container">
            <div class="bal-after">
                <img src="img/5.jpg">
                <div class="bal-afterPosition afterLabel">
                    After
                </div>
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="img/4.jpg">
                    <div class="bal-beforePosition beforeLabel">
                        Before
                    </div>
                </div>
            </div>
            <div class="bal-handle">
                <span class="handle-left-arrow"></span>
                <span class="handle-right-arrow"></span>
            </div>
        </div> 
    </div>

<script src="/assets/js/imagecomparison.js"></script>

<script>
        new BeforeAfter({
            id: '#one'
        });
</script>

