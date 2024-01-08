---
layout: post
title: White Magic&#58; harnessing the power of whites curve
thumbnail: img/thumbnails/ffxi/9.png
tags: [FFXI, ReShade]
---

In this post I'm going to discuss a key effect for ReShade that helped me fixing one of the few issues left unsolved in my last released preset. In particular, I'll be covering the topic of white balancing using a curve.<br>

If you are new to this website and just landed here, catch up with everything there is to know to follow this post <a href="https://ariel-logos.github.io/ElfyLab/ffxireshadepreset/" target="_blank">here</a>.

<br>
### The issue

If you ever had the chance to test my FFXI ReShade Preset 3, you might (or might not) arrived to the conclusion that, overall, the list of effects included in that is doing its job fairly well. However, I'm pretty sure we can agree that, when it comes to certain "environmental instances", some obvious issue arise in what we could naively describe as a "brightness problem". In fact, while in most areas everything looks alright or even great, in zones that feature a large amount of very light textures (e.g. Valkrum Dunes, Cape Terrigan, Ru'Lude Gardens and more) and under direct sunlight, suddenly the effects appear to be "too much".<br><br>

<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/posts/whiteissue1.png" style="max-height: 450px;"/>
</div>

<br>
A quick disclaimer...<br>
One thing to keep in mind diving deeper into this topic is that, considering the effects included in Preset 3, we should be aware that the main goal of such preset is to model the behavior of light in order to feature certain aspects of light <span style="color:DeepPink;">perception</span>.<br>This means that, what we are looking to achieve here is not the image adjustment for a great photo and, when there's a big white floor at 1:00 pm with clear weather we actually expect a higher perceived brightness from such surfaces. Without auto white balance (AWB) or manual tweaking, our pictures irl would suffer from the same issue at a fixed exposure time.<br>
Below, an example from an old photo I took back when smartphones weren't that smart (boomer detected! 👵) and, as you can(n't) see, a lot of details on the top of the mountain are just lost to the excessive "brightness" of the snow caused by the reflection of direct sunlight. <br>

<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/posts/mountainswhiteissue.png" style="width: 90%; object-fit: cover; max-height: 500px;"/>
</div>
<br>
After this puntaliziaton we can go back discussing our issue.<br>
The thing I find unique about the nature of this issue is that it can't be fixed by simply tuning down the image exposure or any other image adjustment that is applied as the image as a whole (e.g. brightness, contrast, etc.).
<br>

To understand why this is the case, we will examine what happens to a certain pixel of the image, when the effects are applied, depending on the strength of these.<br>
Let's take three cases:
<ul>
<li><b>Case A: </b> a pixel with a dark color.</li>
<li><b>Case B: </b> a pixel with a lighter color.</li>
<li><b>Case C: </b> anoter pixel with a lighter color but visually different than B.</li>
</ul>
As many of the effects in the preset stack up additively and are often thresholded by their lightness, darker pixels such as A are barely affected and therefore tend to preserve their "identity" when compared to other darker pixels.
In the case of B and C however, because of the stacking, they end up being pushed towards the color white (i.e. maximum R,G,B) with the result that the entire gamma of lighter colors are "flatten" in a smaller range of possible colors all very close to white.
<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/posts/pixels.png" style="max-height: 300px;"/>
</div>
<br>
Once we figured out what's happening the solution needed becomes obvious: we need to balance the whites curve.<br>
<br>
### White Magic
To achieve our final goal, we'll be looking at a new effect called <span style="color:MediumSeaGreen;">PD80_03_Curved_Levels.fx</span>.<br>
Long story short, it's your classic RGB curve adjuster for pictures but we'll be using it equally on all RGB channel, hence, the whites curve!
To keep this already too long post short, I'll go straight to the solution I found and briefly discuss how it works.
The curve that I found to better fix the image in those heavily bright conditions is this:
<br>
<div class="custom-image-container-centered">
	<img src="/ElfyLab/img/posts/whitecurve.png" style="max-height: 350px;"/>
</div>
<br>
As you can see, the adjusting curve (white line) flexes before reaching the higher range of colors close to white going lower than the original picture balance (black line). This translates in the same range taken from the input axis, to a wider range of mapped colors in the output, effectively de-flattening colors at higher range of lightness. The white point (white circle), is moved towards the left of the top-right corner and as a result compresses the input colors making the very edge of the range translate directly into white. The overall result is that, with the new remapping using the curve, lighter color approaches white faster, which gives a nice contrast with the darker colors, but in the process are mapped over a wider range of colors.
<br>
Playing with this curve can have very drastic effects on the resulting image and that's why the one I'm using is not too far from the original line. However, you can judge the result in the comparison below, remembering the previous disclamer:
<br>

<div class="mainSection">
        <div id="comp1" class="bal-container">
            <div class="bal-after">
                <img src="/ElfyLab/img/posts/whitefix1.png">
                <div class="bal-afterPosition afterLabel">
                    White Magic On
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="/ElfyLab/img/posts/whiteissue1.png">
                    <div class="bal-beforePosition beforeLabel">
                        White Magic Off
                    </div>
                </div>
            </div>
            <div class="bal-handle">
                <span class="handle-left-arrow"></span>
                <span class="handle-right-arrow"></span>
            </div>
        </div>
    </div>
</div>
<br>
#### Bonus: same curve applied to the mountains pic
Even though the nature of the issue is entirely different in this case, it's another example to appreciate the effect of the un-flattening that colors range. 

<div class="mainSection">
        <div id="comp2" class="bal-container">
            <div class="bal-after">
                <img src="/ElfyLab/img/posts/mountainswhitefix.png">
                <div class="bal-afterPosition afterLabel">
                    White Magic On
            </div>
            <div class="bal-before">
                <div class="bal-before-inset">
                    <img src="/ElfyLab/img/posts/mountainswhiteissue.png">
                    <div class="bal-beforePosition beforeLabel">
                        White Magic Off
                    </div>
                </div>
            </div>
            <div class="bal-handle">
                <span class="handle-left-arrow"></span>
                <span class="handle-right-arrow"></span>
            </div>
        </div>
    </div>
</div>
<br>
### Conclusions
This has been quite the nerdy post but I hope you found this at least a tiny-bit entertaining!<br>
You can download the updated ReShade Preset 3 directly from <a href="/ElfyLab/downloads/FFXI_Reshade3_(by_arielfy).ini" download>here</a> or the dedicated page.
<br>

Aaaand, see you next time! ❤️🐇




<script src="/ElfyLab/assets/js/imagecomparison.js"></script>

<script>
        new BeforeAfter({
            id: '#comp1'
        });
		new BeforeAfter({
            id: '#comp2'
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