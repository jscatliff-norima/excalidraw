import {
  SVG_NS,
  getFontString,
  getGlobalCSSVariable,
  SVG_DOCUMENT_PREAMBLE,
} from "@excalidraw/common";
import {
  getBoundTextElement,
  getContainerElement,
} from "@excalidraw/element/textElement";
import {
  isArrowElement,
  isIframeLikeElement,
  isImageElement,
  isTextElement,
} from "@excalidraw/element/typeChecks";
import { getContainingFrame } from "@excalidraw/frame";
import { getCornerRadius, getElementAbsoluteCoords } from "@excalidraw/element";
import { getLineDash, getLineDashArray } from "@excalidraw/element/bounds";
import {
  getArrowheadPathForType,
  getArrowheadPoints,
  getBoundTextElementPosition,
} from "@excalidraw/element/binding";
import { getCenter, getElementPointsCoords } from "@excalidraw/element/bounds";
import { getPathForArrow, getLinearElementPoints } from "@excalidraw/element";

import type { ExcalidrawTextElement } from "@excalidraw/element/types";
import type {
  ExcalidrawElement,
  ElementsMap,
  NonDeleted,
} from "@excalidraw/element/types";
import type {
  ExcalidrawDiamondElement,
  ExcalidrawEllipseElement,
  ExcalidrawRectangleElement,
  ExcalidrawTextElementWithContainer,
  ExcalidrawHexagonElement,
} from "@excalidraw/element/types";
import { getElementLineHeight } from "@excalidraw/element/textElement";
import type { StaticCanvasRenderConfig } from "../../../scene/types";
import { getElementPoints, getHexagonPoints } from "@excalidraw/element";

type RectanguloidElement =
  | NonDeleted<ExcalidrawRectangleElement>
  | NonDeleted<ExcalidrawEllipseElement>
  | NonDeleted<ExcalidrawDiamondElement>
  | NonDeleted<ExcalidrawHexagonElement>;

/**
 * Manages rendering of elements into SVG.
 *
 * This is a stateful class. It caches the SVGElements for each
 * excalidraw element.
 *
 * It acts as a bridge between Excalidraw and SVG world, and does not depend
 * on any particular framework.
 */
export class SvgSceneManager {
  /**
   * parent SVG element
   */
  public readonly svg: SVGElement;
  /**
   * The cache of SVGElements that have been created for each excalidraw
   * element. The key is the excalidraw element's id.
   *
   * This is a weak map, so if the excalidraw element is garbage collected,
   * the corresponding SVGElement will also be garbage collected.
   */
  private readonly svgCache = new WeakMap<
    ExcalidrawElement,
    {
      outer: SVGElement;
      inner: SVGElement;
    }
  >();

  /**
   * The cache for frame names.
   */
  private readonly frameNameCache = new WeakMap<
    ExcalidrawElement,
    {
      text: string;
      svg: SVGTextElement;
    }
  >();

  private readonly document: Document;

  private readonly clipPathId: string;

  constructor(opts: { svg: SVGElement; document?: Document }) {
    this.svg = opts.svg;
    this.document = opts?.document || window.document;
    this.clipPathId = `clipPath-${Math.round(Math.random() * 1_000_000_000)}`;
  }

  public renderSvgElement(
    element: NonDeleted<ExcalidrawElement>,
    renderConfig: StaticCanvasRenderConfig,
    elementsMap: ElementsMap,
  ): SVGElement {
    const { outer } = this.getOrCreateSVGElement(element, elementsMap);
    this._renderSvgElement(element, outer, renderConfig, elementsMap);
    return outer;
  }

  public getRoot(): SVGElement {
    return this.svg;
  }

  public destroy() {
    this.frameNameCache.clear?.();
    this.svgCache.clear?.();
  }

  private _renderSvgElement(
    element: NonDeleted<ExcalidrawElement>,
    svgNode: SVGElement,
    renderConfig: StaticCanvasRenderConfig,
    elementsMap: ElementsMap,
  ): void {
    const [x1, y1] = getElementAbsoluteCoords(element, elementsMap);

    svgNode.setAttribute("transform", `translate(${x1} ${y1})`);
  }

  /**
   * @returns an wrapper SVGElement, and an inner SVGElement to which attributes should be applied
   */
  private getOrCreateSVGElement(
    element: ExcalidrawElement,
    elementsMap: ElementsMap,
  ): {
    outer: SVGElement;
    inner: SVGElement;
  } {
    if (this.svgCache.has(element)) {
      return this.svgCache.get(element)!;
    }

    const { outer, inner } = this._createSVGElement(element, elementsMap);
    this.svgCache.set(element, { outer, inner });
    return { outer, inner };
  }

  private _createSVGElement(
    element: ExcalidrawElement,
    elementsMap: ElementsMap,
  ): {
    outer: SVGElement;
    inner: SVGElement;
  } {
    const outer = this.document.createElementNS(SVG_NS, "g");
    let inner: SVGElement;
    switch (element.type) {
      case "rectangle":
      case "diamond":
      case "ellipse":
      case "hexagon":
      case "iframe":
      case "embeddable":
        inner = this.document.createElementNS(SVG_NS, "path");
        outer.appendChild(inner);
        break;
      case "image": {
        const g = this.document.createElementNS(SVG_NS, "g");
        const image = this.document.createElementNS(SVG_NS, "image");
        g.appendChild(image);
        inner = image;
        outer.appendChild(g);
        break;
      }
      case "text":
        inner = this.document.createElementNS(SVG_NS, "text");
        outer.appendChild(inner);
        break;
      case "arrow":
      case "line":
        inner = this.document.createElementNS(SVG_NS, "g");
        if (isArrowElement(element)) {
          const path = this.document.createElementNS(SVG_NS, "path");
          path.setAttribute("class", "arrow-body");
          const headPath = this.document.createElementNS(SVG_NS, "path");
          headPath.setAttribute("class", "arrow-head");
          inner.append(path, headPath);
        } else {
          inner.append(this.document.createElementNS(SVG_NS, "path"));
        }
        outer.appendChild(inner);
        break;
      case "freedraw":
        inner = this.document.createElementNS(SVG_NS, "path");
        outer.appendChild(inner);
        break;
      case "frame":
      case "magicframe": {
        const g = this.document.createElementNS(SVG_NS, "g");
        g.style.pointerEvents = "none";
        // frame rect
        const rect = this.document.createElementNS(SVG_NS, "rect");
        rect.setAttribute("class", "frame-rect");
        g.appendChild(rect);

        // clip path
        const clipPath = this.document.createElementNS(SVG_NS, "clipPath");
        clipPath.id = this.clipPathId;
        const clipRect = this.document.createElementNS(SVG_NS, "rect");
        clipPath.appendChild(clipRect);
        g.appendChild(clipPath);

        // frame name
        const text = this.document.createElementNS(SVG_NS, "text");
        text.setAttribute("class", "frame-name");
        g.appendChild(text);

        inner = g;
        outer.appendChild(inner);

        this.frameNameCache.set(element, { text: "", svg: text });

        break;
      }
      default:
        throw new Error(`not implemented for type ${element.type}`);
    }

    inner.setAttribute("class", `excalidraw-svg-element ${element.id}`);

    return { outer, inner };
  }
}
