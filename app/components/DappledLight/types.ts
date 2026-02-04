// ============================================================================
// TYPES
// ============================================================================

export interface LevaColorValue {
    r: number;
    g: number;
    b: number;
}

export interface DappledLightControls {
    scale1: number;
    scale2: number;
    layerWeight1: number;
    layerWeight2: number;
    windSpeed: number;
    swayAmount: number;
    voronoiTimeSpeed: number;
    voronoiSizeVariation: number;
    debugVoronoi: boolean;
    warmTint: LevaColorValue;
    shadowColor: LevaColorValue;
    tintStrength: number;
    blendIntensity: number;
    spotPower: number;
    spotSize: number;
    intensityPower: number;
    variationAmount: number;
    textureAmount: number;
    textureScale: number;
}

export interface ScrollState {
    accumulators: {
        voronoiTime: number;
        driftY: number;
    };
    lastRenderTime: number;
}

export interface UniformLocations {
    resolution: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
    dpr: WebGLUniformLocation | null;
    scale1: WebGLUniformLocation | null;
    scale2: WebGLUniformLocation | null;
    layerWeight1: WebGLUniformLocation | null;
    layerWeight2: WebGLUniformLocation | null;
    windSpeed: WebGLUniformLocation | null;
    swayAmount: WebGLUniformLocation | null;
    voronoiTime: WebGLUniformLocation | null;
    voronoiSizeVariation: WebGLUniformLocation | null;
    debugVoronoi: WebGLUniformLocation | null;
    warmTint: WebGLUniformLocation | null;
    shadowColor: WebGLUniformLocation | null;
    tintStrength: WebGLUniformLocation | null;
    blendIntensity: WebGLUniformLocation | null;
    spotPower: WebGLUniformLocation | null;
    spotSize: WebGLUniformLocation | null;
    intensityPower: WebGLUniformLocation | null;
    variationAmount: WebGLUniformLocation | null;
    textureAmount: WebGLUniformLocation | null;
    textureScale: WebGLUniformLocation | null;
    scrollDrift: WebGLUniformLocation | null;
    scrollDriftLayer1: WebGLUniformLocation | null;
    scrollDriftLayer2: WebGLUniformLocation | null;
    swayOffset: WebGLUniformLocation | null;
}
