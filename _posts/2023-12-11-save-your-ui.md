---
layout: post
title: Save your UI (on ReShade) with ShapeMask.fx

tags: [reshade]
---

Hello everyone!
Today I'll share with you my new fx for ReShade aimed at protecting portion of your screen from those wonderful bloom effects available in many ReShade repositories.

The issue started for me working on my FFXI Reshade Preset project. After achieving some very nice results with the combination of many effects it was time to wrap it up.
However, little did I know that I had completely screwed my minimap plugin (<a href="https://git.ashitaxi.com/Plugins/Minimap/commits/commit/78e2952ff4b798410a0535a3d1b73b9ee059d6b1">repo here</a>) that due to the nature of the color of the maps it loads would act as a screen lamp effect that ended up ruining all the good progress. 🥲

Here's an example of the way-too-much brightness applied on the minimap as a result of blooming:
<div class="custom-image-container">
  <img src="/ElfyLab/img/posts/reshadeIssue.png" height="350" />
</div>

So instead of tuning down all the effects in order to somewhat save the minimap, I decided to develop a simple effect that masks a portion of the screen from a series of of effects that can be definied by the usual Before/After paradigm.

The idea is to sample the frame texture in the Before pass (before all other effects are applied) and store it in order to blend it with the After pass afterwards.

```hlsl
float4 PS_Before(float4 pos : SV_Position, float2 texcoord : TEXCOORD) : SV_Target
{
    return tex2D(ReShade::BackBuffer, texcoord);
}

technique Before
{
    pass
    {
        VertexShader = PostProcessVS;
        PixelShader = PS_Before;
        RenderTarget = Before;
    }
}
```

Through the ReShade menu in-game is then possible to set up the masking shape through some very self-explainatory parameters.

<div class="custom-image-container-centered">
  <img src="/ElfyLab/img/posts/ShapeMask.png" height="300" />
</div>


If the textcoords of a certain pixel fall inside the shape, then the sampler from the Before pass is applied.
Otherwise, if the textcoords fall outside the shape, then the sampler simply applies the After pass without filtering the other effects.

```hlsl
if (isInsideCircle)
{
	color = tex2D(Before_sampler, texcoord)
}
else
{
	color = tex2D(ReShade::BackBuffer, texcoord);
}
```
Although this works already, it is clear that some kind of blending should be applied in order to smooth the mask section with the unmasked one.
So we add a lerp function to blend the two samplers in an area around the margins of the shape.
```hlsl
float blending_amount = (length(normalizedCoords) - radius) / blendingDist;

if (isInsideCircle)
{
	color = tex2D(Before_sampler, texcoord)
}
else if (isInsideBlending)
{
	color = lerp(color, tex2D(ReShade::BackBuffer, texcoord), blending_amount);
}
else
{
	color = tex2D(ReShade::BackBuffer, texcoord);
}
```
Quite easy.
Now the real troubles begin when the UI elements you need to mask are not permament and therefore leaving the mask effect applied after they disappear.

<div class="custom-image-container-centered">
  <img src="/ElfyLab/img/posts/ShapeMaskfadeOff.png" height="500" />
</div>

However, by enabling the "Fade" option (tick box in the ReShade UI picture), we can enable one more blending property in the shader that modulates, again, the before/after samplers based on the difference in color of the pixels.

```hlsl
float4 color_diff = (color_after - color_before);
float light_diff = max(max(abs(color_diff.r), abs(color_diff.g)), abs(color_diff.b));
float light_scale = clamp(light_diff * pow(4, light_diff * 2) - (1 * light_diff),0, 1);
```
And then...
```hlsl
float blending_amount = (length(normalizedCoords) - radius) / blendingDist;

if (isInsideCircle)
{
    color = tex2D(Before_sampler, texcoord);
    color = lerp(tex2D(ReShade::BackBuffer, texcoord), tex2D(Before_sampler, texcoord), light_scale);

}
else if (isInsideBlending)
{
    color = lerp(tex2D(ReShade::BackBuffer, texcoord), tex2D(Before_sampler, texcoord), light_scale);
    color = lerp(color, tex2D(ReShade::BackBuffer, texcoord), blending_amount);

}
else
{
    color = tex2D(ReShade::BackBuffer, texcoord);
}
```

The result is just perfect (at least in all the areas of the game I tested so far) as you can see applied on the previous example.
So far the fix worked perfectly in different light conditions and while moving the character and/or the camera around.
<div class="custom-image-container-centered">
  <img src="/ElfyLab/img/posts/ShapeMaskfadeOn.png" height="500" />
</div>

I swear the mask effect is still enabled! 😅

And the final result is a fixed UI element that is allowed to disappear without interefering with the nice effects!

<div class="custom-image-container">
  <img src="/ElfyLab/img/posts/reshadeIssue.png" height="350" />
  <img src="/ElfyLab/img/posts/reshadeIssueFix.png" height="350" />
</div>

Here's a link to download the ShapeMask.fx effect:
<b>Download to ShapeMask.fx:</b> <a href="/ElfyLab/downloads/ShapeMask.fx" download>Click to Download!</a>

See you next time!
