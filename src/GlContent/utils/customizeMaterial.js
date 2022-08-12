export const customizeMaterial = ( material, uniforms, callback ) => {
  material.onBeforeCompile = (shader, renderer) => {
    shader.uniforms = {
      ...shader.uniforms,
      ...uniforms
    }
    callback(shader, renderer);
  }
  return {
    material,
    uniforms,
  }
}