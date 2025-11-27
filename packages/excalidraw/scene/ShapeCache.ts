import { isImageElement } from "@excalidraw/element";
import type { ExcalidrawElement } from "@excalidraw/element/types";
import type { Point } from "../types";

export type ShapeCacheKey = string & {
  __brand: "shapeCacheKey";
};

/**
 * The cache of paths that have been created for each excalidraw element.
 *
 * The cache is stored in a WeakMap, where the key is the excalidraw element,
 * and the value is a Map of shape property values to the generated path.
 *
 * The shape property values are a concatenated string of all the properties
 * that can affect the shape of an element. The properties are sorted
 * alphabetically to ensure that the same shape is generated for the same
 * properties, regardless of the order in which they are specified.
 *
 * E.g. for a rectangle, the shape properties are:
 * `element.width|element.height|element.roughness|element.strokeWidth|...`
 *
 * The generated path is a Path2D object that can be used to render the
 */
export class ShapeCache {
  private static P2D_cache = new WeakMap<
    ExcalidrawElement,
    Map<ShapeCacheKey, Path2D>
  >();

  private static getShapeCache(
    element: ExcalidrawElement,
  ): Map<ShapeCacheKey, Path2D> | undefined {
    return ShapeCache.P2D_cache.get(element);
  }

  private static setShapeCache(
    element: ExcalidrawElement,
    shapeCache: Map<ShapeCacheKey, Path2D>,
  ) {
    ShapeCache.P2D_cache.set(element, shapeCache);
  }

  public static get = (
    element: ExcalidrawElement,
  ): Path2D | undefined | null => {
    const shapeCache = ShapeCache.getShapeCache(element);
    if (!shapeCache) {
      return undefined;
    }
    return shapeCache.get(ShapeCache.getCacheKey(element));
  };

  public static set = (element: ExcalidrawElement, P2D: Path2D | null) => {
    let shapeCache = ShapeCache.getShapeCache(element);
    if (!shapeCache) {
      shapeCache = new Map<ShapeCacheKey, Path2D>();
      ShapeCache.setShapeCache(element, shapeCache);
    }
    const key = ShapeCache.getCacheKey(element);
    if (P2D) {
      shapeCache.set(key, P2D);
    } else {
      shapeCache.delete(key);
    }
  };

  /**
   * Returns a cache key for the given element.
   *
   * The cache key is a concatenated string of all the properties that can
   * affect the shape of an element.
   */
  public static getCacheKey = (element: ExcalidrawElement): ShapeCacheKey => {
    const getPointsString = (points: Point[] | number[][]) =>
      points.map((p) => `${p[0]},${p[1]}`).join("|");

    let key: (string | number | null | undefined)[] = [
      element.width,
      element.height,
      element.angle,
      element.fillStyle,
      element.strokeWidth,
      element.strokeStyle,
      element.roughness,
      element.strokeColor,
      element.backgroundColor,
      element.roundness?.type,
      element.roundness?.value,
      element.points ? getPointsString(element.points) : "",
      element.simulatePressure,
      isImageElement(element) ? element.fileId : "",
    ];
    if (element.type === "freedraw") {
      key.push(element.lastCommittedPoint ? "1" : "0");
    }
    switch (element.type) {
      case "rectangle":
      case "ellipse":
      case "diamond":
      case "hexagon":
        break;
      case "arrow":
      case "line":
        key.push(
          element.startArrowhead || "",
          element.endArrowhead || "",
          getPointsString(element.points),
        );
        break;
      case "freedraw":
        key.push(getPointsString(element.points), element.simulatePressure);
        break;
      case "text":
        key.push(
          element.text,
          element.fontFamily,
          element.fontSize,
          element.textAlign,
          element.verticalAlign,
          element.lineHeight,
        );
        break;
      case "image":
        key.push(element.roundness);
        break;
      case "iframe":
      case "embeddable":
        break;
      case "frame":
      case "magicframe":
        break;
      case "selection":
        // we don't cache selection element, it's not rendered anyway
        break;
      default: {
        // @ts-ignore
        throw new Error(`Unimplemented type ${element.type}`);
      }
    }
    return key.join("|") as ShapeCacheKey;
  };

  public static destroy = () => {
    ShapeCache.P2D_cache = new WeakMap();
  };
}
