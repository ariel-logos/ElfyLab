---
layout: page
title: FFXI ReShade Preset
subtitle: "This is a subtitle"  
permalink: /ffxireshadepreset/         # Set a permalink your your page
hide: false                           # Prevent the page title to appear in the navbar
tags: [reshade,ffxi]
---

Some Content about reshade.


{% for i in (0..12) %}
<div class="mainSection">
        <div id="comp{{i}}" class="bal-container">
            <div class="bal-after">
                {% assign x = i*2 %}
                {% assign x = x+1 %}
                <img src="/ElfyLab2/img/beforeafter/{{x}}.jpg">
                <div class="bal-afterPosition afterLabel">
                    After
                </div>
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    {% assign y = (i*2) %}
                    <img src="/ElfyLab2/img/beforeafter/{{y}}.png">
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
{% endfor %}

<script src="/ElfyLab2/assets/js/imagecomparison.js"></script>


<script>
        {% for i in (0..12) %}
        new BeforeAfter({
            id: '#comp{{i}}'
        });
        {% endfor %}
</script>

