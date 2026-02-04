// ============================================================================
// SHADER CODE
// ============================================================================

export const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export const fragmentShaderSource = `
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
  uniform float u_voronoiTime;  // Accumulated time for shimmer (variable rate, no reversal)
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
        // Uses accumulated voronoi time (variable rate during scroll, no reversal)
        point = 0.5 + 0.35 * sin(u_voronoiTime + 6.2831 * point);
        
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
