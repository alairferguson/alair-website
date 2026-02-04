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
  vec2 windSway(float time, float speed, float amount, float phase) {
    // Primary sway (slow, large movement like main branches)
    float swayX = sin(time * speed + phase) * amount;
    float swayY = cos(time * speed * 0.7 + phase * 1.3) * amount * 0.6;
    
    // Secondary flutter (faster, smaller - like leaves)
    swayX += sin(time * speed * 2.3 + phase * 2.0) * amount * 0.15;
    swayY += cos(time * speed * 2.7 + phase * 1.7) * amount * 0.1;
    
    return vec2(swayX, swayY);
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
    
    // Layer 1 - large spots (slow sway, like high branches)
    vec2 sway1 = windSway(time, u_windSpeed * 0.6, u_swayAmount * 1.2, 0.0);
    float v1_second;
    float v1 = voronoi(uvAspect * u_scale1 + sway1, time, v1_second);
    float spots1 = smoothstep(0.0, 0.5 * u_spotSize, v1);
    spots1 = 1.0 - spots1;
    spots1 = pow(spots1, u_spotPower);
    
    // Layer 2 - medium spots (medium sway, middle canopy)
    vec2 sway2 = windSway(time, u_windSpeed * 0.85, u_swayAmount * 0.9, 1.5);
    float v2_second;
    float v2 = voronoi(uvAspect * u_scale2 + sway2 + 10.0, time, v2_second);
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
    
    // Apply warm tint
    vec3 color = vec3(blend) * mix(vec3(1.0), u_warmTint, light * u_tintStrength);
    
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

    const [{ warmTint, tintStrength, blendIntensity }, setColors] = useControls("Colors", () => ({
        warmTint: {
            value: DEFAULTS.warmTint,
            label: "Warm Tint",
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
            tintStrength: gl.getUniformLocation(program, "u_tintStrength"),
            blendIntensity: gl.getUniformLocation(program, "u_blendIntensity"),
            spotPower: gl.getUniformLocation(program, "u_spotPower"),
            spotSize: gl.getUniformLocation(program, "u_spotSize"),
            intensityPower: gl.getUniformLocation(program, "u_intensityPower"),
            variationAmount: gl.getUniformLocation(program, "u_variationAmount"),
            textureAmount: gl.getUniformLocation(program, "u_textureAmount"),
            textureScale: gl.getUniformLocation(program, "u_textureScale"),
        };

        uniformLocationsRef.current = uniforms;

        // Use program once and set up attributes (they don't change)
        gl.useProgram(program);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Handle resize - use lower DPR for performance
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            const width = window.innerWidth;
            const height = window.innerHeight;

            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";

            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        resize();
        window.addEventListener("resize", resize);

        // Animation loop
        const startTime = performance.now();
        let isRunning = true;

        const render = () => {
            if (!isRunning) return;

            const time = (performance.now() - startTime) / 1000;
            const uniforms = uniformLocationsRef.current;
            const c = controlsRef.current;

            // Update uniforms
            gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
            gl.uniform1f(uniforms.time, time);
            gl.uniform1f(uniforms.scale1, c.scale1);
            gl.uniform1f(uniforms.scale2, c.scale2);
            gl.uniform1f(uniforms.layerWeight1, c.layerWeight1);
            gl.uniform1f(uniforms.layerWeight2, c.layerWeight2);
            gl.uniform1f(uniforms.windSpeed, c.windSpeed);
            gl.uniform1f(uniforms.swayAmount, c.swayAmount);
            gl.uniform1f(uniforms.voronoiTimeSpeed, c.voronoiTimeSpeed);
            gl.uniform1f(uniforms.voronoiSizeVariation, c.voronoiSizeVariation);
            gl.uniform1f(uniforms.debugVoronoi, c.debugVoronoi ? 1.0 : 0.0);
            // Normalize RGB values from Leva (0-255) to shader range (0-1)
            gl.uniform3f(uniforms.warmTint, c.warmTint.r / 255, c.warmTint.g / 255, c.warmTint.b / 255);
            gl.uniform1f(uniforms.tintStrength, c.tintStrength);
            gl.uniform1f(uniforms.blendIntensity, c.blendIntensity);
            gl.uniform1f(uniforms.spotPower, c.spotPower);
            gl.uniform1f(uniforms.spotSize, c.spotSize);
            gl.uniform1f(uniforms.intensityPower, c.intensityPower);
            gl.uniform1f(uniforms.variationAmount, c.variationAmount);
            gl.uniform1f(uniforms.textureAmount, c.textureAmount);
            gl.uniform1f(uniforms.textureScale, c.textureScale);

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
    }, [isDarkMode, disabled]);

    return (
        <>
            <Leva hidden={!isDev} collapsed={false} theme={levaTheme} />
            {!isDarkMode && !disabled && (
                <canvas
                    ref={canvasRef}
                    className="fixed inset-0 w-full h-full z-50 pointer-events-none"
                    style={{
                        display: "block",
                        mixBlendMode: blendMode as React.CSSProperties["mixBlendMode"],
                        opacity,
                    }}
                />
            )}
        </>
    );
}
