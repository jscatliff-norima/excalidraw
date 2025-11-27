import {
  handIcon,
  laserIcon,
  selectionIcon,
  textIcon,
} from "../components/icons";
import { ToolButton } from "../components/ToolButton";
import { LockedIcon } from "../components/LockedIcon";
import {
  isHandToolFollower,
  isLaserToolFollower,
  isEraserToolFollower,
} from "../utils";
import { t } from "../i18n";
import type { AppState } from "../types";
import {
  SHAPES,
  DEPRECATED_SHAPES,
  FRAME_TOOLS,
} from "../constants";

import { trackEvent } from "../analytics";
import { useUIAppState } from "../context/ui-appState";
import { useExcalidrawSetAppState } from "./App";
import { eraserIcon } from "./icons";
import { useTunnels } from "../context/tunnels";
import type { ReactElement } from "react";
import { isMobile } from "@excalidraw/common";
import {
  arrowheads,
  diamond,
  ellipse,
  freedraw,
  hexagon,
  image,
  rectangle,
} from "./icons";
import { isHandToolEnabled } from "../utils";

export const getFieldFromTitle = (title: string) => {
  return title.toLowerCase().replace(" ", "-");
};

interface ToolPanelProps {
  children: React.ReactNode;
  title?: string;
  name?: string;
  isMobile?: boolean;
}

const ToolPanel = ({ children, title, name, isMobile }: ToolPanelProps) => {
  return (
    <section
      className="tool-panel"
      aria-labelledby={name ? getFieldFromTitle(name) : ""}
    >
      {title && (
        <h3 id={getFieldFromTitle(name || "")} className="tool-panel-title">
          {title}
        </h3>
      )}
      <div className="tool-panel-container">{children}</div>
    </section>
  );
};
interface ToolsProps {
  appState: AppState;
}

