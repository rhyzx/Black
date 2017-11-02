/**
 * An video driver that draw everything into DOM elements itself.
 *
 * @cat drivers
 * @extends VideoNullDriver
 */
/* @echo EXPORT */
class DOMDriver extends VideoNullDriver {
  /**
   * @param  {HTMLElement} containerElement The DOM element to draw into.
   * @param  {number} width                 The width of the viewport.
   * @param  {number} height                The height of the viewport.
   */
  constructor(containerElement, width, height) {
    super(containerElement, width, height);

    /** @type {Array<Element>} */
    this.mCache = [];

    /** @type {number} */
    this.mCounter = 0;

    /** @type {boolean} */
    this.mPixelated = true;

    this.__initCSS();

    this.mRendererMap = {
      DisplayObject: DisplayObjectRendererDOM,
      Sprite: SpriteRendererDOM,
      Emitter: EmitterRendererDOM,
      Text: TextRendererDOM
    };
  }

  /**
   * @private
   *
   * @return {void}  description
   */
  __initCSS() {
    let imgRendering = 'image-rendering:optimizeSpeed; image-rendering:optimize-contrast; image-rendering:crisp-edges; image-rendering:pixelated';

    let sSprite = document.createElement('style');
    sSprite.type = 'text/css';
    sSprite.innerHTML = '.sprite { position: absolute; background-repeat: no-repeat; cursor: default !important; -webkit-transform-origin: 0px 0px;}';
    document.getElementsByTagName('head')[0].appendChild(sSprite);

    let sSpritePixelated = document.createElement('style');
    sSpritePixelated.type = 'text/css';
    sSpritePixelated.innerHTML = '.sprite-p { position: absolute; background-repeat: no-repeat; cursor: default !important; -webkit-transform-origin: 0px 0px; ' + imgRendering + '}';
    document.getElementsByTagName('head')[0].appendChild(sSpritePixelated);

    let sText = document.createElement('style');
    sText.type = 'text/css';
    sText.innerHTML = '.text { position: absolute; white-space: pre; overflow: hidden; cursor: default !important; -webkit-transform-origin: 0px 0px;}';
    document.getElementsByTagName('head')[0].appendChild(sText);

    let sViewport = document.createElement('style');
    sViewport.type = 'text/css';
    sViewport.innerHTML = '.viewport { width: 100%; height: 100%; position: relative; overflow: hidden; cursor: default; }';
    document.getElementsByTagName('head')[0].appendChild(sViewport);

    this.mContainerElement.className = 'viewport';
  }

  /**
   * @ignore
   * @param {HTMLElement} canvas
   *
   * @return {Texture|null}
   */
  getTextureFromCanvas(canvas) {
    return Texture.fromCanvasAsImage(canvas);
  }

  /**
   * @override
   * @inheritDoc
   *
   * @param  {Sprite|Particle} object
   * @param  {Texture} texture
   *
   * @return {void}
   */
  drawImage(object, texture) {
    /** @type {Matrix|null} */
    let oldTransform = this.mTransform.clone();
    let uw = texture.untrimmedRect.x;
    let uh = texture.untrimmedRect.y;

    //this.mTransform.translate(px, py);

    if (texture.untrimmedRect.x !== 0 || texture.untrimmedRect.y !== 0) {
      Matrix.__cache.set(1, 0, 0, 1, texture.untrimmedRect.x, texture.untrimmedRect.y);
      this.mTransform = this.mTransform.clone().append(Matrix.__cache);
      //this.mTransform = this.mTransform.clone().translate(texture.untrimmedRect.x, texture.untrimmedRect.y);
    }

    let el = this.__popElement(this.mPixelated ? 'sprite-p' : 'sprite');
    this.__updateElementCommon(el);
    this.__updateImageElement(el, texture);

    this.mTransform = oldTransform.clone();
  }

  /**
   * @private
   * @param {string} className
   *
   * @return {Element}
   */
  __popElement(className) {
    this.mCounter++;

    if (this.mCounter <= this.mCache.length)
      return this.mCache[this.mCounter - 1];

    let el = document.createElement('div');
    el.className = className;
    this.mContainerElement.appendChild(el);

    this.mCache.push(el);
    return (el);
  }

