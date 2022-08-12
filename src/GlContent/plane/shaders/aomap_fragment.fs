float ambientOcclusion = vHeightShade;

reflectedLight.indirectDiffuse *= ambientOcclusion;

#if defined( USE_ENVMAP ) && defined( STANDARD )

  float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );

  reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );

#endif