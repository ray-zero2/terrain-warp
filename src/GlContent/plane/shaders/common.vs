#include <common>

uniform float uTime;
uniform vec2 uSubdivision;
uniform float uNumOctaves;
uniform float uFrequency1;
uniform float uFrequency2;
uniform float uAmplitude1;
uniform float uAmplitude2;
uniform float uHeightShadeStart;
uniform float uHeightShadeLength;

varying float vHeightShade;

float random(in vec2 st) {
  return fract(
    sin(
      dot(st.xy, vec2(12.9898, 78.233))
    ) * 43758.5453123
  );
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise(in vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  // Four corners in 2D of a tile
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(
  in vec2 st, float amplitude, in float amplitudeScale,
  out float values[MAX_OCTAVES]
) {
  float value = 0.0;
  float frequency = 0.0;

  for(int i = 0; i < MAX_OCTAVES; i ++ ) {
    float modulation = step(float(i), 1.5) * 2.0 - 1.0;
    modulation *= 1.0 - step(uNumOctaves, float(i));
    values[i] = modulation * amplitude * noise(st);
    value += values[i];
    st *= 2.0;
    amplitude *= amplitudeScale;
  }
  return value;
}

// Based on Inigo Quilez
// https://iquilezles.org/articles/warp/
float domainWarp(
  in vec2 p, in float amplitude,
  out float values[MAX_OCTAVES]
) {
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0) + (0.1 * uTime), 0.5, 0.5, values),
    fbm(p + vec2(5.2, 1.3), 0.5, sin(uTime * 3.0) * 0.5, values)
  );

  vec2 r = vec2(
    fbm(p + 4.0 * q + vec2(1.7, 9.2) + (0.2 * uTime), - 0.3, 0.5, values),
    fbm(p + 7.0 * q + vec2(8.3, 2.8), - 0.3, cos(uTime * 3.75) * 0.5, values)
  );

  float f = fbm(p + uFrequency2 * r, amplitude, uAmplitude2, values);
  f = (f * f * f + (0.6 * f * f) + (0.5 * f));

  return f;
}

vec3 getPosition(vec3 pos, out float values[MAX_OCTAVES]) {
  vec2 p = pos.xy + vec2(0.0, 0.15 * uTime).yx;
  p *= uFrequency1;
  pos.z = domainWarp(p, uAmplitude1, values);
  return pos;
}

void displace(out vec3 displacedPosition, out vec3 displacedNormal) {
  vec3 biTangent = cross(normal, tangent.xyz);
  vec2 delta = 1.0 / uSubdivision;

  float centerValues[MAX_OCTAVES];
  float rightValues[MAX_OCTAVES];
  float topValues[MAX_OCTAVES];
  vec3 center = getPosition(position, centerValues);
  vec3 right = getPosition(position + tangent.xyz * delta.x, rightValues);
  vec3 top = getPosition(position + biTangent.xyz * delta.y, topValues);

  mat3 m = mat3(1.0);
  displacedPosition = position;
  displacedNormal = normal;

  for(int i = 0; i < MAX_OCTAVES; i ++ ) {
    vec3 c = center;
    c.z = centerValues[i];

    vec3 r = right;
    r.z = rightValues[i];

    vec3 t = top;
    t.z = topValues[i];

    displacedNormal = m * normal;
    displacedPosition += c.z * displacedNormal;

    vec3 newTangent = normalize(r - c);
    vec3 newBiNormal = normalize(t - c);
    vec3 newNormal = cross(newTangent, newBiNormal);
    m = m * mat3(newTangent, newBiNormal, newNormal);
  }

  displacedPosition.z += 0.1 - 0.5 * uAmplitude1;
}