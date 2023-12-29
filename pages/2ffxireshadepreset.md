---
layout: page
title: FFXI ReShade Preset
subtitle: "A long journey chasing the perfectaru aesthetics..."  
feature-img: "img/beforeafter/13.jpg"
permalink: /ffxireshadepreset/         # Set a permalink your your page
hide: false                           # Prevent the page title to appear in the navbar
tags: [ReShade,FFXI]
---
<div class="custom-update-block">
<span>
Status: mostly done with this</span>
<span>
Last Update: 29/12/2023
</span>
</div>
<br>
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
The obvious limitations are given by the fact that the effects can hardly distinguish between the rendered 3D scene and the UI layer (if not through some masking effects).

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

Down here you can see some examples of comparison between No ReShade and ReShade On with this first preset.
If you want to see more samples from different areas you can take a look <a href="preset1preview/">here</a>.

<div class="mainSection">
        <div id="comp1" class="bal-container">
            <div class="bal-after">
                <img src="/ElfyLab/img/beforeafter/1.jpg">
                <div class="bal-afterPosition afterLabel">
                    ReShade On
                </div>
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="/ElfyLab/img/beforeafter/0.png">
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
<div class="mainSection">
        <div id="comp2" class="bal-container">
            <div class="bal-after">
                <img src="/ElfyLab/img/beforeafter/5.jpg">
                <div class="bal-afterPosition afterLabel">
                    ReShade On
                </div>
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="/ElfyLab/img/beforeafter/4.png">
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
<div class="mainSection">
    <div id="comp3" class="bal-container">
        <div class="bal-after">
                <img src="/ElfyLab/img/beforeafter/27.jpg">
                <div class="bal-afterPosition afterLabel">
                    ReShade On
                </div>
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="/ElfyLab/img/beforeafter/26.png">
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
<br>
### Preset 2
##### (for maximum quality)
<br/>
The second preset adds more realism to the scene. To achieve that, it features effects based on RT techniques and therefore it's more taxing on your GPU. However, for mig-high GPU range (I'm working with a RX 6800 XT at the time of this post) it should be able to stay around the 60fps limit, provided you are making use of the fps addon for Ashita or equivalent for Windower.
The limiit in pushing the effects for even better visuals is again avoiding to mess up the game UI.
In this case, no matter how I tuned the effects, to keep the most relevant visual improvement, the minimap plugin (again for Ashita) was causing a lot of problems with bloom such as the minimap turning into a screen lamp:

###### Issue VS Fix
<div class="custom-image-container">
    <img src="/ElfyLab/img/posts/reshadeIssue.png" style="max-height: 500px;" />
    <img src="/ElfyLab/img/posts/reshadeIssueFix.png" style="max-height: 500px;" />
</div>

To fix this issue I coded an extra effect (ShapeMask.fx) properly discussed <a href="../2023/12/11/save-your-ui.html">here</a>.
In short, it prevents the minimap from being affected by most of the other effects and it "activates" only when the minimap shows up (in case you want to use the minimapmon addon for the auto-hide feature).

The effects currently in use in this preset are the following:
<ul>
  <li>qUINT_ssr.fx</li>
  <li>NGLighting.fx</li>
  <li>FakeHDR.fx</li>
  <li>Depth_Cues.fx</li>
  <li>Tonemap.fx</li>
  <li>DPX.fx</li>
  <li>BloomingHDR.fx</li>
  <li>PD80_02_Bloom.fx</li>
  <li>MagicHDR.fx</li>
  <li>Vibrance.fx</li>
  <li>Clarity.fx</li>
  <li>LumaSharpen.fx</li>
  <li>Technicolor2.fx</li>
  <li>GloomAO.fx</li>
  <li>MartyMods_MXAO.fx</li>
  <li>DLAA_Plus.fx</li>
  <li>qUINT_MXAO.fx</li>
  <li>PD80_02_Cinetcols_LUT.fx</li>
  <li>LocalContrastCS.fx</li>
  <li>Sepia.fx</li>
  <li>ArtisticVignette.fx</li>
</ul> 
Bonus: 
<ul>
  <li>ShapeMask.fx (Read above)</li>
</ul>
<b>Download to the preset:</b> <a href="/ElfyLab/downloads/FFXI_Reshade2_(by_arielfy).ini" download>Click to Download!</a>

Down here you can see some examples of comparison between No ReShade and ReShade On with this second preset.
If you want to see more samples from different areas you can take a look <a href="preset2preview/">here</a>.

<div class="mainSection">
        <div id="comp4" class="bal-container">
            <div class="bal-after">
                <img src="/ElfyLab/img/beforeafter/29.png">
                <div class="bal-afterPosition afterLabel">
                    ReShade On
                </div>
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="/ElfyLab/img/beforeafter/28.png">
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
<div class="mainSection">
        <div id="comp5" class="bal-container">
            <div class="bal-after">
                <img src="/ElfyLab/img/beforeafter/33.png">
                <div class="bal-afterPosition afterLabel">
                    ReShade On
                </div>
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="/ElfyLab/img/beforeafter/32.png">
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
<div class="mainSection">
    <div id="comp6" class="bal-container">
        <div class="bal-after">
                <img src="/ElfyLab/img/beforeafter/41.png">
                <div class="bal-afterPosition afterLabel">
                    ReShade On
                </div>
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="/ElfyLab/img/beforeafter/40.png">
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
<br>
### Preset 3
##### (High-end GPUs and perfectionism)

