import {
  base64mineTypes,
  distance,
  getFontString,
  isTestEnv,
  getGlobalCSSVariable,
} from "@excalidraw/common";

import {
  getCornerRadius,
  getDiamondPoints,
  getEllipsePoints,
  getLineDash,
  getLineDashArray,
  getRectanguloidLineDash,
  getRectanguloidLineDashArray,
  getStarPoints,
  roundRect,
  getPolygonPoints,
  getHexagonPoints,
} from "@excalidraw/element";

import {
  getArrowheadPathForType,
  getArrowheadPoints,
  getBoundTextElementPosition,
} from "@excalidraw/element/binding";
import {
  getCenter,
  getElementPointsCoords,
  isElementDraggableFromInside,
} from "@excalidraw/element/bounds";
import type { ElementPoint } from "@excalidraw/element/bounds";
import {
  getPathForArrow,
  getLinearElementPoints,
} from "@excalidraw/element/path";
import { getBoundTextElement, getContainerElement } from "@excalidraw/element";
import { getLineHeightInPx, getVerticalOffset } from "@excalidraw/element";

import type {
  ExcalidrawArrowElement,
  ExcalidrawDiamondElement,
  ExcalidrawElement,
  ExcalidrawEllipseElement,
  ExcalidrawFreeDrawElement,
  ExcalidrawGenericElement,
  ExcalidrawImageElement,
  ExcalidrawLinearElement,
  ExcalidrawRectangleElement,
  ExcalidrawTextElement,
  ExcalidrawTextElementWithContainer,
  NonDeleted,
  ExcalidrawHexagonElement,
} from "@excalidraw/element/types";
import {
  isArrowElement,
  isBoundToContainer,
  isImageElement,
  isTextElement,
  isLinearElement,
  isFreeDrawElement,
  isInitializedImageElement,
  isTextBindableContainer,
  hasBoundTextElement,
} from "@excalidraw/element/typeChecks";

import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Drawable } from "roughjs/bin/core";
import type { RenderConfig, Point } from "../scene/types";
import { sceneCoordsToViewportCoords, viewportCoordsToSceneCoords } from ".";
import { Fonts } from "../fonts";
import { generateElementShape } from "../element/newElement";

