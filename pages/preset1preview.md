---
layout: page
title: FFXI ReShade Preset 1 Preview
feature-img: "img/beforeafter/13.jpg"
permalink: /preset1preview/        # Set a permalink your your page
hide: true                           # Prevent the page title to appear in the navbar
tags: [reshade,ffxi]
---

In this page you can find the full list of samples for the <b>Preset 1</b>.

{% assign nImgs = 13 %}
{% assign bef = 0 %}
{% assign aft = 0 %}

{% for i in (0..nImgs) %}
<div class="mainSection">
        <div id="comp{{i}}" class="bal-container">
            <div class="bal-after">
                {% assign bef = i | times: 2 %}
                {% assign aft = bef | plus: 1 %}
                <img src="/ElfyLab/img/beforeafter/{{aft}}.jpg">
                <div class="bal-afterPosition afterLabel">
                    Reshade On
                </div>
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="/ElfyLab/img/beforeafter/{{bef}}.png">
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

<b>Download to the preset:</b> <a href="/ElfyLab/downloads/FFXI_Reshade_(by_arielfy).ini" download>Click to Download!</a>

<script src="/ElfyLab/assets/js/imagecomparison.js"></script>


<script>
        {% for i in (0..nImgs) %}
        new BeforeAfter({
            id: '#comp{{i}}'
        });
        {% endfor %}
</script>

<script>
// Function to reload the page on orientation change
       function reloadOnOrientationChange() {
           location.reload();
       }
        // Attach the orientation change event listener
       window.addEventListener('orientationchange', reloadOnOrientationChange);
</script>
