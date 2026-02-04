// ============================================================================
// CONSTANTS
// ============================================================================

export const BLEND_MODES = {
    normal: "normal",
    multiply: "multiply",
    screen: "screen",
    overlay: "overlay",
    "soft-light": "soft-light",
    "hard-light": "hard-light",
    "color-dodge": "color-dodge",
    "color-burn": "color-burn",
    darken: "darken",
    lighten: "lighten",
    difference: "difference",
    exclusion: "exclusion",
} as const;

// Default values - single source of truth for all control defaults
export const DEFAULTS = {
    // Display
    disabled: false,
    blendMode: "hard-light" as const,
    opacity: 0.1,

    // Pattern Size - larger values mean more (smaller) spots
    scale1: 8.0,
    scale2: 4.0,

    // Layer Weights
    layerWeight1: 0.6,
    layerWeight2: 0.4,

    // Animation
    windSpeed: 1.0,
    swayAmount: 0.1,

    // Voronoi
    voronoiTimeSpeed: 0.1,
    voronoiSizeVariation: 0.75,
    debugVoronoi: false,

    // Colors (RGB 0-255 format for Leva color picker)
    warmTint: { r: 255, g: 214, b: 68 }, // Hex #ffd644
    shadowColor: { r: 17, g: 21, b: 34 }, // Hex #111522 (deep blue shadow)
    tintStrength: 1.00,
    blendIntensity: 1.00,

    // Intensity
    spotPower: 0.7,
    spotSize: 1.0,
    intensityPower: 0.7,

    // Texture
    variationAmount: 0.15,
    textureAmount: 0.015,
    textureScale: 40.0,

    // Scroll Response (parallax drift only)
    scrollResponseEnabled: true,
    scrollDriftAmount: 0.001,  // UV offset per scroll pixel
    scrollDriftSmoothing: 0.08, // Lag factor (lower = more lag)
    scrollDriftLayer1: 0.6,     // Layer 1 parallax (high branches)
    scrollDriftLayer2: 1.0,     // Layer 2 parallax (low branches)

    // Document
    backgroundColor: "#eeeeee",
    backgroundColorDark: "#0a0a0a",
};

export const isDev = process.env.NODE_ENV === "development";

// Custom Leva theme with larger width and font size for better readability
export const levaTheme = {
    sizes: {
        rootWidth: "400px", // Increased from default 280px
        colorPickerWidth: "200px", // Increased from default 160px
        colorPickerHeight: "200px", // Increased from default 100px
    },
    fontSizes: {
        root: "10px", // Increased from default 11px
    },
};