const FullscreenIcon = (
  x: number,
  y: number,
  size: number,
  strokeWidth: number = 2,
) => {
  const lineGap = 4;
  const lineLength = size / 2;

  const getPath = (
    start: [number, number],
    end: [number, number],
    length: number,
  ) => {
    return `
      M ${start[0]} ${start[1]}
      L ${end[0]} ${end[1] - length}
      M ${end[0]} ${end[1]}
      L ${end[0] - length} ${end[1]}
    `;
  };

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${x} ${y})`);
  g.setAttribute("stroke-linecap", "round");
  g.setAttribute("stroke-width", `${strokeWidth}`);

  let path = getPath(
    [lineGap, lineGap],
    [lineGap + lineLength, lineGap + lineLength],
    lineLength,
  );
  path += getPath(
    [size - lineGap, size - lineGap],
    [size - lineGap - lineLength, size - lineGap - lineLength],
    -lineLength,
  );

  const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path1.setAttribute("d", path);

  g.appendChild(path1);
  return g;
};

/**
 * Clips the element to the frame in case the frame is not selected,
 * and the element is outside the frame.
 *
 * This is a dev-only assertion, we should not need this in production.
 */
const assertBoundToFrame = (
  context: CanvasRenderingContext2D,
  element: ExcalidrawElement,
  renderConfig: RenderConfig,
) => {
  if (
    !renderConfig.frameRendering.enabled ||
    renderConfig.frameRendering.unclip
  ) {
    return;
  }
  const { elementsMap, selection } = renderConfig;
  const frame = element.frameId
    ? elementsMap.get(element.frameId)
    : undefined;

  if (
    frame &&
    !selection.has(frame.id) &&
    !selection.has(element.id) &&
    isElementDraggableFromInside(element)
  ) {
    const [x1, y1, x2, y2] = getElementAbsoluteCoords(element, elementsMap);
    const [fx1, fy1, fx2, fy2] = getElementAbsoluteCoords(frame, elementsMap);

    if (
      x1 > fx2 ||
      x2 < fx1 ||
      y1 > fy2 ||
      y2 < fy1
      // we could be more precise and check against the frame clip path
      // (which is not just a rectangle) but that's likely not worth it
    ) {
      console.warn("element not bound to frame", element);
    }
  }
};

const drawElementFromCanvas = (
  context: CanvasRenderingContext2D,
  element: ExcalidrawElement,
  renderConfig: RenderConfig,
) => {
  if (import.meta.env.DEV) {
    assertBoundToFrame(context, element, renderConfig);
  }

  // use a scratch canvas for shadows to prevent it from affecting other
  // elements (#2389)
  if (renderConfig.shadow) {
    const shadowContext = document.createElement("canvas").getContext("2d")!;
    shadowContext.canvas.width = context.canvas.width;
    shadowContext.canvas.height = context.canvas.height;
    drawElementFromCanvas(shadowContext, element, {
      ...renderConfig,
      shadow: false,
    });
    context.save();
    context.shadowColor = renderConfig.shadow.color;
    context.shadowBlur = renderConfig.shadow.blur;
    context.shadowOffsetX = renderConfig.shadow.offsetX;
    context.shadowOffsetY = renderConfig.shadow.offsetY;
    context.drawImage(shadowContext.canvas, 0, 0);
    context.restore();
  } else {
    context.globalAlpha = element.opacity / 100;
    switch (element.type) {
      case "rectangle":
      case "diamond":
      case "ellipse":
      case "hexagon":
      case "iframe":
      case "embeddable": {
        context.save();
        if (element.fillStyle === "solid") {
          context.fillStyle = element.backgroundColor;
        } else {
          context.fillStyle = "transparent";
        }
        const [x, y, width, height] = getElementAbsoluteCoords(
          element,
          renderConfig.elementsMap,
        );
        const cx = x + width / 2;
        const cy = y + height / 2;
        context.translate(cx, cy);
        context.rotate(element.angle);
        context.beginPath();

        if (element.type === "ellipse") {
          context.ellipse(0, 0, width / 2, height / 2, 0, 0, 2 * Math.PI);
        } else if (element.type === "rectangle") {
          const radius = getCornerRadius(Math.min(width, height), element);
          if (radius > 0) {
            context.roundRect(-width / 2, -height / 2, width, height, radius);
          } else {
            context.rect(-width / 2, -height / 2, width, height);
          }
        } else if (element.type === "diamond") {
          const points = getDiamondPoints(element);
          context.moveTo(points[0][0] - cx, points[0][1] - cy);
          for (let i = 1; i < points.length; i++) {
            context.lineTo(points[i][0] - cx, points[i][1] - cy);
          }
        } else if (element.type === "hexagon") {
          const points = getHexagonPoints(element as ExcalidrawHexagonElement);
          context.moveTo(points[0][0] - cx, points[0][1] - cy);
          for (let i = 1; i < points.length; i++) {
            context.lineTo(points[i][0] - cx, points[i][1] - cy);
          }
        }

        context.closePath();

        if (element.fillStyle === "solid") {
          context.fill();
        }
        context.restore();
        break;
      }
      case "text": {
        context.save();

        context.fillStyle = element.strokeColor;
        context.font = getFontString(element);
        const [x, y] = getElementAbsoluteCoords(
          element,
          renderConfig.elementsMap,
        );
        const cx = x + element.width / 2;
        const cy = y + element.height / 2;

        context.translate(cx, cy);
        context.rotate(element.angle);

        // using a more lightweight solution that doesn't require canvas2D
        const lines = element.text.replace(/\r\n/g, "\n").split("\n");
        const lineHeight = getLineHeightInPx(element);
        const verticalOffset = getVerticalOffset(
          element.fontFamily,
          element.fontSize,
          lineHeight,
        );
        const horizontalOffset =
          element.textAlign === "center"
            ? element.width / 2
            : element.textAlign === "right"
            ? element.width
            : 0;
        for (let i = 0; i < lines.length; i++) {
          context.fillText(
            lines[i],
            -element.width / 2 + horizontalOffset,
            -element.height / 2 + verticalOffset + i * lineHeight,
          );
        }
        context.restore();
        break;
      }
      default:
    }
    context.globalAlpha = 1;
  }
};
const _renderElement = (
  element: NonDeleted<ExcalidrawElement>,
  rc: RoughCanvas,
  context: CanvasRenderingContext2D,
  renderConfig: RenderConfig,
  fonts: Fonts,
) => {
  const generator = generateElementShape(element, renderConfig);

  context.save();
  context.globalAlpha = element.opacity / 100;

  if (element.type !== "selection" && !isVirtualElement(element)) {
    const [x1, y1, x2, y2] = getElementAbsoluteCoords(
      element,
      renderConfig.elementsMap,
    );
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;

    const shiftX = (x2 - x1) / 2 - (element.x - x1);
    const shiftY = (y2 - y1) / 2 - (element.y - y1);
    context.translate(cx - shiftX, cy - shiftY);
    context.rotate(element.angle);

    if (element.type === "arrow") {
      const isResizeColinear =
        renderConfig.activeEmbeddable &&
        renderConfig.activeEmbeddable.state === "resizing" &&
        isLinearElement(renderConfig.activeEmbeddable.element) &&
        renderConfig.activeEmbeddable.resizingHandle === null &&
        element.id === renderConfig.activeEmbeddable.element.id;
      if (!isResizeColinear) {
        rc.draw(generator);
      }
    } else {
      rc.draw(generator);
    }
  }

  context.restore();

  if (
    isTextElement(element) &&
    !isBoundToContainer(element) &&
    !element.text.trim()
  ) {
    return;
  }

  if (
    isTextBindableContainer(element) &&
    hasBoundTextElement(element) &&
    !renderConfig.selectedElements?.has(element.id)
  ) {
    const textElement = getBoundTextElement(element, renderConfig.elementsMap);
    if (textElement) {
      _renderElement(textElement, rc, context, renderConfig, fonts);
    }
  }
};

export const renderElement = (
  element: NonDeleted<ExcalidrawElement>,
  rc: RoughCanvas,
  context: CanvasRenderingContext2D,
  renderConfig: RenderConfig,
  fonts: Fonts,
) => {
  if (renderConfig.isExporting) {
    drawElementFromCanvas(context, element, renderConfig);
  } else {
    _renderElement(element, rc, context, renderConfig, fonts);
  }
};