export const Tools = ({ appState }: ToolsProps) => {
  const {
    penMode,
    penDetected,
    activeTool: { type: activeToolType, customType },
  } = appState;
  const setAppState = useExcalidrawSetAppState();
  const { toolsElements } = useTunnels().jotai;

  const isHandTool = isHandToolEnabled(appState);
  const isLaserTool = isLaserToolFollower(appState);
  const isEraserTool = isEraserToolFollower(appState);

  const handToolFollower = isHandToolFollower(appState);

  const onChange = (data: {
    activeTool: AppState["activeTool"];
    penMode?: boolean;
    penDetected?: boolean;
    objectsSnapModeEnabled?: boolean;
  }) => {
    trackEvent(
      "toolbar",
      data.activeTool.type,
      "ui",
      `follow-mode:${handToolFollower}`,
    );
    let activeTool: AppState["activeTool"] = data.activeTool;
    if (activeTool.type === "image") {
      activeTool = {
        ...activeTool,
        type: "image",
        customType: null,
      };
    } else if (activeTool.type === "custom") {
      activeTool = {
        ...activeTool,
        type: "custom",
      };
    }
    const update: Partial<AppState> = {
      activeTool,
    };
    if (data.activeTool.type === "selection") {
      update.objectsSnapModeEnabled = data.objectsSnapModeEnabled ?? false;
    }
    if (penDetected && data.penMode !== undefined) {
      update.penMode = data.penMode;
    }

    setAppState(update);
  };

  const renderShapeTools = () => {
    const shapeTools = isMobile
      ? [...SHAPES, ...FRAME_TOOLS]
      : [...SHAPES, ...DEPRECATED_SHAPES, ...FRAME_TOOLS];

    return shapeTools.map(({ value, icon, key, numericKey, testId, ...rest }) => (
      <ToolButton
        {...rest}
        type="radio"
        key={value}
        icon={icon}
        checked={activeToolType === value}
        name="editor-current-shape"
        title={`${t(`tool.${value}`)}${
          numericKey ? ` — ${numericKey}` : ""
        }`}
        keyBinding={numericKey}
        aria-label={t(`tool.${value}`)}
        aria-keyshortcuts={numericKey}
        data-testid={testId}
        onPointerDown={({ pointerType }) => {
          if (pointerType === "pen" || pointerType === "touch") {
            onChange({ activeTool: { type: value, customType: null } });
          }
        }}
        onChange={() => {
          onChange({ activeTool: { type: value, customType: null } });
        }}
      />
    ));
  };
  const renderShapes = () => (
    <ToolPanel name={t("toolBar.shapes")}>
      <ToolButton
        type="radio"
        icon={rectangle}
        checked={activeToolType === "rectangle"}
        name="editor-current-shape"
        title={`${t("tool.rectangle")} — 1`}
        keyBinding="1"
        aria-label={t("tool.rectangle")}
        aria-keyshortcuts="1"
        data-testid="toolbar-rectangle"
        onPointerDown={({ pointerType }) => {
          if (pointerType === "pen" || pointerType === "touch") {
            onChange({ activeTool: { type: "rectangle" } });
          }
        }}
        onChange={() => {
          onChange({ activeTool: { type: "rectangle" } });
        }}
      />
      <ToolButton
        type="radio"
        icon={diamond}
        checked={activeToolType === "diamond"}
        name="editor-current-shape"
        title={`${t("tool.diamond")} — 2`}
        keyBinding="2"
        aria-label={t("tool.diamond")}
        aria-keyshortcuts="2"
        data-testid="toolbar-diamond"
        onPointerDown={({ pointerType }) => {
          if (pointerType === "pen" || pointerType === "touch") {
            onChange({ activeTool: { type: "diamond" } });
          }
        }}
        onChange={() => {
          onChange({ activeTool: { type: "diamond" } });
        }}
      />
      <ToolButton
        type="radio"
        icon={hexagon}
        checked={activeToolType === "hexagon"}
        name="editor-current-shape"
        title={t("tool.hexagon")}
        aria-label={t("tool.hexagon")}
        data-testid="toolbar-hexagon"
        onPointerDown={({ pointerType }) => {
          if (pointerType === "pen" || pointerType === "touch") {
            onChange({ activeTool: { type: "hexagon" } });
          }
        }}
        onChange={() => {
          onChange({ activeTool: { type: "hexagon" } });
        }}
      />
      <ToolButton
        type="radio"
        icon={ellipse}
        checked={activeToolType === "ellipse"}
        name="editor-current-shape"
        title={`${t("tool.ellipse")} — 3`}
        keyBinding="3"
        aria-label={t("tool.ellipse")}
        aria-keyshortcuts="3"
        data-testid="toolbar-ellipse"
        onPointerDown={({ pointerType }) => {
          if (pointerType === "pen" || pointerType === "touch") {
            onChange({ activeTool: { type: "ellipse" } });
          }
        }}
        onChange={() => {
          onChange({ activeTool: { type: "ellipse" } });
        }}
      />
      <ToolButton
        type="radio"
        icon={arrowheads.arrow}
        checked={activeToolType === "arrow"}
        name="editor-current-shape"
        title={`${t("tool.arrow")} — 4`}
        keyBinding="4"
        aria-label={t("tool.arrow")}
        aria-keyshortcuts="4"
        data-testid="toolbar-arrow"
        onPointerDown={({ pointerType }) => {
          if (pointerType === "pen" || pointerType === "touch") {
            onChange({ activeTool: { type: "arrow" } });
          }
        }}
        onChange={() => {
          onChange({ activeTool: { type: "arrow" } });
        }}
      />
      <ToolButton
        type="radio"
        icon={arrowheads.line}
        checked={activeToolType === "line"}
        name="editor-current-shape"
        title={`${t("tool.line")} — 5`}
        keyBinding="5"
        aria-label={t("tool.line")}
        aria-keyshortcuts="5"
        data-testid="toolbar-line"
        onPointerDown={({ pointerType }) => {
          if (pointerType === "pen" || pointerType === "touch") {
            onChange({ activeTool: { type: "line" } });
          }
        }}
        onChange={() => {
          onChange({ activeTool: { type: "line" } });
        }}
      />
      <ToolButton
        type="radio"
        icon={freedraw}
        checked={activeToolType === "freedraw"}
        name="editor-current-shape"
        title={`${t("tool.freedraw")} — 6`}
        keyBinding="6"
        aria-label={t("tool.freedraw")}
        aria-keyshortcuts="6"
        data-testid="toolbar-freedraw"
        onPointerDown={({ pointerType }) => {
          if (pointerType === "pen" || pointerType === "touch") {
            onChange({ activeTool: { type: "freedraw" } });
          }
        }}
        onChange={() => {
          onChange({
            activeTool: { type: "freedraw" },
            penMode: penDetected && !penMode ? true : penMode,
          });
        }}
      />
      <ToolButton
        type="radio"
        icon={textIcon}
        checked={activeToolType === "text"}
        name="editor-current-shape"
        title={`${t("tool.text")} — 7`}
        keyBinding="7"
        aria-label={t("tool.text")}
        aria-keyshortcuts="7"
        data-testid="toolbar-text"
        onPointerDown={({ pointerType }) => {
          if (pointerType === "pen" || pointerType === "touch") {
            onChange({ activeTool: { type: "text" } });
          }
        }}
        onChange={() => {
          onChange({ activeTool: { type: "text" } });
        }}
      />
      {renderShapeTools()}
      {toolsElements}
    </ToolPanel>
  );

  return (
    <>
      <ToolPanel isMobile={isMobile}>
        <ToolButton
          type="radio"
          icon={selectionIcon}
          checked={activeToolType === "selection"}
          name="editor-current-tool"
          title={`${t("tool.selection")} — 8`}
          keyBinding="8"
          aria-label={t("tool.selection")}
          aria-keyshortcuts="8"
          data-testid="toolbar-selection"
          onChange={() =>
            onChange({
              activeTool: { type: "selection" },
              objectsSnapModeEnabled: true,
            })
          }
        />
        <ToolButton
          type="radio"
          icon={handIcon}
          checked={activeToolType === "hand"}
          name="editor-current-tool"
          title={`${t("tool.hand")} — ${t("tool.handShortKey")}`}
          keyBinding={t("tool.handShortKey")}
          aria-label={t("tool.hand")}
          aria-keyshortcuts={t("tool.handShortKey")}
          data-testid="toolbar-hand"
          onChange={() => onChange({ activeTool: { type: "hand" } })}
        />
        {!isHandTool && !isLaserTool && !isEraserTool && renderShapes()}

        <ToolButton
          type="radio"
          icon={eraserIcon}
          checked={activeToolType === "eraser"}
          name="editor-current-tool"
          title={`${t("tool.eraser")} — ${t("tool.eraserShortKey")}`}
          keyBinding={t("tool.eraserShortKey")}
          aria-label={t("tool.eraser")}
          aria-keyshortcuts={t("tool.eraserShortKey")}
          data-testid="toolbar-eraser"
          onChange={() => onChange({ activeTool: { type: "eraser" } })}
        />

        <ToolButton
          type="radio"
          icon={laserIcon}
          checked={activeToolType === "laser"}
          name="editor-current-tool"
          title={t("tool.laser")}
          aria-label={t("tool.laser")}
          data-testid="toolbar-laser"
          onChange={() => onChange({ activeTool: { type: "laser" } })}
        />
      </ToolPanel>

      <div className="tool-panel-lock">
        {activeToolType !== "selection" && <LockedIcon appState={appState} />}
      </div>
    </>
  );
};
