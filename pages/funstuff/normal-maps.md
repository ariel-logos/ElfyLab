---
layout: page
title: Normal Maps
hide: true
permalink: /funstuff/normal-maps/
feature-img: "img/misc/featureImg4.png"
tags: [Page]
---

A **normal map** is a texture that fakes small surface detail (bumps, scratches, bricks) without adding any geometry. The surface itself stays perfectly flat. What changes is the *normal*, the direction the shader believes the surface is facing at each pixel.

That matters because almost all lighting depends on the normal. When light hits a surface it bounces off at the same angle on the other side of the normal. Tilt the normal and the bounce goes somewhere else, so the pixel gets brighter or darker, and the flat surface looks bumpy.

The demo below shows one tiny normal map: a flat plane with a single raised strip. The left half is an outside view, the right half is what the camera sees.

- On the left, the plane is coloured the way a normal map is normally stored: **blue** where the normal is unchanged, **purple** and **cyan** where it is tilted (the red channel stores the left-right tilt, the blue channel the "up" part).
- The white arrow is the *geometric* normal of the plane, straight up. The pink arrow is the normal the normal map gives at the probe point.
- The yellow ray is the light, the orange ray is where it bounces. If the orange ray points at the camera (the cyan ray) the pixel lights up, otherwise it stays dark. The grey ray is where the light would have gone on a flat surface.
- On the right, the camera sees a flat grey plane. Untick *Apply the normal map* to see exactly that, and tick it to see the strip appear, even though no geometry changed.

Things to try: move the probe across the strip and watch the pink normal and the orange ray swing around; drag the camera *back and forward*, or the light, and watch the highlight jump from one side of the strip to the other; set the tilt to a negative value to turn the bump into a groove.

<div id="normal-map-demo"></div>
<script src="{{ '/assets/js/normal-map-demo.js' | relative_url }}"></script>

### Final thoughts

Normal maps are one of the cheapest tricks in real-time graphics: a few triangles plus one extra texture lookup per pixel can pass for millions of triangles of carved stone or bricks. And because the detail comes from the lighting itself, it keeps reacting as lights and cameras move, which is exactly what the demo above shows.

It is still a trick, though. The silhouette stays flat (look at the outline of a normal-mapped sphere) and the bumps cast no shadows and hide nothing behind them. When that is not good enough, techniques like parallax mapping or real displacement take over.
