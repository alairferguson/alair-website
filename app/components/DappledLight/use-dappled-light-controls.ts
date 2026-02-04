import { useControls, button } from "leva";
import { DEFAULTS, BLEND_MODES } from "./constants";

// ============================================================================
// LEVA CONTROLS HOOK
// ============================================================================

export function useDappledLightControls() {
    const [{ disabled, blendMode, opacity }, setDisplay] = useControls("Display", () => ({
        disabled: {
            value: DEFAULTS.disabled,
            label: "Disabled",
        },
        blendMode: {
            value: DEFAULTS.blendMode,
            options: BLEND_MODES,
            label: "Blend Mode",
        },
        opacity: {
            value: DEFAULTS.opacity,
            min: 0,
            max: 1,
            step: 0.01,
            label: "Opacity",
        },
    }));

    const [{ scale1, scale2 }] = useControls("Pattern Size", () => ({
        scale1: {
            value: DEFAULTS.scale1,
            min: 1,
            max: 20,
            step: 0.5,
            label: "Layer 1 Scale",
        },
        scale2: {
            value: DEFAULTS.scale2,
            min: 1,
            max: 20,
            step: 0.5,
            label: "Layer 2 Scale",
        },
    }));

    const [{ layerWeight1, layerWeight2 }] = useControls("Layer Weights", () => ({
        layerWeight1: {
            value: DEFAULTS.layerWeight1,
            min: 0,
            max: 2,
            step: 0.1,
            label: "Layer 1 Weight",
        },
        layerWeight2: {
            value: DEFAULTS.layerWeight2,
            min: 0,
            max: 2,
            step: 0.1,
            label: "Layer 2 Weight",
        },
    }));

    const [{ windSpeed, swayAmount }] = useControls("Animation", () => ({
        windSpeed: {
            value: DEFAULTS.windSpeed,
            min: 0,
            max: 4,
            step: 0.1,
            label: "Wind Speed",
        },
        swayAmount: {
            value: DEFAULTS.swayAmount,
            min: 0,
            max: 1,
            step: 0.01,
            label: "Sway Amount",
        },
    }));

    const [{ voronoiTimeSpeed, voronoiSizeVariation, debugVoronoi }] = useControls("Voronoi", () => ({
        voronoiTimeSpeed: {
            value: DEFAULTS.voronoiTimeSpeed,
            min: 0,
            max: 2,
            step: 0.01,
            label: "Time Speed",
        },
        voronoiSizeVariation: {
            value: DEFAULTS.voronoiSizeVariation,
            min: 0,
            max: 2,
            step: 0.05,
            label: "Size Variation",
        },
        debugVoronoi: {
            value: DEFAULTS.debugVoronoi,
            label: "Debug Cells",
        },
    }));

    const [{ warmTint, shadowColor, tintStrength, blendIntensity }, setColors] = useControls("Colors", () => ({
        warmTint: {
            value: DEFAULTS.warmTint,
            label: "Light Tint",
        },
        shadowColor: {
            value: DEFAULTS.shadowColor,
            label: "Shadow Color",
        },
        tintStrength: {
            value: DEFAULTS.tintStrength,
            min: 0,
            max: 1,
            step: 0.05,
            label: "Tint Strength",
        },
        blendIntensity: {
            value: DEFAULTS.blendIntensity,
            min: 0,
            max: 1,
            step: 0.05,
            label: "Blend Intensity",
        },
    }));

    const [{ spotPower, spotSize, intensityPower }] = useControls("Intensity", () => ({
        spotPower: {
            value: DEFAULTS.spotPower,
            min: 0.5,
            max: 3,
            step: 0.1,
            label: "Spot Power",
        },
        spotSize: {
            value: DEFAULTS.spotSize,
            min: 0.1,
            max: 3,
            step: 0.1,
            label: "Spot Size",
        },
        intensityPower: {
            value: DEFAULTS.intensityPower,
            min: 0.1,
            max: 2,
            step: 0.1,
            label: "Intensity Power",
        },
    }));

    const [{ variationAmount, textureAmount, textureScale }] = useControls("Texture", () => ({
        variationAmount: {
            value: DEFAULTS.variationAmount,
            min: 0,
            max: 1,
            step: 0.05,
            label: "Variation Amount",
        },
        textureAmount: {
            value: DEFAULTS.textureAmount,
            min: 0,
            max: 0.1,
            step: 0.005,
            label: "Texture Amount",
        },
        textureScale: {
            value: DEFAULTS.textureScale,
            min: 10,
            max: 100,
            step: 5,
            label: "Texture Scale",
        },
    }));

    const [
        {
            scrollResponseEnabled,
            scrollDriftAmount,
            scrollDriftSmoothing,
            scrollDriftLayer1,
            scrollDriftLayer2,
        },
    ] = useControls("Scroll Response", () => ({
        scrollResponseEnabled: {
            value: DEFAULTS.scrollResponseEnabled,
            label: "Enabled",
        },
        scrollDriftAmount: {
            value: DEFAULTS.scrollDriftAmount,
            min: 0,
            max: 0.01,
            step: 0.005,
            label: "Drift Amount",
        },
        scrollDriftSmoothing: {
            value: DEFAULTS.scrollDriftSmoothing,
            min: 0.01,
            max: 0.3,
            step: 0.01,
            label: "Drift Smoothing (Lag)",
        },
        scrollDriftLayer1: {
            value: DEFAULTS.scrollDriftLayer1,
            min: 0,
            max: 2,
            step: 0.1,
            label: "Layer 1 Parallax",
        },
        scrollDriftLayer2: {
            value: DEFAULTS.scrollDriftLayer2,
            min: 0,
            max: 2,
            step: 0.1,
            label: "Layer 2 Parallax",
        },
    }));

    const [{ mouseRadius, mouseStrength }] = useControls("Mouse Cursor", () => ({
        mouseRadius: {
            value: DEFAULTS.mouseRadius,
            min: 0,
            max: 5,
            step: 0.1,
            label: "Radius",
        },
        mouseStrength: {
            value: DEFAULTS.mouseStrength,
            min: 0,
            max: 2,
            step: 0.05,
            label: "Strength",
        },
    }));

    const [{ backgroundColor }] = useControls("Document", () => ({
        backgroundColor: {
            value: DEFAULTS.backgroundColor,
            label: "Background Color",
        },
    }));

    useControls("Presets", () => ({
        "Default": button(() => {
            setDisplay({
                blendMode: DEFAULTS.blendMode,
                opacity: DEFAULTS.opacity,
            });
            setColors({
                warmTint: DEFAULTS.warmTint,
                shadowColor: DEFAULTS.shadowColor,
                tintStrength: DEFAULTS.tintStrength,
                blendIntensity: DEFAULTS.blendIntensity,
            });
        }),
        "Normal 1.0": button(() => {
            setDisplay({ blendMode: "normal", opacity: 1.0 });
        }),
        "Hard Light 0.1": button(() => {
            setDisplay({ blendMode: "hard-light", opacity: 0.1 });
        }),
        "Color Burn 0.08": button(() => {
            setDisplay({ blendMode: "color-burn", opacity: DEFAULTS.opacity });
        }),
    }));

    return {
        // Display
        disabled,
        blendMode,
        opacity,

        // Pattern
        scale1,
        scale2,
        layerWeight1,
        layerWeight2,

        // Animation
        windSpeed,
        swayAmount,

        // Voronoi
        voronoiTimeSpeed,
        voronoiSizeVariation,
        debugVoronoi,

        // Colors
        warmTint,
        shadowColor,
        tintStrength,
        blendIntensity,

        // Intensity
        spotPower,
        spotSize,
        intensityPower,

        // Texture
        variationAmount,
        textureAmount,
        textureScale,

        // Scroll
        scrollResponseEnabled,
        scrollDriftAmount,
        scrollDriftSmoothing,
        scrollDriftLayer1,
        scrollDriftLayer2,

        // Mouse Cursor
        mouseRadius,
        mouseStrength,

        // Document
        backgroundColor,
    };
}
