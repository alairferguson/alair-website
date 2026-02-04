"use client";

// WebGL shader component that recreates that beautiful dappled light effect 
// sunlight filtering through tree leaves creating those soft, circular bokeh-like light spots

import { useEffect, useRef, useState } from "react";
import { useControls, Leva, button } from "leva";

// ============================================================================
// SHADER CODE
// ============================================================================

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  
  uniform vec2 u_resolution;
  uniform float u_time;
  
  // Pattern controls
  uniform float u_scale1;
  uniform float u_scale2;
  uniform float u_layerWeight1;
  uniform float u_layerWeight2;
  
  // Wind/sway controls
  uniform float u_windSpeed;
  uniform float u_swayAmount;
  
  // Voronoi controls
  uniform float u_voronoiTimeSpeed;
  uniform float u_voronoiSizeVariation;
  uniform float u_debugVoronoi;
  
  // Color controls
  uniform vec3 u_warmTint;
  uniform vec3 u_shadowColor;
  uniform float u_tintStrength;
  uniform float u_blendIntensity;
  
  // Texture controls
  uniform float u_variationAmount;
  uniform float u_textureAmount;
  uniform float u_textureScale;
  
  // Intensity controls
  uniform float u_spotPower;
  uniform float u_spotSize;
  uniform float u_intensityPower;
  
  // Scroll drift - Y offset from scrolling (creates parallax)
  uniform float u_scrollDrift;
  uniform float u_scrollDriftLayer1;
  uniform float u_scrollDriftLayer2;
  
  // Persistent sway offset - accumulates from scroll, doesn't revert
  uniform vec2 u_swayOffset;
  
  // Hash functions
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }
  
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  
  // Voronoi - creates cellular pattern like light through leaves
  float voronoi(vec2 uv, float time, out float secondMinDist) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    
    float minDist = 1.0;
    secondMinDist = 1.0;
    
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 neighbor = vec2(float(x), float(y));
        vec2 point = hash2(i + neighbor);
        
        // Very subtle time variation - minimal shimmer
        point = 0.5 + 0.35 * sin(time * u_voronoiTimeSpeed + 6.2831 * point);
        
        vec2 diff = neighbor + point - f;
        float dist = length(diff);
        
        // Add size variation - scale distance by a random factor per cell
        // This makes some spots larger (smaller distance) and some smaller (larger distance)
        float sizeVariation = 1.0 + (hash(i + neighbor) - 0.5) * u_voronoiSizeVariation;
        dist *= sizeVariation;
        
        if (dist < minDist) {
          secondMinDist = minDist;
          minDist = dist;
        } else if (dist < secondMinDist) {
          secondMinDist = dist;
        }
      }
    }
    
    return minDist;
  }
  
  // Wind sway function - creates natural swaying motion
  // Now takes persistent offset that oscillation happens around
  vec2 windSway(float time, float speed, float amount, float phase, vec2 persistentOffset) {
    // Primary sway (slow, large movement like main branches)
    float swayX = sin(time * speed + phase) * amount;
    float swayY = cos(time * speed * 0.7 + phase * 1.3) * amount * 0.6;
    
    // Secondary flutter (faster, smaller - like leaves)
    swayX += sin(time * speed * 2.3 + phase * 2.0) * amount * 0.15;
    swayY += cos(time * speed * 2.7 + phase * 1.7) * amount * 0.1;
    
    // Oscillation happens around the persistent offset, not around zero
    return persistentOffset + vec2(swayX, swayY);
  }
  
  // Simplex-like noise (cheaper version)
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  // FBM for organic texture
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }
  
  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uvAspect = vec2(uv.x * aspect, uv.y);
    
    float time = u_time;
    
    // Scroll drift - each layer has different parallax (high branches move less)
    // Negative so scrolling down makes light drift down (like moving through canopy)
    vec2 drift1 = vec2(0.0, -u_scrollDrift * u_scrollDriftLayer1);
    vec2 drift2 = vec2(0.0, -u_scrollDrift * u_scrollDriftLayer2);
    
    // Persistent sway offset per layer (high branches move less)
    vec2 swayOffset1 = u_swayOffset * 0.6;
    vec2 swayOffset2 = u_swayOffset * 1.0;
    
    // Layer 1 - large spots (slow sway, like high branches - less parallax)
    vec2 sway1 = windSway(time, u_windSpeed * 0.6, u_swayAmount * 1.2, 0.0, swayOffset1);
    float v1_second;
    float v1 = voronoi(uvAspect * u_scale1 + sway1 + drift1, time, v1_second);
    float spots1 = smoothstep(0.0, 0.5 * u_spotSize, v1);
    spots1 = 1.0 - spots1;
    spots1 = pow(spots1, u_spotPower);
    
    // Layer 2 - medium spots (medium sway, middle canopy - more parallax)
    vec2 sway2 = windSway(time, u_windSpeed * 0.85, u_swayAmount * 0.9, 1.5, swayOffset2);
    float v2_second;
    float v2 = voronoi(uvAspect * u_scale2 + sway2 + drift2 + 10.0, time, v2_second);
    float spots2 = smoothstep(0.0, 0.45 * u_spotSize, v2);
    spots2 = 1.0 - spots2;
    spots2 = pow(spots2, u_spotPower * 1.15);
    
    // Debug mode - show cell boundaries
    if (u_debugVoronoi > 0.5) {
      // Show cell boundaries by highlighting the edge between cells
      float edge1 = smoothstep(0.0, 0.05, v1_second - v1);
      float edge2 = smoothstep(0.0, 0.05, v2_second - v2);
      
      // Normalize weights for visualization
      float totalWeight = u_layerWeight1 + u_layerWeight2;
      float w1 = u_layerWeight1 / max(totalWeight, 0.001);
      float w2 = u_layerWeight2 / max(totalWeight, 0.001);
      
      // Color code the layers with their respective weights
      vec3 debugColor = vec3(0.0);
      debugColor += vec3(1.0, 0.2, 0.2) * (1.0 - edge1) * w1;  // Red for layer 1
      debugColor += vec3(0.2, 1.0, 0.2) * (1.0 - edge2) * w2;  // Green for layer 2
      
      gl_FragColor = vec4(debugColor, 1.0);
      return;
    }
    
    // Combine layers with configurable weights
    float totalWeight = u_layerWeight1 + u_layerWeight2;
    float light = (spots1 * u_layerWeight1 + spots2 * u_layerWeight2) / max(totalWeight, 0.001);
    
    // Add organic variation
    float variation = fbm(uvAspect * 3.0);
    light = light * (1.0 - u_variationAmount * 0.5) + light * variation * u_variationAmount;
    
    // Boost intensity
    light = pow(light, u_intensityPower);
    light = clamp(light, 0.0, 1.0);
    
    // Map to blend mode intensity
    float blend = light * u_blendIntensity;
    
    // Apply warm tint to light areas, shadow color to dark areas
    vec3 lightColor = mix(vec3(1.0), u_warmTint, light * u_tintStrength);
    vec3 color = mix(u_shadowColor, lightColor, blend);
    
    // Add texture
    float texture = noise(uvAspect * u_textureScale) * u_textureAmount;
    color += texture;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// ============================================================================
