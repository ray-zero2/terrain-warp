export default class ImageLoader {
  /**
   *
   * @param {string[]} srcArray 画像ソースパスの配列
   */
  load(srcArray) {
    return Promise.all(srcArray.map(src => this.loadImage(src)));
  }

  /**
   * @private
   * @param {string} src
   * @returns {Promise<HTMLImageElement>}
   */
  loadImage(src) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve();
      image.src = src;
    });
  }
}
