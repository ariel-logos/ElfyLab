---
layout: post
title: Save your UI from crazy bloom effects with ShapeMask.fx
tags: [reshade]
---

Hello everyone!
Today I'll share with you my new fx for ReShade aimed at protecting portion of your screen from those wonderful bloom effects available in many ReShade repositories.

The issue started for me working on my FFXI Reshade Preset project. After achieving some very nice results with the combination of many effects it was time to wrap it up.
However, little did I know that I had completely screwed my minimap plugin (<a href="https://git.ashitaxi.com/Plugins/Minimap/commits/commit/78e2952ff4b798410a0535a3d1b73b9ee059d6b1">repo here</a>) that due to the nature of the color of the maps it loads would act as a screen lamp effect that ended up ruining all the good progress.

Here's an example of the way-too-much brightness applied on the minimap as a result of blooming:
<div>
  <img src="/ElfyLab/posts/reshadeIssue.png" height="350" />
</div>

So instead of tuning down all the effects in order to somewhat save the minimap, I decided to develop a simple effect that masks a portion of the screen from a series of of effects that can be definied by the usual Before/After paradigm.

The idea is to sample the frame texture in the Before pass (before all other effects are applied) and store it in order to blend it with the After pass afterwards.

```
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
<div>
  <img src="/ElfyLab/posts/ShapeMask.png" width="500" />
</div>

If the textcoords of a certain pixel fall inside the shape, then the sampler from the Before pass is applied.
Otherwise, if the textcoords fall outside the shape, then the sampler simply applies the After pass without filtering the other effects.

```
            if (isInsideCircle)
            {
                color = tex2D(Before_sampler, texcoord);
            }
            else
            {
                color = tex2D(ReShade::BackBuffer, texcoord);
            }
```
Although this works already, it is clear that some kind of blending should be applied in order to smooth the mask section with the unmasked one.
So we add a lerp function to blend the two samplers in an area around the margins of the shape.
```
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

<img src="/ElfyLab/posts/ShapeMaskfadeOff.png" width="500" />

