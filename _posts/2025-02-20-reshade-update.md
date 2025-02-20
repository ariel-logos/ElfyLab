---
layout: post
title: ReShade update&#58; new preset&#33;
thumbnail: img/thumbnails/ffxi/15.png
tags: [FFXI, ReShade]
---

New FFXI ReShade preset released!<br>
New shaders, cleanups, improved performance and quality!<br>
Keep reading to find out about what's new and where to download it!

### What's new

After a long time away from the game, I returned and decided to revamp my ReShade preset for FFXI.
The new version includes many improvements, with the main points listed below:
<ui style="padding-left: 0; margin-left: 0; list-style-position: inside;">
	<li>Removed unnecessary shaders and reintroduced their effects through the remaining active ones</li>
	<li>Resolved the main issue with overly bright areas (textures close to white) by using a customized version of the CShade Autoexposure shader (see details below).</li>
	<li>Fine-tuned all shaders to improve performance and scale their effects to a reasonable level.</li>
	<li>Added newly released shaders that further enhance the final visual quality.</li>
</ui>
<br>

The ReShade version I'm using for this preset is <b>ReShade 6.3.3</b> with Add-ons support.<br>
Credits for the original CShade shader pack:
<a href="https://github.com/papadanku/CShade" target="_blank">papadanku's CShade Git Repo</a>

If this is your first time approaching ReShade on FFXI, don't forget to check these very important posts!

<ui style="padding-left: 0; margin-left: 0; list-style-position: inside;">
	<li> <a href="/ElfyLab/2024/01/02/reshade-setup.html">First ReShade Setup on FFXI</a></li> 
	<li> <a href="/ElfyLab/2023/12/16/save-your-ui-2.html">ShaderToggler to save the UI layer</a></li> 
</ui>
<br>  

### See the result!

Below here, you can find some examples of the effects in the new <b>Preset</b>.

<b>Download to the preset:</b> <a href="/ElfyLab/downloads/FFXI_Reshade6_(by_arielfy).ini" download>Click to Download!</a><br>
<b>Download to the custom CShade shader pack:</b> <a href="/ElfyLab/downloads/CShade.zip" download>Click to Download!</a><br>

  Unpack <span style="color:MediumSeaGreen;">CShade.zip</span> where you prefer <b>before</b> launching the game with the new preset and <b>then</b> copy the content (<span style="color:MediumSeaGreen;">CShade</span> folder) in your <span style="color:MediumSeaGreen;">shaders</span> folder (where you installed ReShade for FFXI).<br>
  You should already have a <span style="color:MediumSeaGreen;">CShade</span> in it, just overwrite everything.


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