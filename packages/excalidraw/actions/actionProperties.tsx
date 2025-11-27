import {
  actionClearCanvas,
  actionCloseMenu,
  actionCopyAsPng,
  actionCopyAsSvg,
  actionCopyStyles,
  actionDeleteSelected,
  actionDuplicateSelection,
  actionFinalize,
  actionFlipHorizontal,
  actionFlipVertical,
  actionGroup,
  actionPasteStyles,
  actionSelectAll,
  actionSendBackward,
  actionBringForward,
  actionSendToBack,
  actionBringToFront,
  actionToggleStats,
  actionUngroup,
  actionLink,
  actionToggleZenMode,
  actionToggleGridMode,
  actionToggleFullScreen,
  actionCopy,
  actionCut,
  actionPaste,
  actionRedo,
  actionUndo,
  actionToggleElementLock,
  actionDuplicateAsImage,
  actionExportWithDarkMode,
  actionSetFrameAsActiveTool,
  actionSetEmbeddableAsActiveTool,
  actionSetEraserTool,
  actionSetHandTool,
  actionSetLaserTool,
  actionSetTextAsActiveTool,
  actionSetSelectionTool,
  actionToggleObjectsSnapMode,
  actionToggleGridSnapMode,
  actionToggleAutomate,
} from "./actionCore";
import {
  alignBottom,
  alignCenter,
  alignLeft,
  alignMiddle,
  alignRight,
  alignTop,
  distributeHorizontally,
  distributeVertically,
} from "./actionAlign";
import {
  actionChangeViewBackgroundColor,
  actionClearTrasnform,
  actionZoomIn,
  actionZoomOut,
  actionZoomToFit,
  actionZoomToSelection,
} from "./actionCanvas";
import {
  actionChangeExportScale,
  actionChangeStrokeColor,
  actionChangeBackgroundColor,
  actionChangeFillStyle,
  actionChangeStrokeWidth,
  actionChangeSloppiness,
  actionChangeStrokeStyle,
  actionChangeArrowhead,
  actionChangeFontSize,
  actionChangeFontFamily,
  actionChangeTextAlign,
  actionChangeVerticalAlign,
  actionChangeOpacity,
  actionChangeRoundness,
} from "./actionStyles";
import type { Action } from "./types";
import {
  ARROW_HEADS,
  FONT_FAMILY,
  STROKE_WIDTH,
  STROKE_STYLES,
  VERTICAL_ALIGN,
} from "@excalidraw/common";
import { t } from "../i18n";
import {
  ArrowheadArrowIcon,
  ArrowheadBarIcon,
  ArrowheadDotIcon,
  ArrowheadTriangleIcon,
  alignBottomIcon,
  alignCenterIcon,
  alignLeftIcon,
  alignMiddleIcon,
  alignRightIcon,
  alignTopIcon,
  arrowheads,
  distributeHorizontallyIcon,
  distributeVerticallyIcon,
  fontSize,
  sloppiness,
  strokeWidth,
  textAlign,
  stroke,
  fill,
  fontFamily,
  opacity,
  roundness,
  diamond,
  ellipse,
  rectangle,
  hexagon,
} from "../components/icons";

import { changeProperty } from "./actionElement";
import { changeActiveTool } from "../utils";
import { ChangeShapeBtn } from "../components/ChangeShapeButton";

