---
layout: page
title: Lighting and Material Models
hide: true
permalink: /funstuff/lighting-and-material-models/
feature-img: "img/misc/featureImg4.png"
tags: [Page]
---

### Blinn-Phong

The classic real-time shading model adds three terms per light:

- **Ambient**: a flat base level so nothing is ever pitch black.
- **Diffuse**: `max(N·L, 0)`, brightest when the surface faces the light.
- **Specular**: the shiny highlight. Phong uses the reflected light vector (`R·V`). Blinn-Phong uses the half vector `H = normalize(L + V)` and computes `N·H`, which is cheaper and behaves better at grazing angles. Raise *shininess* for a tighter highlight.

**Gaussian + environment** is a different family of model: the highlight is a Gaussian bump in the angle between the normal and the half vector, `exp(-tan²α / m²)`, where *smoothness* sets the width `m`. On top of that it adds an *environment reflection* term (a fake sky reflection tinted by the specular colour), and it is energy conserving: the more the surface reflects the environment, the less diffuse colour it keeps. Game and virtual-world engines have used models like this because they are cheap and easy to tune.

Play with the controls below. Tick **Compare** to see all three models side by side with the same settings (Blinn-Phong highlights come out a bit wider, so it needs roughly 3 to 4 times the shininess to match Phong).

<div id="blinn-phong-demo"></div>
<script src="{{ '/assets/js/blinn-phong-demo.js' | relative_url }}"></script>

### When is environment reflection more useful?

Blinn-Phong only reacts to the light sources you place in the scene. It has no idea what else surrounds the object, so a shiny surface only ever shows small bright dots. Adding an environment reflection term helps in situations like these:

- **Shiny, mirror-like surfaces:** metal, polished stone, glass, water, car paint and wet pavement mostly show their *surroundings*, not just a highlight. A sky or room reflection sells the material far better than a bigger highlight.
- **Scenes without a strong direct light:** under an overcast sky or in an interior lit by many soft sources, there may be no single sharp highlight to see. The environment term still gives the surface a sense of material.
- **Moving objects and cameras:** the reflection shifts as you move around the surface, which gives a strong cue about shape and surface curvature. A plain highlight on a flat or nearly flat surface looks static.
- **Cheap fakes:** you can fake the reflection with a small cubemap or a simple sky gradient (as the demo does), which is much cheaper than ray tracing or real-time reflections.
- **Tuning materials with one control:** a single *environment* value lets an artist go from matte to mirror-like without touching the highlight settings.

The trade-off is that an environment term is only as good as the environment you feed it. A fixed sky gradient reflected in an indoor scene looks wrong, and without occlusion or reflection probes the surface will reflect things that are not actually there. Energy conservation (raising reflection lowers diffuse, as in this demo) keeps the surface from getting unnaturally bright.

Try it: switch to **Gaussian + environment**, set *Environment reflection* to 0, then raise it slowly and watch the surface change from a coloured object with a highlight to something that looks like it is reflecting the sky.


### Blinn-Phong vs PBR

Physically based rendering (PBR) replaces the hand-tuned *ambient / diffuse / specular* numbers with measurable material properties. The common **metallic-roughness** workflow describes a surface with a base colour, a *roughness* value and a *metalness* value, usually stored per pixel in texture maps.

Under the hood it differs from Blinn-Phong in a few ways:

- **Microfacet specular:** the highlight comes from a Cook-Torrance model (here the GGX distribution with Smith geometry), which has the long soft "tail" real materials show, instead of a simple `N·H` to the power `n`.
- **Fresnel:** surfaces reflect more at grazing angles. Blinn-Phong has no such effect.
- **Energy conservation:** light that is reflected is not also diffused, and metals have no diffuse colour at all, they tint their reflection instead.
- **Environment lighting:** the surface also reflects and is lit by its surroundings, not just by the point light. Blinn-Phong only adds one constant ambient value.
- **One consistent set of inputs:** the same roughness and metalness maps look right under any lighting, instead of re-tuning `ks` and `n` for every scene.

In the demo, the left sphere uses Blinn-Phong with the albedo and normal maps, but a single specular strength and shininess for the whole surface. The right sphere uses full metallic-roughness PBR driven by the roughness and metalness maps. Start with the **rusty steel**, which has real values in both the roughness and the metalness map: the bare steel is metallic and fairly smooth, the rust is non-metal and rough. On the right sphere the steel reflects the sky and takes on a metallic tint, while the rust patches stay dull and keep their orange colour. The left sphere uses one specular strength and one shininess for everything, so it cannot tell them apart, and any setting that suits the steel makes the rust look too shiny (and the other way around). Ticking *Drive it with the roughness map* helps a little, but Blinn-Phong still has no idea which parts are metal.

Use the *Metalness offset* slider on the right to push the whole map up or down. At -1 everything becomes non-metal: the steel turns into a plastic-like surface with a white highlight and a diffuse colour, just like the rust. At +1 everything becomes metal, so even the rust reflects the sky with a tinted, rough shine. It adds to the map on any material, so you can also push stone or tiles towards metal (stone is rough, so it looks like brushed metal; lower the *Roughness scale* as well to make it much stronger). Blinn-Phong has no metalness at all, so the left sphere can only imitate this by retuning its colour and highlight by hand. The rusty sign is almost entirely non-metal, so its metalness barely matters, but its roughness map still makes the paint and rust reflect differently. For a look at normal mapping, pick the rock wall or the cobblestones and toggle *Use normal map*: with it on, the flat sphere looks like it has real bumps and gaps, with it off the same surface turns smooth. Both models use the same normal map, so this part is not what separates them. Tick *Drive it with the roughness map* to give Blinn-Phong a bit of help, and turn off *Environment lighting* to see how much of the PBR look comes from reflecting the surroundings.

<div id="pbr-compare-demo" data-base="{{ '/assets/img/materials/' | relative_url }}"></div>
<script src="{{ '/assets/js/pbr-compare-demo.js' | relative_url }}"></script>
