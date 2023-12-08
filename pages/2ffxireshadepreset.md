---
layout: page
title: FFXI ReShade Preset
subtitle: "This is a subtitle"  
permalink: /ffxireshadepreset/         # Set a permalink your your page
hide: false                           # Prevent the page title to appear in the navbar
tags: [reshade,ffxi]
---

Some Content about reshade.

{% assign nImgs = 13 %}
{% assign bef = 0 %}
{% assign aft = 0 %}

{% for i in (0..nImgs) %}
<div class="mainSection">
        <div id="comp{{i}}" class="bal-container">
            <div class="bal-after">
                {% assign bef = i | times: 2 %}
                {% assign aft = bef | plus: 1 %}
                <img src="/ElfyLab2/img/beforeafter/{{aft}}.jpg">
                <div class="bal-afterPosition afterLabel">
                    Reshade On
                </div>
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="/ElfyLab2/img/beforeafter/{{bef}}.png">
                    <div class="bal-beforePosition beforeLabel">
                        No Reshade
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
        {% for i in (0..nImgs) %}
        new BeforeAfter({
            id: '#comp{{i}}'
        });
        {% endfor %}
</script>

