---
layout: page
title: FFXI ReShade Preset 3 Preview
feature-img: "img/preset3/1.png"
permalink: /ffxireshadepreset/preset3preview/        # Set a permalink your your page
hide: true                           # Prevent the page title to appear in the navbar
tags: [ReShade,FFXI]
---

In this page you can find the full list of samples for the <b>Preset 3</b>.

{% assign nImgs = 10 %}

{% for i in (1..nImgs) %}
<img src="/ElfyLab/img/preset3/{{i}}.png"/>
{% endfor %}

<script>
// Function to reload the page on orientation change
       function reloadOnOrientationChange() {
           location.reload();
       }
        // Attach the orientation change event listener
       window.addEventListener('orientationchange', reloadOnOrientationChange);
</script>
