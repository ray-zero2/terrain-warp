
#include <normal_fragment_begin>

vec4 worldNormal = vec4(normal, 0.0) * viewMatrix;
diffuseColor.rgb *= 0.5 * worldNormal.xyz + 0.5;