// WEBGL UTILITIES
// ============================================================================

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createProgram(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
): WebGLProgram | null {
    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BLEND_MODES = {
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
const DEFAULTS = {
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

    // Scroll Response
    scrollResponseEnabled: true,
    scrollMaxVelocity: 3000, // px/sec - velocity that maps to activity = 1.0
    scrollRiseRate: 0.15, // How fast activity rises (0-1, higher = faster)
    scrollDecayRate: 0.03, // How fast activity decays (0-1, higher = faster)
    // NOTE: sway amplitude is NOT velocity-modulated (causes "undo" effect)
    // Scroll response for sway comes from persistent offset accumulation instead
    scrollWindMin: 0.3, // Wind speed at rest
    scrollWindMax: 1.2, // Wind speed when scrolling fast
    scrollSpotSizeMin: 1.0, // Spot size at rest
    scrollSpotSizeMax: 1.15, // Spot size when scrolling fast (bloom effect)
    scrollVoronoiSpeedMin: 0.05, // Voronoi time speed at rest
    scrollVoronoiSpeedMax: 0.15, // Voronoi time speed when scrolling fast

    // Scroll Drift (Y-axis parallax)
    scrollDriftAmount: 0.0003, // How much scroll position affects UV offset
    scrollDriftSmoothing: 0.08, // How fast drift catches up (0-1, lower = more lag)
    scrollDriftLayer1: 0.6, // Layer 1 parallax multiplier (high branches, less movement)
    scrollDriftLayer2: 1.0, // Layer 2 parallax multiplier (low branches, more movement)

    // Document
    backgroundColor: "#eeeeee",
    backgroundColorDark: "#0a0a0a",
};

const isDev = process.env.NODE_ENV === "development";

// Custom Leva theme with larger width and font size for better readability
const levaTheme = {
    sizes: {
        rootWidth: "400px", // Increased from default 280px
        colorPickerWidth: "200px", // Increased from default 160px
        colorPickerHeight: "200px", // Increased from default 100px
    },
    fontSizes: {
        root: "10px", // Increased from default 11px
    },
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function DappledLight() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const animationRef = useRef<number>(0);
    const uniformLocationsRef = useRef<Record<string, WebGLUniformLocation | null>>({});

    // Scroll velocity tracking
    const scrollStateRef = useRef({
        lastScrollY: 0,
        lastTime: 0,
        velocity: 0,
        activity: 0, // 0 = still, 1 = fast scroll
        smoothedScrollY: 0, // Lagged scroll position for drift effect
        swayOffsetX: 0, // Persistent sway offset (accumulates, doesn't revert)
        swayOffsetY: 0,
    });

    // Debug state for displaying activity
    const [debugActivity, setDebugActivity] = useState(0);

    // Store current control values in refs so render loop can access them
    // Initialized with DEFAULTS, then kept in sync with Leva controls via useEffect
    const controlsRef = useRef({
        scale1: DEFAULTS.scale1,
        scale2: DEFAULTS.scale2,
        layerWeight1: DEFAULTS.layerWeight1,
        layerWeight2: DEFAULTS.layerWeight2,
        windSpeed: DEFAULTS.windSpeed,
        swayAmount: DEFAULTS.swayAmount,
        voronoiTimeSpeed: DEFAULTS.voronoiTimeSpeed,
        voronoiSizeVariation: DEFAULTS.voronoiSizeVariation,
        debugVoronoi: DEFAULTS.debugVoronoi,
        warmTint: DEFAULTS.warmTint,
        shadowColor: DEFAULTS.shadowColor,
        tintStrength: DEFAULTS.tintStrength,
        blendIntensity: DEFAULTS.blendIntensity,
        spotPower: DEFAULTS.spotPower,
        spotSize: DEFAULTS.spotSize,
        intensityPower: DEFAULTS.intensityPower,
        variationAmount: DEFAULTS.variationAmount,
        textureAmount: DEFAULTS.textureAmount,
        textureScale: DEFAULTS.textureScale,
    });

    // Detect dark mode
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Leva controls - organized by category using folders
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
            scrollMaxVelocity,
            scrollRiseRate,
            scrollDecayRate,
            scrollWindMin,
            scrollWindMax,
            scrollSpotSizeMin,
            scrollSpotSizeMax,
            scrollVoronoiSpeedMin,
            scrollVoronoiSpeedMax,
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
        scrollMaxVelocity: {
            value: DEFAULTS.scrollMaxVelocity,
            min: 500,
            max: 5000,
            step: 100,
            label: "Max Velocity (px/s)",
        },
        scrollRiseRate: {
            value: DEFAULTS.scrollRiseRate,
            min: 0.05,
            max: 0.5,
            step: 0.01,
            label: "Rise Rate",
        },
        scrollDecayRate: {
            value: DEFAULTS.scrollDecayRate,
            min: 0.01,
            max: 0.1,
            step: 0.005,
            label: "Decay Rate",
        },
        scrollWindMin: {
            value: DEFAULTS.scrollWindMin,
            min: 0,
            max: 2,
            step: 0.1,
            label: "Wind Min (Rest)",
        },
        scrollWindMax: {
            value: DEFAULTS.scrollWindMax,
            min: 0,
            max: 4,
            step: 0.1,
            label: "Wind Max (Motion)",
        },
        scrollSpotSizeMin: {
            value: DEFAULTS.scrollSpotSizeMin,
            min: 0.5,
            max: 1.5,
            step: 0.05,
            label: "Spot Size Min (Rest)",
        },
        scrollSpotSizeMax: {
            value: DEFAULTS.scrollSpotSizeMax,
            min: 0.5,
            max: 2,
            step: 0.05,
            label: "Spot Size Max (Motion)",
        },
        scrollVoronoiSpeedMin: {
            value: DEFAULTS.scrollVoronoiSpeedMin,
            min: 0,
            max: 0.5,
            step: 0.01,
            label: "Voronoi Speed Min (Rest)",
        },
        scrollVoronoiSpeedMax: {
            value: DEFAULTS.scrollVoronoiSpeedMax,
            min: 0,
            max: 1,
            step: 0.01,
            label: "Voronoi Speed Max (Motion)",
        },
        scrollDriftAmount: {
            value: DEFAULTS.scrollDriftAmount,
            min: 0,
            max: 0.001,
            step: 0.00005,
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

    // Update controls ref when values change
    useEffect(() => {
        controlsRef.current = {
            scale1,
            scale2,
            layerWeight1,
            layerWeight2,
            windSpeed,
            swayAmount,
            voronoiTimeSpeed,
            voronoiSizeVariation,
            debugVoronoi,
            warmTint,
            shadowColor,
            tintStrength,
            blendIntensity,
            spotPower,
            spotSize,
            intensityPower,
            variationAmount,
            textureAmount,
            textureScale,
        };
    }, [
        scale1,
        scale2,
        layerWeight1,
        layerWeight2,
        windSpeed,
        swayAmount,
        voronoiTimeSpeed,
        voronoiSizeVariation,
        debugVoronoi,
        warmTint,
        shadowColor,
        tintStrength,
        blendIntensity,
        spotPower,
        spotSize,
        intensityPower,
        variationAmount,
        textureAmount,
        textureScale,
    ]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handler);

        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // Scroll velocity tracking
    useEffect(() => {
        if (!scrollResponseEnabled) {
            scrollStateRef.current.activity = 0;
            return;
        }

        const state = scrollStateRef.current;
        state.lastScrollY = window.scrollY;
        state.lastTime = performance.now();

        const handleScroll = () => {
            const now = performance.now();
            const dt = (now - state.lastTime) / 1000; // seconds
            const dy = Math.abs(window.scrollY - state.lastScrollY);

            if (dt > 0 && dt < 0.1) {
                // Calculate raw velocity (px/sec), clamped
                const rawVelocity = Math.min(dy / dt, scrollMaxVelocity);

                // Normalize to activity level (0-1)
                const targetActivity = rawVelocity / scrollMaxVelocity;

                // Smooth with asymmetric rates: fast rise, slow decay
                const smoothing = targetActivity > state.activity ? scrollRiseRate : scrollDecayRate;
                state.activity += (targetActivity - state.activity) * smoothing;

                state.velocity = rawVelocity;

                // Accumulate persistent sway offset based on scroll
                // Creates lateral drift that doesn't revert when stopping
                const scrollDelta = window.scrollY - state.lastScrollY;
                const swayPush = scrollDelta * 0.0001; // Small factor for UV space

                // Add some X variation based on scroll (organic lateral movement)
                // Use time to create slight randomness in direction
                const timeNoise = Math.sin(performance.now() * 0.001) * 0.5;
                state.swayOffsetX += swayPush * (0.3 + timeNoise * 0.2);
                state.swayOffsetY += swayPush * 0.1; // Slight Y component too
            }

            state.lastScrollY = window.scrollY;
            state.lastTime = now;
        };

        // Also decay activity when not scrolling (in animation loop)
        // This happens naturally as activity decays toward 0

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrollResponseEnabled, scrollMaxVelocity, scrollRiseRate, scrollDecayRate]);

    // Update CSS variable only if customized, otherwise let CSS handle dark mode
    const isCustomBg = backgroundColor !== DEFAULTS.backgroundColor && backgroundColor !== DEFAULTS.backgroundColorDark;

    useEffect(() => {
        if (isCustomBg) {
            document.documentElement.style.setProperty('--background', backgroundColor);
        } else {
            document.documentElement.style.removeProperty('--background');
        }
    }, [backgroundColor, isCustomBg]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || isDarkMode || disabled) return;

        const gl = canvas.getContext("webgl", {
            antialias: false,
            depth: false,
            stencil: false,
            preserveDrawingBuffer: false,
        });

        if (!gl) {
            console.error("WebGL not supported");
            return;
        }

        glRef.current = gl;

        // Create shaders
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) return;

        const program = createProgram(gl, vertexShader, fragmentShader);
        if (!program) return;

        programRef.current = program;

        // Clean up shaders after linking (they're now part of the program)
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        // Set up geometry (full screen quad)
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
            gl.STATIC_DRAW
        );

        const positionLocation = gl.getAttribLocation(program, "a_position");

        // Store uniform locations
        const uniforms = {
            resolution: gl.getUniformLocation(program, "u_resolution"),
            time: gl.getUniformLocation(program, "u_time"),
            scale1: gl.getUniformLocation(program, "u_scale1"),
            scale2: gl.getUniformLocation(program, "u_scale2"),
            layerWeight1: gl.getUniformLocation(program, "u_layerWeight1"),
            layerWeight2: gl.getUniformLocation(program, "u_layerWeight2"),
            windSpeed: gl.getUniformLocation(program, "u_windSpeed"),
            swayAmount: gl.getUniformLocation(program, "u_swayAmount"),
            voronoiTimeSpeed: gl.getUniformLocation(program, "u_voronoiTimeSpeed"),
            voronoiSizeVariation: gl.getUniformLocation(program, "u_voronoiSizeVariation"),
            debugVoronoi: gl.getUniformLocation(program, "u_debugVoronoi"),
            warmTint: gl.getUniformLocation(program, "u_warmTint"),
            shadowColor: gl.getUniformLocation(program, "u_shadowColor"),
            tintStrength: gl.getUniformLocation(program, "u_tintStrength"),
            blendIntensity: gl.getUniformLocation(program, "u_blendIntensity"),
            spotPower: gl.getUniformLocation(program, "u_spotPower"),
            spotSize: gl.getUniformLocation(program, "u_spotSize"),
            intensityPower: gl.getUniformLocation(program, "u_intensityPower"),
            variationAmount: gl.getUniformLocation(program, "u_variationAmount"),
            textureAmount: gl.getUniformLocation(program, "u_textureAmount"),
            textureScale: gl.getUniformLocation(program, "u_textureScale"),
            scrollDrift: gl.getUniformLocation(program, "u_scrollDrift"),
            scrollDriftLayer1: gl.getUniformLocation(program, "u_scrollDriftLayer1"),
            scrollDriftLayer2: gl.getUniformLocation(program, "u_scrollDriftLayer2"),
            swayOffset: gl.getUniformLocation(program, "u_swayOffset"),
        };

        uniformLocationsRef.current = uniforms;

        // Use program once and set up attributes (they don't change)
        gl.useProgram(program);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Handle resize - read CSS-computed size, only set internal buffer
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const rect = canvas.getBoundingClientRect();

            canvas.width = Math.floor(rect.width * dpr);
            canvas.height = Math.floor(rect.height * dpr);

            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        resize();
        window.addEventListener("resize", resize);

        // Animation loop
        const startTime = performance.now();
        let isRunning = true;

        // Lerp helper
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        const render = () => {
            if (!isRunning) return;

            const time = (performance.now() - startTime) / 1000;
            const uniforms = uniformLocationsRef.current;
            const c = controlsRef.current;
            const scrollState = scrollStateRef.current;

            // Decay activity when not scrolling (gentle exponential decay)
            if (scrollResponseEnabled) {
                scrollState.activity *= 0.97;

                // Smooth scroll position toward actual scroll (creates lag/drift)
                const targetScrollY = window.scrollY;
                scrollState.smoothedScrollY += (targetScrollY - scrollState.smoothedScrollY) * scrollDriftSmoothing;
            }

            // Calculate dynamic values based on scroll activity
            const activity = scrollResponseEnabled ? scrollState.activity : 0;
            // NOTE: swayAmount is NOT velocity-modulated - changing amplitude causes "undo" effect
            // Instead, scroll response comes from persistent offset accumulation
            const dynamicWindSpeed = lerp(scrollWindMin, scrollWindMax, activity);
            const dynamicSpotSize = lerp(scrollSpotSizeMin, scrollSpotSizeMax, activity);
            const dynamicVoronoiSpeed = lerp(scrollVoronoiSpeedMin, scrollVoronoiSpeedMax, activity);

            // Calculate scroll drift (UV offset from smoothed scroll position)
            const scrollDrift = scrollResponseEnabled ? scrollState.smoothedScrollY * scrollDriftAmount : 0;

            // Update debug display (throttled to ~30fps for performance)
            if (isDev && Math.floor(time * 30) !== Math.floor((time - 1/60) * 30)) {
                setDebugActivity(activity);
            }

            // Update uniforms
            gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
            gl.uniform1f(uniforms.time, time);
            gl.uniform1f(uniforms.scale1, c.scale1);
            gl.uniform1f(uniforms.scale2, c.scale2);
            gl.uniform1f(uniforms.layerWeight1, c.layerWeight1);
            gl.uniform1f(uniforms.layerWeight2, c.layerWeight2);
            gl.uniform1f(uniforms.windSpeed, scrollResponseEnabled ? dynamicWindSpeed : c.windSpeed);
            // Sway amount stays constant - no velocity modulation (causes "undo" effect)
            gl.uniform1f(uniforms.swayAmount, c.swayAmount);
            gl.uniform1f(uniforms.voronoiTimeSpeed, scrollResponseEnabled ? dynamicVoronoiSpeed : c.voronoiTimeSpeed);
            gl.uniform1f(uniforms.voronoiSizeVariation, c.voronoiSizeVariation);
            gl.uniform1f(uniforms.debugVoronoi, c.debugVoronoi ? 1.0 : 0.0);
            // Normalize RGB values from Leva (0-255) to shader range (0-1)
            gl.uniform3f(uniforms.warmTint, c.warmTint.r / 255, c.warmTint.g / 255, c.warmTint.b / 255);
            gl.uniform3f(uniforms.shadowColor, c.shadowColor.r / 255, c.shadowColor.g / 255, c.shadowColor.b / 255);
            gl.uniform1f(uniforms.tintStrength, c.tintStrength);
            gl.uniform1f(uniforms.blendIntensity, c.blendIntensity);
            gl.uniform1f(uniforms.spotPower, c.spotPower);
            gl.uniform1f(uniforms.spotSize, scrollResponseEnabled ? dynamicSpotSize : c.spotSize);
            gl.uniform1f(uniforms.intensityPower, c.intensityPower);
            gl.uniform1f(uniforms.variationAmount, c.variationAmount);
            gl.uniform1f(uniforms.textureAmount, c.textureAmount);
            gl.uniform1f(uniforms.textureScale, c.textureScale);

            // Scroll drift uniforms
            gl.uniform1f(uniforms.scrollDrift, scrollDrift);
            gl.uniform1f(uniforms.scrollDriftLayer1, scrollDriftLayer1);
            gl.uniform1f(uniforms.scrollDriftLayer2, scrollDriftLayer2);

            // Persistent sway offset (accumulated from scroll, doesn't revert)
            gl.uniform2f(uniforms.swayOffset, scrollState.swayOffsetX, scrollState.swayOffsetY);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            animationRef.current = requestAnimationFrame(render);
        };

        render();

        // Cleanup
        return () => {
            isRunning = false;
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener("resize", resize);

            if (gl && program) {
                gl.deleteProgram(program);
            }
            if (positionBuffer) {
                gl.deleteBuffer(positionBuffer);
            }

            glRef.current = null;
            programRef.current = null;
            uniformLocationsRef.current = {};
        };
    }, [
        isDarkMode,
        disabled,
        scrollResponseEnabled,
        scrollWindMin,
        scrollWindMax,
        scrollSpotSizeMin,
        scrollSpotSizeMax,
        scrollVoronoiSpeedMin,
        scrollVoronoiSpeedMax,
        scrollDriftAmount,
        scrollDriftSmoothing,
        scrollDriftLayer1,
        scrollDriftLayer2,
    ]);

    return (
        <>
            <Leva hidden={!isDev} collapsed={true} theme={levaTheme} />
            
            {/* Debug: Scroll Activity Indicator */}
            {isDev && scrollResponseEnabled && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "20px",
                        right: "20px",
                        zIndex: 100,
                        background: "rgba(0, 0, 0, 0.8)",
                        color: "white",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        pointerEvents: "none",
                        minWidth: "200px",
                    }}
                >
                    <div style={{ marginBottom: "8px" }}>
                        Activity: {debugActivity.toFixed(3)}
                    </div>
                    <div style={{ 
                        width: "100%", 
                        height: "8px", 
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: "4px",
                        overflow: "hidden",
                    }}>
                        <div style={{
                            width: `${debugActivity * 100}%`,
                            height: "100%",
                            background: `hsl(${120 * debugActivity}, 100%, 50%)`,
                            transition: "width 0.05s linear",
                        }} />
                    </div>
                </div>
            )}

            <div
                style={{
                    position: "fixed",
                    top: "1svh",
                    width: "100vw",
                    zIndex: 50,
                    pointerEvents: "none",

                    mixBlendMode: blendMode as React.CSSProperties["mixBlendMode"],
                    // Fade out at the top and bottom so Safari's cutoff looks intentional
                    maskImage: "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
                }}
            >
                {!isDarkMode && !disabled && (
                    <canvas
                        ref={canvasRef}
                        style={{
                            width: "100vw",
                            height: "98svh",
                            // border: "16px solid blue",
                            opacity,
                        }}
                    />
                )}
            </div>
        </>
    );
}
