vec3 displacedPosition = vec3(0.0);
vec3 displacedNormal = vec3(0.0);
displace(displacedPosition, displacedNormal);

vHeightShade = clamp(smoothstep(
  uHeightShadeStart, uHeightShadeStart + uHeightShadeLength,
  displacedPosition.z
), 0.05, 1.0);

#include <uv_vertex>