import { Rectangle, Vector } from './../../../dist/black-es6-module'

describe('Rectangle', () => {
  test('Should create new empty instance', () => {
    let rect = new Rectangle();
    expect(rect.x).toBe(0);
    expect(rect.y).toBe(0);
    expect(rect.width).toBe(0);
    expect(rect.height).toBe(0);

    expect(rect.top).toBe(0);
    expect(rect.right).toBe(0);
    expect(rect.bottom).toBe(0);
    expect(rect.left).toBe(0);

    expect(rect.topLeft.x).toBe(0);
    expect(rect.topLeft.y).toBe(0);
    expect(rect.topRight.x).toBe(0);
    expect(rect.topRight.y).toBe(0);
    expect(rect.bottomLeft.x).toBe(0);
    expect(rect.bottomLeft.y).toBe(0);
    expect(rect.bottomRight.x).toBe(0);
    expect(rect.bottomRight.y).toBe(0);
  });

  test('Should create new instance with given values', () => {
    let v = new Rectangle(1, 2, 3, 4);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.width).toBe(3);
    expect(v.height).toBe(4);
  });

  test('Should update existing values', () => {
    let v = new Rectangle();
    v.set(1, 2, 3, 4);

    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.width).toBe(3);
    expect(v.height).toBe(4);
  });

  test('Should copy values from another instance', () => {
    let r1 = new Rectangle(10, 20, 10, 20);
    let r2 = new Rectangle(0, 0, 0, 0);

    r1.copyFrom(r2);

    expect(r1.x).toBe(r2.x);
    expect(r1.y).toBe(r2.y);
    expect(r1.width).toBe(r2.width);
    expect(r1.height).toBe(r2.height);
    expect(r1.equals(r2)).toBe(true);
  });

  test('Should copy current values into destination Rectangle', () => {
    let r1 = new Rectangle(10, 20, 10, 20);
    let r2 = new Rectangle(0, 0, 0, 0);

    r1.copyFrom(r2);

    expect(r1.x).toBe(r2.x);
    expect(r1.y).toBe(r2.y);
    expect(r1.width).toBe(r2.width);
    expect(r1.height).toBe(r2.height);
  });

  test('Should return leftmost point', () => {
    let r = new Rectangle(11, 22, 33, 44);
    expect(r.left).toBe(11);
  });

  test('Should update leftmost point with a new value', () => {
    let r = new Rectangle(11, 22, 33, 44);
    r.left = -100;
    expect(r.left).toBe(-100);
  });

  test('Should return rightmost point', () => {
    let r = new Rectangle(11, 22, 33, 44);
    expect(r.right).toBe(11 + 33);
  });

  test('Should update rightmost point with a new value', () => {
    let r = new Rectangle(11, 22, 33, 44);
    r.right = 100;
    expect(r.right).toBe(100);
  });

  test('Should return topmost point', () => {
    let r = new Rectangle(11, 22, 33, 44);
    expect(r.top).toBe(22);
  });

  test('Should update topmost point with a new value', () => {
    let r = new Rectangle(11, 22, 33, 44);
    r.top = 100;
    expect(r.top).toBe(100);
  });

  test('Should return bottommost point', () => {
    let r = new Rectangle(11, 22, 33, 44);
    expect(r.bottom).toBe(22 + 44);
  });

  test('Should update bottommost point with a new value', () => {
    let r = new Rectangle(11, 22, 33, 44);
    r.bottom = 100;
    expect(r.bottom).toBe(100);
  });

  test('Should return topLeft point', () => {
    let r = new Rectangle(11, 22, 33, 44);
    let p = r.topLeft;
    expect(p.x).toBe(11);
    expect(p.y).toBe(22);
  });

  test('Should update topLeft point', () => {
    let r = new Rectangle(11, 22, 33, 44);
    r.topLeft = new Vector(100, 100);
    let p = r.topLeft;
    expect(p.x).toBe(100);
    expect(p.y).toBe(100);
  });

  test('Should return topRight point', () => {
    let r = new Rectangle(11, 22, 33, 44);
    let p = r.topRight;
    expect(p.x).toBe(11 + 33);
    expect(p.y).toBe(22);
  });

  test('Should update topLeft point', () => {
    let r = new Rectangle(11, 22, 33, 44);
    r.topRight = new Vector(100, 100);
    let p = r.topRight;
    expect(p.x).toBe(100);
    expect(p.y).toBe(100);
  });


  test('Should return bottomLeft point', () => {
    let r = new Rectangle(11, 22, 33, 44);
    let p = r.bottomLeft;
    expect(p.x).toBe(11);
    expect(p.y).toBe(22 + 44);
  });

  test('Should update bottomLeft point', () => {
    let r = new Rectangle(11, 22, 33, 44);
    r.bottomLeft = new Vector(100, 100);
    let p = r.bottomLeft;
    expect(p.x).toBe(100);
    expect(p.y).toBe(100);
  });


  test('Should return bottomRight point', () => {
    let r = new Rectangle(11, 22, 33, 44);
    let p = r.bottomRight;
    expect(p.x).toBe(11 + 33);
    expect(p.y).toBe(22 + 44);
  });

  test('Should update bottomRight point', () => {
    let r = new Rectangle(11, 22, 33, 44);
    r.bottomRight = new Vector(100, 100);
    let p = r.bottomRight;
    expect(p.x).toBe(100);
    expect(p.y).toBe(100);
  });

  test('Should return size', () => {
    let r = new Rectangle(11, 22, 33, 44);
    let size = r.size();

    expect(size.x).toBe(33);
    expect(size.y).toBe(44);
  });

  test('Should return size into passed Vector', () => {
    let size = new Vector();

    let r = new Rectangle(11, 22, 33, 44);
    r.size(size);

    expect(size.x).toBe(33);
    expect(size.y).toBe(44);
  });

  test('Should zero existing values', () => {
    let r = new Rectangle(11, 22, 33, 44);
    let size = r.zero();

    expect(size.x).toBe(0);
    expect(size.y).toBe(0);
  });

  test('Should compare two Rectangle using default Number.EPSILON value', () => {
    let rectA = new Rectangle(11, 22, 33, 44);
    let rectB = new Rectangle(11, 22, 33, 44 + Number.EPSILON);

    expect(rectA.equals(rectB)).toBe(true);
  });

  test('Should compare two Rectangle using custom epsilon', () => {
    let rectA = new Rectangle(11, 22, 33, 44);
    let rectB = new Rectangle(11, 22, 33, 44.1);

    expect(rectA.equals(rectB, 0.10001)).toBe(true);
  });

  test('Should check if point is inside a rectangle', () => {
    let r = new Rectangle(0, 20, 20, 20);

    expect(r.containsXY(0, 20)).toBe(true);
    expect(r.containsXY(0, 40)).toBe(true);
  });

  test('Should check if point is outside of a rectangle', () => {
    let r = new Rectangle(0, 20, 20, 20);

    expect(r.containsXY(0, 19)).not.toBe(true);
    expect(r.containsXY(0, 41)).not.toBe(true);
  });

  test('Should check if point is inside a rectangle', () => {
    let r = new Rectangle(0, 20, 20, 20);
    let r1 = new Rectangle(5, 25, 10, 10);
    expect(r.contains(r1)).toBe(true);
  });

  test('Should check if point is outside of a rectangle', () => {
    let r = new Rectangle(0, 20, 20, 20);
    let r2 = new Rectangle(20, 25, 10, 10);
    expect(r.contains(r2)).not.toBe(true);
  });

  test('Should check if given rectangle intersects this rectangle', () => {
    let r = new Rectangle(0, 20, 20, 20);
    let r1 = new Rectangle(5, 25, 10, 10);

    expect(r.intersects(r1)).toBe(true);
  });

  test('Should check if given rectangle not intersecting current rectangle', () => {
    let r = new Rectangle(0, 20, 20, 20);
    let r2 = new Rectangle(20, 25, 10, 10);
    expect(r.intersects(r2)).not.toBe(true);
  });

  test('Should union two rectangles', () => {
    let r = new Rectangle(20, 20, 20, 20);
    let r1 = new Rectangle(50, 50, 50, 50);

    r.union(r1);

    expect(r.x).toBe(20);
    expect(r.y).toBe(20);
    expect(r.width).toBe(80);
    expect(r.height).toBe(80);
  });

  test('Should return the volume of this rectangle', () => {
    let r = new Rectangle(0, 20, 20, 20);
    expect(r.volume).toBe(400);
    r.width = 0;
    expect(r.volume).toBe(0);
    r.width = 1;
    expect(r.volume).toBe(20);
  });

  test('Should expand this rectangle by given dimmension', () => {
    let r = new Rectangle(20, 20, 20, 20);
    r.expand(10, 10, 10, 10);

    expect(r.x).toBe(10);
    expect(r.y).toBe(10);
    expect(r.width).toBe(30);
    expect(r.height).toBe(30);
  });

  test('Should inflate this rectangle by given size', () => {
    let r = new Rectangle(20, 20, 20, 20);
    r.inflate(10, 10);

    expect(r.x).toBe(10);
    expect(r.y).toBe(10);
    expect(r.width).toBe(40);
    expect(r.height).toBe(40);
  });

  test('Should copy current values into new instance', () => {
    let r1 = new Rectangle(10, 20, 10, 10);
    let r2 = r1.clone();

    expect(r1.x).toBe(r2.x);
    expect(r1.y).toBe(r2.y);
  });

  test('Should return the perimeter this rectangle', () => {
    let r = new Rectangle(10, 10, 10, 10);
    expect(r.perimeter).toBe(40);
  });


  test('Should return the center point this rectangle', () => {
    let r = new Rectangle(10, 10, 10, 10);
    let v = r.center();
    expect(v.x).toBe(15);
    expect(v.y).toBe(15);
  });

  test('Should return the center point this rectangle into given outVector', () => {
    let v = new Vector();
    let r = new Rectangle(10, 10, 10, 10);
    r.center(v);

    expect(v.x).toBe(15);
    expect(v.y).toBe(15);
  });

  test('Should scale this rectangle by given size', () => {
    let r = new Rectangle(11, 12, 13, 14);
    let scaleFactor = 10;

    r.scale(scaleFactor, scaleFactor);

    expect(r.width).toBe(130);
    expect(r.height).toBe(140);
  });

  test('Should return True if all components equals to zero', () => {
    let r1 = new Rectangle(0, 0, 0, 0);
    let r2 = new Rectangle(10, 10, 10, 10);

    expect(r1.isEmpty).toBe(true);
    expect(r2.isEmpty).toBe(false);
  });

  test('Should return a string representation of this rectangle', () => {
    let r = new Rectangle(10, 20);
    expect(r.toString()).toBe('Rectangle { x: 10.00, y: 20.00, width: 0.00, height: 0.00 }');
    expect(r.toString(20)).toBe('Rectangle { x: 10.00000000000000000000, y: 20.00000000000000000000, width: 0.00000000000000000000, height: 0.00000000000000000000 }');
  });
});
