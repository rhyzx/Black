/**
 * A basic utility class for drawing simple shapes.
 *
 * @cat display
 * @extends DisplayObject
 */
/* @echo EXPORT */
class Graphics extends DisplayObject {
  /**
   * Creates new Graphics instance.
   */
  constructor() {
    super();

    /** @private @type {Rectangle} */
    this.mBounds = new Rectangle();

    /** @private @type {Array<GraphicsCommand>} */
    this.mCommandQueue = [];

    /** @private @type {number} */
    this.mPosX = 0;

    /** @private @type {number} */
    this.mPosY = 0;

    /** @private @type {number} */
    this.mPadding = 0;
    //this.lineStyle(1, 0, 1);
  }

  /**
   * @inheritDoc
   */
  getRenderer() {
    return Black.driver.getRenderer('Graphics');
  }

  /**
   * @inheritDoc
   */
  onRender(driver, parentRenderer, isBackBufferActive = false) {
    let renderer = /** @type {GraphicsRenderer} */ (this.mRenderer);

    if (this.mDirty & DirtyFlag.RENDER) {
      renderer.transform = this.worldTransformation;
      renderer.commands = this.mCommandQueue;
      renderer.alpha = this.mAlpha * parentRenderer.alpha;
      renderer.blendMode = this.blendMode === BlendMode.AUTO ? parentRenderer.blendMode : this.blendMode;
      renderer.color = this.mColor === null ? parentRenderer.color : this.mColor;
      renderer.visible = this.mVisible;
      renderer.dirty = this.mDirty;
      renderer.pivotX = this.mPivotX;
      renderer.pivotY = this.mPivotY;
      renderer.clipRect = this.mClipRect;
      renderer.bounds = this.mBounds;
      renderer.snapToPixels = this.mSnapToPixels;

      this.mDirty ^= DirtyFlag.RENDER;
    }

    return driver.registerRenderer(renderer);
  }

  /**
   * @inheritDoc
   */
  onGetLocalBounds(outRect = undefined) {
    outRect = outRect || new Rectangle();

    let bounds = new Rectangle();
    let newPath = () => {
      return {
        bounds       : null,
        points       : [],
        maxLineWidth : 0,
        lastLineWidth: 0,
        lineMult     : 0.5,
      };
    }

    let path = newPath();

    let len = this.mCommandQueue.length;
    for (let i = 0; i < len; i++) {

      let cmd = this.mCommandQueue[i];

      switch (cmd.type) {
        case GraphicsCommandType.BEGIN_PATH: {
          path.bounds && bounds.union(path.bounds);
          path = newPath();
          break;
        }
        case GraphicsCommandType.BOUNDS: {
          for (let k = 0; k < cmd.data.length; k += 2)
            path.points.push(cmd.data[k], cmd.data[k + 1]);
          break;
        }
        case GraphicsCommandType.LINE_STYLE: {
          path.lastLineWidth = cmd.getNumber(0);
          let joints = cmd.getString(4);

          if (joints === JointStyle.MITER)
            path.lineMult = 1;

          break;
        }
        case GraphicsCommandType.FILL: {
          let tmpBounds = Rectangle.fromPointsXY(...path.points);
          path.bounds = path.bounds ? path.bounds.union(tmpBounds) : tmpBounds;

          break;
        }
        case GraphicsCommandType.STROKE: {
          if (path.lastLineWidth > path.maxLineWidth)
            path.maxLineWidth = path.lastLineWidth;

          if (path.maxLineWidth === 0)
            path.maxLineWidth = 1;

          path.maxLineWidth *= path.lineMult;

          let tmpBounds = Rectangle.fromPointsXY(...path.points);
          if (path.points.length > 2)
            tmpBounds.inflate(path.maxLineWidth, path.maxLineWidth);

          path.bounds = path.bounds ? path.bounds.union(tmpBounds) : tmpBounds;

          break;
        }

        default:
          break;
      }
    }

    path.bounds && bounds.union(path.bounds);
    bounds.copyTo(outRect);

    if (this.mClipRect !== null) {
      this.mClipRect.copyTo(outRect);
      outRect.x += this.mPivotX;
      outRect.y += this.mPivotY;
    }

    return outRect;
  }

  /**
   * Sets line style. Zero or less values of `lineWidth` are ignored.
   *
   * @public
   * @param {number} lineWidth Line width.
   * @param {number=} [color=0] Line color.
   * @param {number=} [alpha=1] Line alpha.
   * @param {CapsStyle=} [caps=CapsStyle.ROUND] Line caps style.
   * @param {JointStyle=} [joints=JointStyle.ROUND] Line joints style.
   * @param {number=} [miterLimit=3] Miter limit.
   * @returns {void}
   */
  lineStyle(lineWidth = 0, color = 0, alpha = 1, caps = CapsStyle.ROUND, joints = JointStyle.ROUND, miterLimit = 3) {
    Debug.isNumber(lineWidth, color, alpha, miterLimit);
    if (lineWidth <= 0)
      return;

    this.__pushCommand(GraphicsCommandType.LINE_STYLE, lineWidth, color, alpha, caps, joints, miterLimit);
  }

  /**
   * Sets fill style
   *
   * @public
   * @param {number} [color=0] Fill color.
   * @param {number=} [alpha=1] Fill alpha.
   * @returns {void}
   */
  fillStyle(color = 0, alpha = 1) {
    Debug.isNumber(color, alpha);
    this.__pushCommand(GraphicsCommandType.FILL_STYLE, color, alpha);
  }

  /**
   * Clears the graphics that were drawn and resets fill and line styles.
   *
   * @public
   * @returns {void}
   */
  clear() {
    this.mBounds.zero();
    this.mPosX = 0;
    this.mPosY = 0;

    this.mCommandQueue.splice(0, this.mCommandQueue.length);
    this.beginPath();
    this.setTransformDirty();
  }

