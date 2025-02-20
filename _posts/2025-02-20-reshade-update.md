---
layout: post
title: ReShade update&#58; new preset&#33;
thumbnail: img/thumbnails/ffxi/15.png
tags: [FFXI, ReShade]
---


### What's new

After a long time away from the game I returned and decided to revamp my ReShade preset for FFXI.
There are many improvements in the new version, the main points are listed below:
<ui style="padding-left: 0; margin-left: 0; list-style-position: inside;">
	<li>Removed a lot of shaders and reintroduced their effects through the rest of the active ones.</li>
	<li>Solved the main issue with very bright areas (areas with close-to-white textures) by using a customized version of CShade Autoexposure shader (read below)</li>
	<li>Fine tuned all the shaders to improve performances and scaling their effect to a reasonable scale.</li>
	<li>Added freshly released new shaders that further improve the final result quality.</li>
</ui>
<br>

The ReShade version I'm using to run this preset is <b>ReShade 6.3.3</b> with Add-ons support.<br>
Credits for the original CShade shaders pack: <a href="https://github.com/papadanku/CShade" target="_blank">papadanku's CShade Git Repo</a>

If this is your first time approaaching ReShade on FFXI, don't forget to check these very important posts!

<ui style="padding-left: 0; margin-left: 0; list-style-position: inside;">
	<li> <a href="/ElfyLab/2024/01/02/reshade-setup.html">First ReShade Setup on FFXI</a></li> 
	<li> <a href="/ElfyLab/2023/12/16/save-your-ui-2.html">ShaderToggler to save the UI layer</a></li> 
</ui>
<br>  

### See the result!

Below here, you can find some examples of the effects in the new <b>Preset</b>.

<b>Download to the custom CShade shader pack:</b> <a href="/ElfyLab/downloads/CShade.zip" download>Click to Download!</a><br>
<b>Download to the preset:</b> <a href="/ElfyLab/downloads/FFXI_Reshade6_(by_arielfy).ini" download>Click to Download!</a>

{% assign nImgs = 6 %}
{% assign bef = 0 %}
{% assign aft = 0 %}

{% for i in (0..nImgs) %}
<div class="mainSection">
        <div id="comp{{i}}" class="bal-container">
            <div class="bal-after">
                {% assign bef = i | times: 2 %}
                {% assign aft = bef | plus: 1 %}
                <img src="/ElfyLab/img/beforeafter-preset6/{{aft}}.png">
                <div class="bal-afterPosition afterLabel">
                    ReShade On
                </div>
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="/ElfyLab/img/beforeafter-preset6/{{bef}}.png">
                    <div class="bal-beforePosition beforeLabel">
                        No ReShade
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