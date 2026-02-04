"use client";

// WebGL shader component that recreates that beautiful dappled light effect 
// sunlight filtering through tree leaves creating those soft, circular bokeh-like light spots

import { useEffect, useRef, useState } from "react";
import { useControls, Leva, button } from "leva";

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
  
  // Hash functions
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
  }
  
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  
  // Voronoi - creates cellular pattern like light through leaves
  float voronoi(vec2 uv, float time) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    
    float minDist = 1.0;
    
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 neighbor = vec2(float(x), float(y));
        vec2 point = hash2(i + neighbor);
        
        // Very subtle time variation - minimal shimmer
        point = 0.5 + 0.35 * sin(time * 0.05 + 6.2831 * point);
        
        vec2 diff = neighbor + point - f;
        float dist = length(diff);
        minDist = min(minDist, dist);
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
    
    // For soft-light blend mode:
    // 0.5 gray = no change
    // > 0.5 = brightens content below
    // < 0.5 = darkens content below
    
    // Create dappled light using layered voronoi
    float scale1 = 4.0;
    float scale2 = 6.0;
    float scale3 = 8.0;
    
    // Wind parameters
    float windSpeed = 0.6;  // How fast the wind blows
    float swayAmount = 0.25; // How far the light pattern moves
    
    // Layer 1 - large spots (slow sway, like high branches)
    vec2 sway1 = windSway(time, windSpeed * 0.6, swayAmount * 1.2, 0.0);
    float v1 = voronoi(uvAspect * scale1 + sway1, time);
    float spots1 = smoothstep(0.0, 0.5, v1);
    spots1 = 1.0 - spots1;
    spots1 = pow(spots1, 1.3);
    
    // Layer 2 - medium spots (medium sway, middle canopy)
    vec2 sway2 = windSway(time, windSpeed * 0.85, swayAmount * 0.9, 1.5);
    float v2 = voronoi(uvAspect * scale2 + sway2 + 10.0, time);
    float spots2 = smoothstep(0.0, 0.45, v2);
    spots2 = 1.0 - spots2;
    spots2 = pow(spots2, 1.5);
    
    // Layer 3 - small spots (faster sway, lower leaves)
    vec2 sway3 = windSway(time, windSpeed * 1.1, swayAmount * 0.7, 3.0);
    float v3 = voronoi(uvAspect * scale3 + sway3 + 20.0, time);
    float spots3 = smoothstep(0.0, 0.4, v3);
    spots3 = 1.0 - spots3;
    spots3 = pow(spots3, 1.7);
    
    // Combine layers with more weight on bright spots
    float light = spots1 * 0.6 + spots2 * 0.3 + spots3 * 0.2;
    
    // Add organic variation (static, just for texture - sway handles motion)
    float variation = fbm(uvAspect * 3.0);
    light = light * 0.9 + light * variation * 0.15;
    
    // Boost intensity significantly
    light = pow(light, 0.7); // Make spots brighter
    
    // Clamp
    light = clamp(light, 0.0, 1.0);
    
    // Map to screen blend mode - MUCH more intense:
    // Shadow areas (light=0) -> 0.0 (no change)
    // Light spots (light=1) -> 0.7+ (very strong brightening)
    // For screen: black (0.0) = no change, white (1.0) = maximum brightening
    float blend = light * 0.75;
    
    // Add intense warm tint to the light spots
    vec3 warmTint = vec3(1.0, 0.88, 0.72); // Strong warm sunlight color
    vec3 color = vec3(blend) * mix(vec3(1.0), warmTint, light * 0.85);
    
    // Subtle texture
    float texture = noise(uvAspect * 40.0) * 0.015;
    color += texture;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

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

const isDev = process.env.NODE_ENV === "development";

export default function DappledLight() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const animationRef = useRef<number>(0);

    // Detect dark mode
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Call all hooks unconditionally (Rules of Hooks)
    const [{ blendMode, opacity }, set] = useControls("Dappled Light", () => ({
        blendMode: {
            value: "color-burn",
            options: BLEND_MODES,
            label: "Blend Mode",
        },
        opacity: {
            value: 0.08,
            min: 0,
            max: 1,
            step: 0.05,
            label: "Opacity",
        },
        "Preset: Hard Light 0.14": button(() => {
            set({ blendMode: "hard-light", opacity: 0.14 });
        }),
        "Preset: Color Burn 0.10": button(() => {
            set({ blendMode: "color-burn", opacity: 0.10 });
        }),
    }));

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handler);

        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || isDarkMode) return;

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
        const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        const timeLocation = gl.getUniformLocation(program, "u_time");

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

            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            gl.uniform1f(timeLocation, time);
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
        };
    }, [isDarkMode]);

    return (
        <>
            <Leva hidden={!isDev} collapsed={false} />
            {!isDarkMode && (
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
