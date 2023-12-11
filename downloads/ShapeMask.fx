///////////////////////////////////////////////////////////////////
////                                                           ////
////  Made by Arielfy                                          ////
////  @ElfyLab (https://ariel-logos.github.io/ElfyLab)         ////
////                                                           ////
////  Feel free to edit and share!                             ////
////                                                           ////
///////////////////////////////////////////////////////////////////

#include "ReShade.fxh"
#include "ReShadeUI.fxh"

uniform int mask_shape <
    ui_type = "combo";
    ui_label = "Shape";
    ui_tooltip = "Choose a shape";
    ui_category = "Global Settings";
    ui_items = 
    "Circle\0"
    "Square\0"
    ;
> = 0;

uniform float shape_position_x
<	__UNIFORM_DRAG_FLOAT1
	ui_label = "X position";
	ui_tooltip = "Sets the X coordinate for the shape center";
    ui_category = "Global Settings";
	ui_min = 0f; ui_max = 1f; ui_step = 0.001;
> = 0.5f;
uniform float shape_position_y
<	__UNIFORM_DRAG_FLOAT1
	ui_label = "Y position";
	ui_tooltip = "Sets the Y coordinate for the shape center";
    ui_category = "Global Settings";
	ui_min = 0f; ui_max = 1f; ui_step = 0.001;
> = 0.5f;
uniform float blending
<	__UNIFORM_DRAG_FLOAT1
	ui_label = "Blend Distance";
	ui_tooltip = "Sets the distance from the shape in which to blend between Before and After";
    ui_category = "Global Settings";
	ui_min = 0f; ui_max = 1f; ui_step = 0.001;
> = 0.1f;
uniform bool intensity_scaling
<   ui_label = "Fade with intensity difference from Before sampler.";
	ui_tooltip = "When enabled the mask will apply with the same strength as the difference in pixel intensity.\nIntended to mask storng bloom effects.";
	ui_category = "Global Settings";
    ui_min = 0f; ui_max = 1f; ui_step = 0.001;
> = false;
uniform float radius_R
<	__UNIFORM_DRAG_FLOAT1
	ui_label = "Radius";
	ui_tooltip = "Sets the radius for the circle shape";
    ui_category = "Circle Settings";
	ui_min = 0f; ui_max = 1f; ui_step = 0.001;
> = 0.5f;
uniform float size_x
<	__UNIFORM_DRAG_FLOAT1
	ui_label = "X size";
	ui_tooltip = "Sets the X size of the box shape";
    ui_category = "Box Settings";
	ui_min = 0f; ui_max = 1f; ui_step = 0.001;
> = 0.1f;
uniform float size_y
<	__UNIFORM_DRAG_FLOAT1
	ui_label = "Y size";
	ui_tooltip = "Sets the Y size of the box shape";
    ui_category = "Box Settings";
	ui_min = 0f; ui_max = 1f; ui_step = 0.001;
> = 0.1f;




texture Before
{
    Width = BUFFER_WIDTH;
    Height = BUFFER_HEIGHT;
};
sampler Before_sampler
{
    Texture = Before;
};




float4 PS_Before(float4 pos : SV_Position, float2 texcoord : TEXCOORD) : SV_Target
{
    return tex2D(ReShade::BackBuffer, texcoord);
}

float4 PS_After(float4 pos : SV_Position, float2 texcoord : TEXCOORD) : SV_Target
{
    float width = BUFFER_WIDTH;
    float height = BUFFER_HEIGHT;
    float aspectRatio = width / height;
    float4 color_before = tex2D(Before_sampler, texcoord);
    float4 color_after = tex2D(ReShade::BackBuffer, texcoord);
    float4 color;
    float4 color_diff = (color_after - color_before);
    float light_diff = max(max(abs(color_diff.r), abs(color_diff.g)), abs(color_diff.b));
    //light_scale = min(max(max(color_after.r, color_after.g), color_after.b) + 0.2, 1);
    float light_scale = clamp(light_diff * pow(4, light_diff * 2) - (1 * light_diff),0, 1);
    if (!intensity_scaling)
    {
        light_scale = 1;

    }
    float blendingDist = blending / 10;
    
    [branch]
        if (mask_shape == 0)
        {
            float2 center = float2(shape_position_x * 2, 1 - shape_position_y);
            float radius = radius_R;
            float2 adjustedTexcoord = float2(texcoord.x * aspectRatio, texcoord.y);
            float2 normalizedCoords = adjustedTexcoord - center;
            bool isInsideCircle = length(normalizedCoords) < radius;
            bool isInsideBlending = length(normalizedCoords) < radius + blendingDist;
 
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
        }
    
    [branch]
        if (mask_shape == 1)
        {
            float2 boxCenter = float2(shape_position_x * 2, 1 - shape_position_y); 
            float boxSizeX; 
            float boxSizeY;
    
            boxSizeX = size_x;
            boxSizeY = size_y;
            float2 adjustedTexcoord = float2(texcoord.x * aspectRatio, texcoord.y);
            float2 normalizedCoords = adjustedTexcoord - boxCenter;
        
            bool isInsideBox = false;
            if (abs(normalizedCoords.x) < boxSizeX / 2 && abs(normalizedCoords.y) < boxSizeY / 2)
            {
                isInsideBox = true;
            }
        
            bool isInsideBlending = false;
            if (abs(normalizedCoords.x) < boxSizeX / 2 + blendingDist && abs(normalizedCoords.y) < boxSizeY / 2 + blendingDist)
            {
                isInsideBlending = true;

            }
        
            float blending_amount;
            if (isInsideBlending)
            {
                if (abs(normalizedCoords.x) > boxSizeX / 2 && abs(normalizedCoords.y) > boxSizeY / 2)
                {
                    float cordX = abs(normalizedCoords.x) - (boxSizeX / 2);
                    float cordY = abs(normalizedCoords.y) - (boxSizeY / 2);
                    blending_amount = length(float2(cordX, cordY)) / blendingDist;
                }
                else if (abs(normalizedCoords.x) > boxSizeX / 2)
                {
                    blending_amount = (abs(normalizedCoords.x) - (boxSizeX / 2)) / blendingDist;

                }
                else if (abs(normalizedCoords.y) > boxSizeY / 2)
                {
                    blending_amount = (abs(normalizedCoords.y) - boxSizeY / 2) / blendingDist;
                }

            }
        
            if (isInsideBox)
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
        }
    
    
        return color;
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

technique After
{
    pass
    {
        VertexShader = PostProcessVS;
        PixelShader = PS_After;
    }
}