  /**
   * @private
   * @param {Element} el
   *
   * @return {void}
   */
  __updateElementCommon(el) {
    let v = this.mTransform.value;

    // TODO: slow, rework
    // NOTE: toFixed(0) is faster then toFixed(6)
    let transform = `matrix(${v[0].toFixed(6)}, ${v[1].toFixed(6)}, ${v[2].toFixed(6)}, ${v[3].toFixed(6)}, ${v[4].toFixed(6)}, ${v[5].toFixed(6)})`;
    //let transform = `matrix(${v[0]}, ${v[1]}, ${v[2]}, ${v[3]}, ${v[4]}, ${v[5]})`;

    //console.log(el.style.transform, transform);
    if (el.style.webkitTransform !== transform)
      el.style.webkitTransform = transform;

    //el.style.transform = transform;

    //if (el.style.opacity != this.mGlobalAlpha)
    el.style.opacity = this.mGlobalAlpha; // would be faster to not compare string and int

    //if (el.style.backgroundImage !== '') {
    //el.style.backgroundImage = '';
    //console.log('reset img');
    //}

    // if (el.style.width !== null)
    //   el.style.width = null;
    //
    // if (el.style.height !== null)
    //   el.style.height = null;

    // if (el.style.display === 'none')
    //   el.style.display = 'block';
  }

  /**
   * @private
   * @param  {Element} el      description
   * @param  {Texture} texture description
   * @return {void}         description
   */
  __updateImageElement(el, texture) {
    if (texture) {
      let url = 'url(' + texture.native.src + ')';

      if (el.style.backgroundImage !== url)
        el.style.backgroundImage = url;

      if (texture.isSubTexture) {
        let vBackgroundPosition = `${-texture.region.x}px ${-texture.region.y}px`;

        if (el.style.backgroundPosition !== vBackgroundPosition)
          el.style.backgroundPosition = vBackgroundPosition;
      }
    } else {
      el.style.backgroundImage = 'none';
    }

    if (el.style.width != texture.width + 'px')
      el.style.width = texture.width + 'px';

    if (el.style.height != texture.height + 'px')
      el.style.height = texture.height + 'px';

    if (el.innerHTML !== '')
      el.innerHTML = '';
  }

  /**
   * @private
   * @param {HTMLElement} el
   * @param {TextField} textField
   * @param {TextInfo} style
   * @param {Rectangle} bounds
   *
   * @return {void}
   */
  __updateTextElement(el, textField, style, bounds) {
    let width = textField.lineWidths[0];
    let text = textField.lines;
    let align = style.align;
    let x = 0;

    if (align === `center`) {
      x -= bounds.width / 2 - width / 2;
    } else if (align === `right`) {
      x -= bounds.width - width;
    }

    let v = this.mTransform.value;
    el.style.webkitTransform = `matrix(${v[0]}, ${v[1]}, ${v[2]}, ${v[3]}, ${v[4] - x}, ${v[5]})`;
    el.style.opacity = this.mGlobalAlpha;

    if (!textField.autoSize) {
      // top right bottom left. There is no width and height
      el.style.clip = `rect(0px ${bounds.width + x}px ${bounds.height}px ${x}px)`;
    }

    el.style.lineHeight = `${textField.lineHeight}`;
    el.style.fontSize = style.size + 'px';
    el.style.letterSpacing = `${textField.letterSpacing}px`;
    el.innerHTML = text;

    if (el.style.width !== bounds.width + x + 'px') {
      el.style.width = bounds.width + x + 'px';
    }

    if (el.style.height !== bounds.height + 'px') {
      el.style.height = bounds.height + 'px';
    }

    if (el.style.fontFamily !== style.name) {
      el.style.fontFamily = style.name;
    }

    let color = this.hexColorToString(style.color);

    if (el.style.color != color) {
      el.style.color = color;
    }

    if (el.style.fontStyle !== style.style)
      el.style.fontStyle = style.style;

    if (el.style.fontWeight != style.weight) {
      el.style.fontWeight = style.weight;
    }

    if (el.style.textAlign !== style.align) {
      el.style.textAlign = style.align;
    }

    if (el.style.backgroundImage !== 'none') {
      el.style.backgroundImage = 'none';
    }

    if (style.strokeThickness > 0) {
      let strokeColor = this.hexColorToString(style.strokeColor);

      if (el.style.webkitTextStrokeColor != strokeColor) {
        el.style.webkitTextStrokeColor = strokeColor;
      }

      if (el.style.webkitTextStrokeWidth != style.strokeThickness + 'px') {
        el.style.webkitTextStrokeWidth = style.strokeThickness + 'px';
      }
    }
  }
}
