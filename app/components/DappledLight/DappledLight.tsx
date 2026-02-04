"use client";

// WebGL shader component that recreates that beautiful dappled light effect 
// sunlight filtering through tree leaves creating those soft, circular bokeh-like light spots

import { useEffect, useRef, useState } from "react";
import { Leva } from "leva";
import { vertexShaderSource, fragmentShaderSource } from "./shaders";
import { createShader, createProgram } from "./webgl-utils";
import { DEFAULTS, isDev, levaTheme } from "./constants";
import { useDappledLightControls } from "./use-dappled-light-controls";
import type { DappledLightControls, ScrollState, UniformLocations } from "./types";

export default function DappledLight() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const animationRef = useRef<number>(0);
    const uniformLocationsRef = useRef<UniformLocations>({} as UniformLocations);
    const dprRef = useRef<number>(1);

    // Mouse position for cursor effect (in canvas pixel coordinates)
    const mousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

    // Scroll state for parallax and animation
    const scrollStateRef = useRef<ScrollState>({
        accumulators: {
            voronoiTime: 0,
            driftY: 0,
        },
        lastRenderTime: 0,
    });

    // Store current control values in refs so render loop can access them
    const controlsRef = useRef<DappledLightControls>({
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
        mouseRadius: DEFAULTS.mouseRadius,
        mouseStrength: DEFAULTS.mouseStrength,
    });

    // Detect dark mode
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Get all Leva controls
    const controls = useDappledLightControls();

    // Update controls ref when values change
    useEffect(() => {
        controlsRef.current = {
            scale1: controls.scale1,
            scale2: controls.scale2,
            layerWeight1: controls.layerWeight1,
            layerWeight2: controls.layerWeight2,
            windSpeed: controls.windSpeed,
            swayAmount: controls.swayAmount,
            voronoiTimeSpeed: controls.voronoiTimeSpeed,
            voronoiSizeVariation: controls.voronoiSizeVariation,
            debugVoronoi: controls.debugVoronoi,
            warmTint: controls.warmTint,
            shadowColor: controls.shadowColor,
            tintStrength: controls.tintStrength,
            blendIntensity: controls.blendIntensity,
            spotPower: controls.spotPower,
            spotSize: controls.spotSize,
            intensityPower: controls.intensityPower,
            variationAmount: controls.variationAmount,
            textureAmount: controls.textureAmount,
            textureScale: controls.textureScale,
            mouseRadius: controls.mouseRadius,
            mouseStrength: controls.mouseStrength,
        };
    }, [controls]);

    // Detect dark mode changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handler);

        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // Update CSS variable for custom background color
    const isCustomBg = controls.backgroundColor !== DEFAULTS.backgroundColor &&
        controls.backgroundColor !== DEFAULTS.backgroundColorDark;

    useEffect(() => {
        if (isCustomBg) {
            document.documentElement.style.setProperty('--background', controls.backgroundColor);
        } else {
            document.documentElement.style.removeProperty('--background');
        }
    }, [controls.backgroundColor, isCustomBg]);

    // Main WebGL setup and render loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || isDarkMode || controls.disabled) return;

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

        // Create shaders and program
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        if (!vertexShader || !fragmentShader) return;

        const program = createProgram(gl, vertexShader, fragmentShader);
        if (!program) return;

        programRef.current = program;

        // Clean up shaders after linking
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
        uniformLocationsRef.current = {
            resolution: gl.getUniformLocation(program, "u_resolution"),
            time: gl.getUniformLocation(program, "u_time"),
            dpr: gl.getUniformLocation(program, "u_dpr"),
            scale1: gl.getUniformLocation(program, "u_scale1"),
            scale2: gl.getUniformLocation(program, "u_scale2"),
            layerWeight1: gl.getUniformLocation(program, "u_layerWeight1"),
            layerWeight2: gl.getUniformLocation(program, "u_layerWeight2"),
            windSpeed: gl.getUniformLocation(program, "u_windSpeed"),
            swayAmount: gl.getUniformLocation(program, "u_swayAmount"),
            voronoiTime: gl.getUniformLocation(program, "u_voronoiTime"),
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
            mousePos: gl.getUniformLocation(program, "u_mousePos"),
            mouseRadius: gl.getUniformLocation(program, "u_mouseRadius"),
            mouseStrength: gl.getUniformLocation(program, "u_mouseStrength"),
        };

        // Set up program and attributes
        gl.useProgram(program);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Handle resize
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            dprRef.current = dpr; // Store DPR for use in shader
            const rect = canvas.getBoundingClientRect();

            canvas.width = Math.floor(rect.width * dpr);
            canvas.height = Math.floor(rect.height * dpr);

            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        resize();
        window.addEventListener("resize", resize);

        // Mouse tracking
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const dpr = dprRef.current;
            // Convert to canvas pixel coordinates
            mousePosRef.current = {
                x: (e.clientX - rect.left) * dpr,
                y: (rect.height - (e.clientY - rect.top)) * dpr, // Flip Y for WebGL
            };
        };

        const handleMouseLeave = () => {
            // Move mouse position far off-screen when not hovering
            mousePosRef.current = { x: -1000, y: -1000 };
        };

        window.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", handleMouseLeave);

        // Animation loop
        const startTime = performance.now();
        let isRunning = true;

        const render = () => {
            if (!isRunning) return;

            const time = (performance.now() - startTime) / 1000;
            const deltaTime = time - scrollStateRef.current.lastRenderTime;
            scrollStateRef.current.lastRenderTime = time;

            const uniforms = uniformLocationsRef.current;
            const c = controlsRef.current;
            const state = scrollStateRef.current;
            const acc = state.accumulators;

            // Voronoi time accumulation
            acc.voronoiTime += deltaTime * c.voronoiTimeSpeed;

            // Parallax drift: smoothed toward scroll position
            if (controls.scrollResponseEnabled) {
                const targetDrift = window.scrollY * controls.scrollDriftAmount;
                acc.driftY += (targetDrift - acc.driftY) * controls.scrollDriftSmoothing;
            }

            // Update uniforms
            gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
            gl.uniform1f(uniforms.time, time);
            gl.uniform1f(uniforms.dpr, dprRef.current);

            // Pattern
            gl.uniform1f(uniforms.scale1, c.scale1);
            gl.uniform1f(uniforms.scale2, c.scale2);
            gl.uniform1f(uniforms.layerWeight1, c.layerWeight1);
            gl.uniform1f(uniforms.layerWeight2, c.layerWeight2);

            // Animation
            gl.uniform1f(uniforms.windSpeed, c.windSpeed);
            gl.uniform1f(uniforms.swayAmount, c.swayAmount);

            // Voronoi
            gl.uniform1f(uniforms.voronoiTime, acc.voronoiTime);
            gl.uniform1f(uniforms.voronoiSizeVariation, c.voronoiSizeVariation);
            gl.uniform1f(uniforms.debugVoronoi, c.debugVoronoi ? 1.0 : 0.0);

            // Colors
            gl.uniform3f(uniforms.warmTint, c.warmTint.r / 255, c.warmTint.g / 255, c.warmTint.b / 255);
            gl.uniform3f(uniforms.shadowColor, c.shadowColor.r / 255, c.shadowColor.g / 255, c.shadowColor.b / 255);
            gl.uniform1f(uniforms.tintStrength, c.tintStrength);
            gl.uniform1f(uniforms.blendIntensity, c.blendIntensity);

            // Intensity
            gl.uniform1f(uniforms.spotPower, c.spotPower);
            gl.uniform1f(uniforms.spotSize, c.spotSize);
            gl.uniform1f(uniforms.intensityPower, c.intensityPower);

            // Texture
            gl.uniform1f(uniforms.variationAmount, c.variationAmount);
            gl.uniform1f(uniforms.textureAmount, c.textureAmount);
            gl.uniform1f(uniforms.textureScale, c.textureScale);

            // Scroll drift (parallax only)
            gl.uniform1f(uniforms.scrollDrift, acc.driftY);
            gl.uniform1f(uniforms.scrollDriftLayer1, controls.scrollDriftLayer1);
            gl.uniform1f(uniforms.scrollDriftLayer2, controls.scrollDriftLayer2);
            gl.uniform2f(uniforms.swayOffset, 0, 0); // No scroll-based sway

            // Mouse cursor effect
            gl.uniform2f(uniforms.mousePos, mousePosRef.current.x, mousePosRef.current.y);
            gl.uniform1f(uniforms.mouseRadius, c.mouseRadius);
            gl.uniform1f(uniforms.mouseStrength, c.mouseStrength);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animationRef.current = requestAnimationFrame(render);
        };

        render();

        // Cleanup
        return () => {
            isRunning = false;
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseleave", handleMouseLeave);

            if (gl && program) {
                gl.deleteProgram(program);
            }
            if (positionBuffer) {
                gl.deleteBuffer(positionBuffer);
            }

            glRef.current = null;
            programRef.current = null;
            uniformLocationsRef.current = {} as UniformLocations;
        };
    }, [
        isDarkMode,
        controls.disabled,
        controls.scrollResponseEnabled,
        controls.scrollDriftAmount,
        controls.scrollDriftSmoothing,
        controls.scrollDriftLayer1,
        controls.scrollDriftLayer2,
    ]);

    return (
        <>
            <Leva hidden={!isDev} collapsed={true} theme={levaTheme} />

            <div
                style={{
                    position: "fixed",
                    top: "1svh",
                    width: "100vw",
                    zIndex: 50,
                    pointerEvents: "none",

                    mixBlendMode: controls.blendMode as React.CSSProperties["mixBlendMode"],
                    // Fade out at the top and bottom so Safari's cutoff looks intentional
                    maskImage: "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)",
                }}
            >
                {!isDarkMode && !controls.disabled && (
                    <canvas
                        ref={canvasRef}
                        style={{
                            width: "100vw",
                            height: "98svh",
                            opacity: controls.opacity,
                        }}
                    />
                )}
            </div>
        </>
    );
}