export const actionProperties: Record<string, Action> = {
  changeToRectangle: {
    trackEvent: { category: "element" },
    perform: (elements, appState, _, app) => {
      return {
        elements: changeProperty(
          elements,
          appState,
          (oldElement) => ({
            ...oldElement,
            type: "rectangle",
          }),
          app,
          false,
        ),
        appState: {
          ...appState,
          ...changeActiveTool(appState, { type: "selection" }),
        },
        commitToHistory: true,
      };
    },
    keyTest: (event) => !event.altKey,
    PanelComponent: {
      Component: ChangeShapeBtn,
      props: {
        type: "rectangle",
        title: t("tool.rectangle"),
        icon: rectangle,
      },
    },
  },

  changeToDiamond: {
    trackEvent: { category: "element" },
    perform: (elements, appState, _, app) => {
      return {
        elements: changeProperty(
          elements,
          appState,
          (oldElement) => ({
            ...oldElement,
            type: "diamond",
          }),
          app,
          false,
        ),
        appState: {
          ...appState,
          ...changeActiveTool(appState, { type: "selection" }),
        },
        commitToHistory: true,
      };
    },
    keyTest: (event) => !event.altKey,
    PanelComponent: {
      Component: ChangeShapeBtn,
      props: {
        type: "diamond",
        title: t("tool.diamond"),
        icon: diamond,
      },
    },
  },

  changeToHexagon: {
    trackEvent: { category: "element" },
    perform: (elements, appState, _, app) => {
      return {
        elements: changeProperty(
          elements,
          appState,
          (oldElement) => ({
            ...oldElement,
            type: "hexagon",
          }),
          app,
          false,
        ),
        appState: {
          ...appState,
          ...changeActiveTool(appState, { type: "selection" }),
        },
        commitToHistory: true,
      };
    },
    keyTest: (event) => !event.altKey,
    PanelComponent: {
      Component: ChangeShapeBtn,
      props: {
        type: "hexagon",
        title: t("tool.hexagon"),
        icon: hexagon,
      },
    },
  },

  changeToEllipse: {
    trackEvent: { category: "element" },
    perform: (elements, appState, _, app) => {
      return {
        elements: changeProperty(
          elements,
          appState,
          (oldElement) => ({
            ...oldElement,
            type: "ellipse",
          }),
          app,
          false,
        ),
        appState: {
          ...appState,
          ...changeActiveTool(appState, { type: "selection" }),
        },
        commitToHistory: true,
      };
    },
    keyTest: (event) => !event.altKey,
    PanelComponent: {
      Component: ChangeShapeBtn,
      props: {
        type: "ellipse",
        title: t("tool.ellipse"),
        icon: ellipse,
      },
    },
  },

  // canvas actions
  clearCanvas: actionClearCanvas,
  changeViewBackgroundColor: actionChangeViewBackgroundColor,
  zoomIn: actionZoomIn,
  zoomOut: actionZoomOut,
  zoomToFit: actionZoomToFit,
  zoomToSelection: actionZoomToSelection,
  clearTransform: actionClearTrasnform,
  // export actions
  copyAsPng: actionCopyAsPng,
  copyAsSvg: actionCopyAsSvg,
  duplicateAsImage: actionDuplicateAsImage,
  exportWithDarkMode: actionExportWithDarkMode,
  changeExportScale: actionChangeExportScale,

  // element actions
  deleteSelectedElements: actionDeleteSelected,
  duplicateSelection: actionDuplicateSelection,
  sendBackward: actionSendBackward,
  bringForward: actionBringForward,
  sendToBack: actionSendToBack,
  bringToFront: actionBringToFront,
  selectAll: actionSelectAll,
  // style actions
  changeStrokeColor: actionChangeStrokeColor,
  changeBackgroundColor: actionChangeBackgroundColor,
  changeFillStyle: actionChangeFillStyle,
  changeStrokeWidth: actionChangeStrokeWidth,
  changeSloppiness: actionChangeSloppiness,
  changeStrokeStyle: actionChangeStrokeStyle,
  changeOpacity: actionChangeOpacity,
  changeFontSize: actionChangeFontSize,
  changeFontFamily: actionChangeFontFamily,
  changeTextAlign: actionChangeTextAlign,
  changeVerticalAlign: actionChangeVerticalAlign,
  changeArrowhead: actionChangeArrowhead,
  changeRoundness: actionChangeRoundness,
  // alignment actions
  alignTop: alignTop,
  alignBottom: alignBottom,
  alignLeft: alignLeft,
  alignRight: alignRight,
  alignVerticallyCentered: alignMiddle,
  alignHorizontallyCentered: alignCenter,
  distributeHorizontally: distributeHorizontally,
  distributeVertically: distributeVertically,
  // group actions
  group: actionGroup,
  ungroup: actionUngroup,
  // history actions
  undo: actionUndo,
  redo: actionRedo,
  // other actions
  finalize: actionFinalize,
  flipHorizontal: actionFlipHorizontal,
  flipVertical: actionFlipVertical,
  copyStyles: actionCopyStyles,
  pasteStyles: actionPasteStyles,
  toggleStats: actionToggleStats,
  hyperlink: actionLink,
  toggleZenMode: actionToggleZenMode,
  toggleGridMode: actionToggleGridMode,
  closeMenu: actionCloseMenu,
  toggleFullScreen: actionToggleFullScreen,
  copy: actionCopy,
  cut: actionCut,
  paste: actionPaste,
  toggleElementLock: actionToggleElementLock,
  toggleObjectsSnapMode: actionToggleObjectsSnapMode,
  toggleGridSnapMode: actionToggleGridSnapMode,
  toggleAutomate: actionToggleAutomate,
  // tools
  setFrameAsActiveTool: actionSetFrameAsActiveTool,
  setEmbeddableAsActiveTool: actionSetEmbeddableAsActiveTool,
  setSelectionTool: actionSetSelectionTool,
  setHandTool: actionSetHandTool,
  setLaserTool: actionSetLaserTool,
  setEraserTool: actionSetEraserTool,
  setTextAsActiveTool: actionSetTextAsActiveTool,
};

export constญี่ปROPERTIES_TRIGGER_RENDER = [
  "changeStrokeColor",
  "changeBackgroundColor",
  "changeFillStyle",
  "changeStrokeWidth",
  "changeSloppiness",
  "changeStrokeStyle",
  "changeOpacity",
  "changeFontSize",
  "changeFontFamily",
  "changeTextAlign",
  "changeVerticalAlign",
  "changeArrowhead",
  "changeRoundness",
];
