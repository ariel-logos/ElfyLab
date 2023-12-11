---
layout: page
title: FFXI ReShade Preset
subtitle: "A long journey chasing the perfectaru aesthetics..."  
feature-img: "img/beforeafter/13.jpg"
permalink: /ffxireshadepreset/         # Set a permalink your your page
hide: false                           # Prevent the page title to appear in the navbar
tags: [reshade,ffxi]
---

As a die-hard FFXI player, I invested more than I should have in tuning effects on ReShade in order to create a reasnoably good preset.
The goal in mind working on this was to achieve a significant improvement on the final image without messing up the UI layer and specific areas with already very strong effects.

While I consider this still a work-in-progress, I'm ready to share the results achieved so far.
As more sginificant improvements will be made, I will update the preset available on this page.

### Preset 1
##### (for limited GPU power)
<br/>
The first preset I'll be discussing is meant for people who don't want to add any burdening computational load in the rendering of their game.
The preset doesn't use many effects that need more than single passes or, for each pixel, to constantly check the sourrounding ones for additional data.
Despite this limitation the final result is clearly some relevant improvement compared to the base game rendering.

The effects currently in use in this preset are the following:
<ul>
  <li>SMAA.fx</li>
  <li>CAS.fx</li>
  <li>Depth_cues.fx</li>
  <li>FakeHDR.fx</li>
  <li>DPX.fx</li>   
  <li>Vignette.fx</li>  
  <li>Levels.fx</li>
  <li>Tonemap.fx</li>
  <li>BloomingHDR.fx</li> 
  <li>Vibrance.fx</li>
  <li>Clarity.fx</li>
  <li>LumaSharpen.fx</li>
  <li>Technicolor2.fx</li>
  <li>RadiantGI.fx</li>   
  <li>GloomAO.fx</li>  
  <li>Sepia.fx</li>
  <li>DLAA_Plus.fx</li>
</ul> 

<b>Download to the preset:</b> <a href="/ElfyLab/downloads/FFXI_Reshade_(by_arielfy).ini" download>Click to Download!</a>

Down here you can see some examples of comparison between No Reshade and Reshade On with the preset.
If you want to see more samples from different areas take a look <a href="preset1preview/">here</a>.

<div class="mainSection">
        <div id="comp1" class="bal-container">
            <div class="bal-after">
                <img src="/ElfyLab/img/beforeafter/1.jpg">
                <div class="bal-afterPosition afterLabel">
                    Reshade On
                </div>
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="/ElfyLab/img/beforeafter/0.png">
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
        <div class="mainSection">
        <div id="comp2" class="bal-container">
            <div class="bal-after">
                <img src="/ElfyLab/img/beforeafter/5.jpg">
                <div class="bal-afterPosition afterLabel">
                    Reshade On
                </div>
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="/ElfyLab/img/beforeafter/4.png">
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
        <div class="mainSection">
        <div id="comp3" class="bal-container">
            <div class="bal-after">
                <img src="/ElfyLab/img/beforeafter/27.jpg">
                <div class="bal-afterPosition afterLabel">
                    Reshade On
                </div>
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="/ElfyLab/img/beforeafter/26.png">
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

<script src="/ElfyLab/assets/js/imagecomparison.js"></script>


<script>
        new BeforeAfter({
            id: '#comp1'
        });
        new BeforeAfter({
            id: '#comp2'
        });
        new BeforeAfter({
            id: '#comp3'
        });
</script>

<script>
// Function to reload the page on orientation change
       function reloadOnOrientationChange() {
           location.reload();
       }
        // Attach the orientation change event listener
       window.addEventListener('orientationchange', reloadOnOrientationChange);
</script>