  /**
   * Moves the starting point of a path to given x and y coordinates.
   *
   * @public
   * @param {number} x The x-axis of the point.
   * @param {number} y The y-axis of the point.
   * @returns {void}
   */
  moveTo(x, y) {
    this.mPosX = x;
    this.mPosY = y;
    this.__pushCommand(GraphicsCommandType.MOVE_TO, x, y);
  }

  /**
   * Draws a line between last point and given.
   *
   * @public
   * @param {number} x The x-axis of the point.
   * @param {number} y The y-axis of the point.
   * @returns {void}
   */
  lineTo(x, y) {
    this.mPosX = x;
    this.mPosY = y;

    this.__pushCommand(GraphicsCommandType.LINE_TO, x, y);
    this.__pushCommand(GraphicsCommandType.BOUNDS, this.mPosX, this.mPosY, x, y);
  }

  /**
   * Adds an arc to the current path.
   *
   * @public
   * @param {number} x             The x-axis of the arc's center.
   * @param {number} y             The y-axis of the arc's center.
   * @param {number} radius        The radius of the arc.
   * @param {number} startAngle    The starting angle in radians.
   * @param {number} endAngle      The ending angle in radians.
   * @param {boolean=} [anticlockwise=false] If true the arc will be drawn counter-clockwise.
   * @returns {void}
   */
  arc(x, y, radius, startAngle, endAngle, anticlockwise = false) {
    let needsMoveTo = false;
    let moveToX = 0;
    let moveToY = 0;
    let points = [];
    let diff = Math.abs(startAngle - endAngle);

    if (diff >= MathEx.PI2) {
      points.push(x - radius, y - radius, x + radius, y + radius);

      let end = Circle.getCircumferencePoint(x, y, radius, endAngle + Math.PI * 0.5);

      needsMoveTo = true;
      endAngle = startAngle + MathEx.PI2;
      moveToX = end.x;
      moveToY = end.y;
    } else {
      let start = startAngle;
      let end = endAngle;

      if (anticlockwise) {
        start = endAngle;
        end = startAngle;
      }

      let minX = Number.MAX_VALUE;
      let minY = Number.MAX_VALUE;
      let maxX = -Number.MAX_VALUE;
      let maxY = -Number.MAX_VALUE;

      const quart = Math.PI * 0.5;
      let angle = start + quart - (start % quart);

      const angles = [start, end];

      while (angle < end) {
        angles.push(angle);
        angle += quart;
      }

      for (let i = 0, l = angles.length; i < l; i++) {
        const xp = Math.cos(angles[i]) * radius;
        const yp = Math.sin(angles[i]) * radius;

        minX = Math.min(minX, xp);
        minY = Math.min(minY, yp);
        maxX = Math.max(maxX, xp);
        maxY = Math.max(maxY, yp);
      }


      points.push(minX, minY, maxX, maxY);
    }

    this.__pushCommand(GraphicsCommandType.ARC, x, y, radius, startAngle, endAngle, anticlockwise);
    this.__pushCommand(GraphicsCommandType.BOUNDS, ...points);

    if (needsMoveTo === true)
      this.__pushCommand(GraphicsCommandType.MOVE_TO, moveToX, moveToY);
  }

  /**
   * Adds circle to current path.
   *
   * @public
   * @param {number} x      The x-axis of the circles's center.
   * @param {number} y      The y-axis of the circles's center.
   * @param {number} radius The radius of the circle.
   * @returns {void}
   */
  circle(x, y, radius) {
    this.__pushCommand(GraphicsCommandType.ARC, x, y, radius, 0, MathEx.PI2);
    this.__pushCommand(GraphicsCommandType.BOUNDS, x - radius, y - radius, x + radius, y + radius);
  }

  /**
   * Creates closed rectangle like path.
   *
   * @public
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   *
   * @returns {void}
   */
  rect(x, y, width, height) {
    Debug.isNumber(x, y, width, height);

    this.__pushCommand(GraphicsCommandType.RECT, x, y, width, height);
    this.__pushCommand(GraphicsCommandType.BOUNDS, x, y, x + width, y + height);
  }

  // /**
  //  * @public
  //  * @param {number} cp1x 
  //  * @param {number} cp1y 
  //  * @param {number} cp2x 
  //  * @param {number} cp2y 
  //  * @param {number} x 
  //  * @param {number} y 
  //  */
  // bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
  //   this.__pushCommand(GraphicsCommandType.BEZIER_CURVE_TO, cp1x, cp1y, cp2x, cp2y, x, y);
  // }

  /**
   * Starts new path.
   *
   * @public
   * @returns {void}
   */
  beginPath() {
    this.__pushCommand(GraphicsCommandType.BEGIN_PATH);
  }

  /**
   * Closes current path.
   *
   * @public
   * @returns {void}
   */
  closePath() {
    this.__pushCommand(GraphicsCommandType.CLOSE_PATH);
  }

  /**
   * Strokes current path with the current line style..
   *
   * @public
   * @returns {void}
   */
  stroke() {
    this.__pushCommand(GraphicsCommandType.STROKE);
  }

  /**
   * Fills current path with the current fill style.
   *
   * @public
   * @returns {void}
   */
  fill() {
    this.__pushCommand(GraphicsCommandType.FILL);
  }

  /**
   * @private
   * @ignore
   * @param {GraphicsCommandType} type
   * @param {...*} data
   */
  __pushCommand(type, ...data) {
    let cmd = new GraphicsCommand(type, data);
    this.mCommandQueue.push(cmd);
  }
}