The third preset is pretty much a Preset 2 on steroids when it comes to light and shadows effects.
It's mostly a further tweak of the same effects discussed in Preset 2 with the addition of few others.

Here's the full list:
<ul>
<li>qUINT_ssr.fx</li>
<li>NGLighting.fx</li>
<li>GloomAO.fx</li>
<li>IMMERSE MartysMods_MXAO.fx</li>
<li>qUINT_mxao.fx</li>
<li>FakeHDR.fx</li>
<li>Depth_Cues.fx</li>
<li>Tonemap.fx</li>
<li>DPX.fx</li>
<li>BloomingHDR.fx</li>
<li>PD80_02_Bloom.fx</li>
<li>MagicHDR.fx</li>
<li>Vibrance.fx</li>
<li>LumaSharpen.fx</li>
<li>Technicolor2.fx</li>
<li>DLAA_Plus.fx</li>
<li>PD80_02_Cinetools_LUT.fx</li>
<li>LocalContrastCS.fx</li>
<li>Sepia.fx</li>
<li>ArtisticVignette.fx</li>
<li>FXAA.fx</li>
<li>prod80_04_ContrastBrightnessPD80_04_Contrast_Brightness_Saturation.fx</li>
<li>prod80_04_ContrastBrightnessPD80_04_Contrast_BrightnessSaturation2.fx</li>
</ul> 

The idea with this preset was to create a multi-layered version of certain effects such as bloom and AO.
The limitation with those effects is that that you cannot have an arbitrary set of combinations of scale vs. strength of the effect... Therefore, the only way I could figure to adjust the intensity of effects at different scales was to stack multiple effects of the same type. Obviously, this comes as a cost in terms of performance if you are not using a high-end GPU. However, the appeal of light and shadows affecting the final frame with much more control on the result can definitely be worth.<br>
In my opinion, this preset gives much more life to how light behaves and, while not free of arguably negative impact on the gameplay (you literally can't see much at night in certain caves!), it rewards the player with much more interesting sights in open environment as well as more "up-to-date" look on some game effects such as skills, spells and abilities.

<h5 style="color:#ee2222;">Important! (don't skip this 🙏) </h5> 

To properly be able to use this preset (but this also can apply to the previous ones!), you should defintely catch up with a previous post where I explain the wonders of the ShaderToggler plugin for ReShade (<a href="../2023/12/16/save-your-ui-2.html">link here</a>). Please be aware that, as explained in the post, this requires to user the unsigned version of ReShade (available from the official website as the "addo-on enabled" version. This can cause troubles with online games with anti-cheat software that usually whitelist the signed version of ReShade with add-ons disabled. So check ahead before using it!!!

Way less problematic is is mandatory use depth map data for some of the effects. To enable the correct depth-map, go to the ReShade add-on tab, then, Generic Depth add-on.

<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/posts/depthmap.png" style="max-height: 300px;"/>
</div>
<br>
As you can see from the picture above, the <span style="color:MediumSeaGreen;">2048x2048</span> map is enabled.
Unfortunately, this is a manual step required every time you load the game.

I will likely keep tweaking this preset but as of today I'm not planning any major upgrade so you can expect this page to stay without updates for a while.
Remember that being this a research for aesthetics, everything here is very much subjective. For example, I'm pretty sure a good number of people will like Preset 2 over Preset 3 and that's totally fine. My only hope is that, if you cared to follow along, you discovered something new that could tickle your curiosity and creativity in pursuing <span style="color:DeepPink;">your</span> favouritaru style!

As alwys, have fun ❤️!

<b>Download to the preset:</b> <a href="/ElfyLab/downloads/FFXI_Reshade3_(by_arielfy).ini" download>Click to Download!</a>

Down here you can see some examples of this third preset. This time, the comparison will be between Preset 2 and this preset.
If you want to see more samples from different areas you can take a look <a href="preset3preview/">here</a>.


<div class="mainSection">
        <div id="comp7" class="bal-container">
            <div class="bal-after">
                <img src="/ElfyLab/img/beforeafter/43.png">
                <div class="bal-afterPosition afterLabel">
                    Preset 3
                </div>
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="/ElfyLab/img/beforeafter/42.png">
                    <div class="bal-beforePosition beforeLabel">
                        Preset 2
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
        <div id="comp8" class="bal-container">
            <div class="bal-after">
                <img src="/ElfyLab/img/beforeafter/45.png">
                <div class="bal-afterPosition afterLabel">
                    Preset 3
                </div>
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="/ElfyLab/img/beforeafter/44.png">
                    <div class="bal-beforePosition beforeLabel">
                        Preset 2
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
    <div id="comp9" class="bal-container">
        <div class="bal-after">
                <img src="/ElfyLab/img/beforeafter/47.png">
                <div class="bal-afterPosition afterLabel">
                    Preset 3
                </div>
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="/ElfyLab/img/beforeafter/46.png">
                    <div class="bal-beforePosition beforeLabel">
                        Preset 2
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
		new BeforeAfter({
            id: '#comp4'
        });
        new BeforeAfter({
            id: '#comp5'
        });
        new BeforeAfter({
            id: '#comp6'
        });
		new BeforeAfter({
            id: '#comp7'
        });
        new BeforeAfter({
            id: '#comp8'
        });
        new BeforeAfter({
            id: '#comp9'
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


