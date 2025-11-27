import {
  boltIcon,
  broomIcon,
  bringForwardIcon,
  bringToFrontIcon,
  centerHorizontallyIcon,
  centerVerticallyIcon,
  diamond,
  distributeHorizontallyIcon,
  distributeVerticallyIcon,
  duplicateIcon,
  ellipse,
  exportFile,
  exportImageIcon,
  flipHorizontalIcon,
  flipVerticalIcon,
  frame,
  group,
  hexagon,
  image,
  link,
  lockIcon,
  rectangle,
  sendBackwardIcon,
  sendToBackIcon,
  trash,
  ungroup,
  unlockIcon,
} from "./icons";
import { ToolButton } from "./ToolButton";
import { DarkModeToggle } from "./DarkModeToggle";
import { THEME } from "@excalidraw/common";
import { useI18n } from "../i18n";
import { KEYS } from "@excalidraw/common";
import { getSelectedElements } from "../scene";
import { NonDeleted } from "@excalidraw/element";
import type { ExcalidrawElement } from "@excalidraw/element/types";
import { getCommonAttributeOfSelectedElements } from "../utils";
import type { AppState, UIAppState } from "../types";
import {
  canChangeRoundness,
  canHaveArrowheads,
  hasBackground,
  hasStroke,
} from "../scene/comparisons";
import type { Action, ActionManager } from "../actions/manager";
import { ActionIcon } from "./ActionIcon";
import clsx from "clsx";
import { POINTER_EVENTS } from "@excalidraw/common";
import { useUIAppState } from "../context/ui-appState";
import { useAppProps, useExcalidrawSetAppState } from "./App";
import React from "react";

const getSelectedElementsWithBoundingBox = (
  elements: readonly NonDeleted<ExcalidrawElement>[],
  appState: UIAppState,
) => getSelectedElements(elements, appState, { includeBoundText: true });

export const SelectedShapeActions = ({
  appState,
  elements,
  renderAction,
  isMobile,
}: {
  appState: UIAppState;
  elements: readonly NonDeleted<ExcalidrawElement>[];
  renderAction: ActionManager["renderAction"];
  isMobile?: boolean;
}) => {
  const { t } = useI18n();
  const selectedElements = getSelectedElementsWithBoundingBox(
    elements,
    appState,
  );

  const showFillIcon = hasBackground(selectedElements);
  const showStrokeIcon = hasStroke(selectedElements);

  const showArrowheadIcons = canHaveArrowheads(selectedElements);

  const showRoundnessIcon = canChangeRoundness(selectedElements);

  const isEditing = Boolean(appState.editingElement);
  if (isEditing) {
    return (
      <div className="panel-style-actions">
        {renderAction("changeStrokeColor")}
        {renderAction("changeBackgroundColor")}
        {renderAction("changeFillStyle")}
        {renderAction("changeStrokeWidth")}
        {renderAction("changeSloppiness")}
        {renderAction("changeStrokeStyle")}
        {renderAction("changeOpacity")}
        {renderAction("changeFontSize")}
        {renderAction("changeFontFamily")}
        {renderAction("changeTextAlign")}
      </div>
    );
  }
  return (
    <div className="panel-style-actions">
      {showStrokeIcon && renderAction("changeStrokeColor")}
      {showFillIcon && renderAction("changeBackgroundColor")}
      {renderAction("changeFillStyle")}
      {renderAction("changeStrokeWidth")}
      {renderAction("changeSloppiness")}
      {showStrokeIcon && renderAction("changeStrokeStyle")}
      {renderAction("changeOpacity")}
      {showArrowheadIcons && renderAction("changeArrowhead")}
      {showRoundnessIcon && renderAction("changeRoundness")}
      {renderAction("changeFontSize")}
      {renderAction("changeFontFamily")}
      {renderAction("changeTextAlign")}
    </div>
  );
};

export const ShapesSwitcher = ({
  appState,
  activeTool,
}: {
  appState: UIAppState;
  activeTool: AppState["activeTool"];
}) => {
  const { t } = useI18n();
  return (
    <>
      <ToolButton
        type="radio"
        icon={rectangle}
        checked={activeTool.type === "rectangle"}
        name="editor-current-shape"
        title={`${t("tool.rectangle")} — ${KEYS[1]}`}
        keyBinding="1"
        aria-label={t("tool.rectangle")}
        aria-keyshortcuts="1"
        data-testid="toolbar-rectangle"
      />
      <ToolButton
        type="radio"
        icon={diamond}
        checked={activeTool.type === "diamond"}
        name="editor-current-shape"
        title={`${t("tool.diamond")} — ${KEYS[2]}`}
        keyBinding="2"
        aria-label={t("tool.diamond")}
        aria-keyshortcuts="2"
        data-testid="toolbar-diamond"
      />
      <ToolButton
        type="radio"
        icon={hexagon}
        checked={activeTool.type === "hexagon"}
        name="editor-current-shape"
        title={`${t("tool.hexagon")}`}
        aria-label={t("tool.hexagon")}
        data-testid="toolbar-hexagon"
      />
      <ToolButton
        type="radio"
        icon={ellipse}
        checked={activeTool.type === "ellipse"}
        name="editor-current-shape"
        title={`${t("tool.ellipse")} — ${KEYS[3]}`}
        keyBinding="3"
        aria-label={t("tool.ellipse")}
        aria-keyshortcuts="3"
        data-testid="toolbar-ellipse"
      />
      <ToolButton
        type="radio"
        icon={arrowheads.arrow}
        checked={activeTool.type === "arrow"}
        name="editor-current-shape"
        title={`${t("tool.arrow")} — ${KEYS[4]}`}
        keyBinding="4"
        aria-label={t("tool.arrow")}
        aria-keyshortcuts="4"
        data-testid="toolbar-arrow"
      />
      <ToolButton
        type="radio"
        icon={arrowheads.line}
        checked={activeTool.type === "line"}
        name="editor-current-shape"
        title={`${t("tool.line")} — ${KEYS[5]}`}
        keyBinding="5"
        aria-label={t("tool.line")}
        aria-keyshortcuts="5"
        data-testid="toolbar-line"
      />
      <ToolButton
        type="radio"
        icon={image}
        checked={activeTool.type === "image"}
        name="editor-current-shape"
        title={t("tool.image")}
        aria-label={t("tool.image")}
        data-testid="toolbar-image"
      />
      <ToolButton
        type="radio"
        icon={frame}
        checked={activeTool.type === "frame"}
        name="editor-current-shape"
        title={t("tool.frame")}
        aria-label={t("tool.frame")}
        data-testid="toolbar-frame"
      />
      {appState.objectsSnapModeEnabled && (
        <ToolButton
          type="radio"
          icon={boltIcon}
          checked={activeTool.type === "magicframe"}
          name="editor-current-shape"
          title={t("tool.magicframe")}
          aria-label={t("tool.magicframe")}
          data-testid="toolbar-magicframe"
        />
      )}
    </>
  );
};
export const MainMenu = ({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect?: (event: Event) => void;
}) => {
  return (
    <div
      className="dropdown-menu dropdown-menu-left App-menu__left"
      onClick={(event) => {
        if (onSelect) {
          onSelect(event.nativeEvent);
        }
      }}
    >
      {children}
    </div>
  );
};
MainMenu.displayName = "MainMenu";
export const MenuLinks = () => {
  const { t } = useI18n();
  const appProps = useAppProps();
  return (
    <>
      <a
        href="https://plus.excalidraw.com/plus?utm_source=excalidraw&utm_medium=app&utm_content=hamburger"
        target="_blank"
        className="App-menu-item"
        rel="noopener noreferrer"
      >
        {t("buttons.excalidrawPlus")}
      </a>
      {appProps.renderWelcomeScreen ? renderAction("toggleWelcomeScreen") : null}
      {appProps.UIOptions.canvasActions.export && renderAction("export")}
      {appProps.UIOptions.canvasActions.saveAsImage &&
        renderAction("saveAsImage")}
      <a
        href="https://github.com/excalidraw/excalidraw/issues"
        target="_blank"
        className="App-menu-item"
        rel="noopener noreferrer"
      >
        {t("buttons.reportAnIssue")}
      </a>
      <a
        href="https://docs.excalidraw.com"
        target="_blank"
        className="App-menu-item"
        rel="noopener noreferrer"
      >
        {t("help.documentation")}
      </a>
      <a
        href="https://blog.excalidraw.com"
        target="_blank"
        className="App-menu-item"
        rel="noopener noreferrer"
      >
        {t("buttons.blog")}
      </a>
    </>
  );
};
export const MenuItems = ({
  actionManager,
}: {
  actionManager: ActionManager;
}) => {
  return (
    <>
      {actionManager.renderAction("loadScene")}
      {actionManager.renderAction("saveToActiveFile", {
        classes: "App-menu-item-last",
      })}
      <div className="App-menu-item-separator" />
      {actionManager.renderAction("export")}
      {actionManager.renderAction("saveAsImage")}
      <div className="App-menu-item-separator" />
      {actionManager.renderAction("toggleWelcomeScreen")}
      {actionManager.renderAction("liveCollaborationTrigger", {
        classes: "App-menu-item-last",
      })}
      <div className="App-menu-item-separator" />
      <div className="App-menu-item" onClick={(e) => e.preventDefault()}>
        {actionManager.renderAction("toggleTheme", {
          context: "menu",
          isToggled: (appState) => appState.theme === THEME.DARK,
        })}
      </div>
      <div className="App-menu-item-separator" />
      {actionManager.renderAction("commandPalette", {
        classes: "App-menu-item-last",
      })}
    </>
  );
};

export const TopLeftMenu = ({
  showExitZenModeBtn,
  showToggleThemeBtn,
  actionManager,
  renderTopRightUI,
}: {
  actionManager: ActionManager;
  showExitZenModeBtn: boolean;
  showToggleThemeBtn: boolean;
  renderTopRightUI:
    | ((isMobile: boolean, appState: AppState) => JSX.Element | null)
    | null;
}) => {
  const appState = useUIAppState();
  return (
    <>
      {actionManager.renderAction("toggleMenu", {
        size: "medium",
        context: "topLeft",
      })}

      {showToggleThemeBtn && (
        <div className="disable-zen-mode">
          {actionManager.renderAction("toggleTheme", {
            isToggled: (appState) => appState.theme === THEME.DARK,
          })}
        </div>
      )}

      {showExitZenModeBtn && renderAction("toggleZenMode")}
      {renderTopRightUI?.(false, appState)}
    </>
  );
};

const ContextMenu = ({
  actionManager,
  elements,
  appState,
  onClose,
}: {
  actionManager: ActionManager;
  elements: readonly ExcalidrawElement[];
  appState: AppState;
  onClose: () => void;
}) => {
  const { t } = useI18n();

  const renderAction = React.useCallback(
    (name: Action) => {
      const shortcut = actionManager.getShortcut(name);
      return (
        <ToolButton
          type="button"
          icon={actionManager.getIcon(name)}
          aria-label={t(actionManager.getLabel(name))}
          title={`${t(actionManager.getLabel(name))} ${shortcut ? shortcut : ""
            }`}
          onClick={() => {
            actionManager.executeAction(name, "contextMenu");
            onClose();
          }}
        />
      );
    },
    [actionManager, onClose, t],
  );

  return (
    <div className="context-menu">
      {renderAction("cut")}
      {renderAction("copy")}
      {renderAction("paste")}
      <div className="context-menu-separator"></div>
      {renderAction("copyStyles")}
      {renderAction("pasteStyles")}
      <div className="context-menu-separator"></div>
      {renderAction("deleteSelectedElements")}
      <div className="context-menu-separator"></div>
      {renderAction("sendBackward")}
      {renderAction("bringForward")}
      {renderAction("sendToBack")}
      {renderAction("bringToFront")}
      <div className="context-menu-separator"></div>
      {renderAction("flipHorizontal")}
      {renderAction("flipVertical")}
      <div className="context-menu-separator"></div>
      {renderAction("hyperlink")}
      {renderAction("group")}
      {renderAction("ungroup")}
      <div className="context-menu-separator"></div>
      {renderAction("toggleElementLock")}
    </div>
  );
};

export const LayerUI = ({
  actionManager,
  appState,
  elements,
  canvas,
  isMobile,
  isCollaborating,
  renderTopRightUI,
  renderCustomStats,
  showExitZenModeBtn,
  showToggleThemeBtn,
  onLockToggle,
}: {
  actionManager: ActionManager;
  appState: UIAppState;
  elements: readonly NonDeleted<ExcalidrawElement>[];
  canvas: HTMLCanvasElement | null;
  isMobile?: boolean;
  isCollaborating?: boolean;
  renderTopRightUI?:
  | ((isMobile: boolean, appState: AppState) => JSX.Element | null)
  | null;
  renderCustomStats?: (
    elements: readonly ExcalidrawElement[],
    appState: AppState,
  ) => JSX.Element;
  showExitZenModeBtn: boolean;
  showToggleThemeBtn: boolean;
  onLockToggle: () => void;
}) => {
  const { t } = useI18n();

  const renderAction = actionManager.renderAction;

  const selectedElements = getSelectedElementsWithBoundingBox(
    elements,
    appState,
  );
  const selectedElement = selectedElements[0];

  const renderSelectedShapeActions = () => (
    <div className="panel-style-actions-container">
      <fieldset>
        <legend>{t("labels.selectedShape")}</legend>
        <div className="panelColumn">
          <SelectedShapeActions
            appState={appState}
            elements={elements}
            renderAction={renderAction}
          />
        </div>
      </fieldset>
    </div>
  );

  const renderElementLock = () => {
    if (selectedElements.length !== 1) {
      return null;
    }

    const isLocked = selectedElement.locked;

    return (
      <ToolButton
        className={clsx("lock-button", {
          "is-radio-checked": isLocked,
        })}
        type="button"
        icon={isLocked ? lockIcon : unlockIcon}
        onClick={onLockToggle}
        title={isLocked ? t("toolBar.unlock") : t("toolBar.lock")}
        aria-label={isLocked ? t("toolBar.unlock") : t("toolBar.lock")}
      />
    );
  };
  if (isMobile) {
    return (
      <div
        className="excalidraw-mobile-layer-ui"
        style={{
          // necessary to prevent nested scrolling on mobile
          touchAction: "none",
          // necessary so scaled-element controls are visible
          overflow: "clip",
        }}
      >
        <div
          className="App-menu App-menu_top"
          style={{
            pointerEvents: appState.zenModeEnabled
              ? POINTER_EVENTS.disabled
              : POINTER_EVENTS.inheritFromUI,
          }}
        >
          <div className="App-menu_top__left">
            <TopLeftMenu
              actionManager={actionManager}
              showExitZenModeBtn={showExitZenModeBtn}
              showToggleThemeBtn={showToggleThemeBtn}
              renderTopRightUI={renderTopRightUI}
            />
          </div>
          <div className="App-menu_top__right">
            {renderAction("zoomIn")}
            {renderAction("zoomOut")}
            {actionManager.renderAction("zoomToFit", { size: "small" })}
          </div>
        </div>
        {appState.contextMenu && (
          <ContextMenu
            actionManager={actionManager}
            elements={elements}
            appState={appState}
            onClose={() => actionManager.executeAction(actionCloseMenu)}
          />
        )}
        {selectedElements.length > 0 && (
          <div className="selected-shape-actions">
            <div className="App-menu App-menu_bottom">
              <div className="App-menu_bottom__left">
                {renderAction("sendBackward")}
                {renderAction("bringForward")}
              </div>
              <div className="App-menu_bottom__right">
                {renderAction("deleteSelectedElements")}
                {renderElementLock()}
              </div>
            </div>
          </div>
        )}
        <div className="App-toolbar-container">
          <div className="App-toolbar">
            <div className="App-toolbar__content-left">
              {renderAction("toggleMenu", {
                size: "medium",
                context: "toolbar-mobile",
              })}
            </div>
            <div className="App-toolbar__content-center">
              {renderAction("undo")}
              {renderAction("redo")}
            </div>
            <div className="App-toolbar__content-right">
              {renderAction("finalize")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {appState.contextMenu && (
        <ContextMenu
          actionManager={actionManager}
          elements={elements}
          appState={appState}
          onClose={() => actionManager.executeAction(actionCloseMenu)}
        />
      )}
      <div
        className="layer-ui__wrapper"
        style={{
          pointerEvents: appState.zenModeEnabled
            ? POINTER_EVENTS.disabled
            : POINTER_EVENTS.inheritFromUI,
        }}
      >
        <div className="App-menu App-menu_top">
          <div className="App-menu_top__left">
            <TopLeftMenu
              actionManager={actionManager}
              showExitZenModeBtn={showExitZenModeBtn}
              showToggleThemeBtn={showToggleThemeBtn}
              renderTopRightUI={renderTopRightUI}
            />
          </div>
        </div>
        <div className="layer-ui__sidebar">
          <div className={clsx("layer-ui__sidebar-multi-select-actions", {})}>
            <div className="multi-select-actions">
              {selectedElements.length > 1 && (
                <>
                  {renderAction("alignTop")}
                  {renderAction("alignBottom")}
                  {renderAction("alignLeft")}
                  {renderAction("alignRight")}
                  {renderAction("distributeHorizontally")}
                  {renderAction("distributeVertically")}
                  {renderAction("alignVerticallyCentered")}
                  {renderAction("alignHorizontallyCentered")}
                </>
              )}
            </div>
          </div>
          {selectedElements.length > 0 && (
            <fieldset>
              <div className="panelHeader">
                {t("labels.selection")}
                <div className="panelHeader-actions">
                  <div className="element-locked-actions">
                    {renderAction("toggleElementLock")}
                  </div>
                  {renderAction("duplicateSelection")}
                  {renderAction("deleteSelectedElements")}
                </div>
              </div>
              <div className="panelColumn">
                {selectedElements.length === 1 && (
                  <div className="element-height">
                    <label htmlFor="element-height">{t("labels.h")}</label>
                    <div className="element-height-quick-actions">
                      {actionManager.renderAction(
                        "changeWithLeap",
                        undefined,
                        "height",
                      )}
                    </div>
                  </div>
                )}
                {selectedElements.length > 0 && (
                  <div className="element-link">
                    {actionManager.renderAction("hyperlink")}
                  </div>
                )}
              </div>
            </fieldset>
          )}

          {renderSelectedShapeActions()}
          <fieldset>
            <div className="panelHeader">
              {t("labels.actions")}
              <div className="panelHeader-actions">
                {selectedElements.length > 0 ? (
                  <>
                    {renderAction("sendBackward")}
                    {renderAction("bringForward")}
                    {renderAction("sendToBack")}
                    {renderAction("bringToFront")}
                    <div className="App-menu-item-separator" />
                    {renderAction("flipHorizontal")}
                    {renderAction("flipVertical")}
                    <div className="App-menu-item-separator" />
                    {renderAction("group")}
                    {renderAction("ungroup")}
                  </>
                ) : null}
              </div>
            </div>
          </fieldset>
        </div>
        <div className="App-toolbar-container">
          <div className="App-toolbar">
            <div className="App-toolbar__content">
              <div className="App-toolbar-center">
                <div className="App-toolbar-section">
                  {renderAction("toggleElementLock")}
                </div>
                <div className="App-toolbar-section">
                  {renderAction("selection")}
                  {renderAction("hand")}
                  <div className="App-toolbar-shape-actions">
                    <ToolButton
                      type="radio"
                      icon={rectangle}
                      checked={appState.activeTool.type === "rectangle"}
                      name="editor-current-shape"
                      title={`${t("tool.rectangle")} — ${KEYS[1]}`}
                      keyBinding="1"
                      aria-label={t("tool.rectangle")}
                      aria-keyshortcuts="1"
                      data-testid="toolbar-rectangle"
                    />
                    <ToolButton
                      type="radio"
                      icon={diamond}
                      checked={appState.activeTool.type === "diamond"}
                      name="editor-current-shape"
                      title={`${t("tool.diamond")} — ${KEYS[2]}`}
                      keyBinding="2"
                      aria-label={t("tool.diamond")}
                      aria-keyshortcuts="2"
                      data-testid="toolbar-diamond"
                    />
                    <ToolButton
                      type="radio"
                      icon={hexagon}
                      checked={appState.activeTool.type === "hexagon"}
                      name="editor-current-shape"
                      title={`${t("tool.hexagon")}`}
                      aria-label={t("tool.hexagon")}
                      data-testid="toolbar-hexagon"
                    />
                    <ToolButton
                      type="radio"
                      icon={ellipse}
                      checked={appState.activeTool.type === "ellipse"}
                      name="editor-current-shape"
                      title={`${t("tool.ellipse")} — ${KEYS[3]}`}
                      keyBinding="3"
                      aria-label={t("tool.ellipse")}
                      aria-keyshortcuts="3"
                      data-testid="toolbar-ellipse"
                    />
                    <ToolButton
                      type="radio"
                      icon={arrowheads.arrow}
                      checked={appState.activeTool.type === "arrow"}
                      name="editor-current-shape"
                      title={`${t("tool.arrow")} — ${KEYS[4]}`}
                      keyBinding="4"
                      aria-label={t("tool.arrow")}
                      aria-keyshortcuts="4"
                      data-testid="toolbar-arrow"
                    />
                    <ToolButton
                      type="radio"
                      icon={arrowheads.line}
                      checked={appState.activeTool.type === "line"}
                      name="editor-current-shape"
                      title={`${t("tool.line")} — ${KEYS[5]}`}
                      keyBinding="5"
                      aria-label={t("tool.line")}
                      aria-keyshortcuts="5"
                      data-testid="toolbar-line"
                    />
                    <ToolButton
                      type="radio"
                      icon={arrowheads.freedraw}
                      checked={appState.activeTool.type === "freedraw"}
                      name="editor-current-shape"
                      title={`${t("tool.freedraw")} — ${KEYS[6]}`}
                      keyBinding="6"
                      aria-label={t("tool.freedraw")}
                      aria-keyshortcuts="6"
                      data-testid="toolbar-freedraw"
                    />
                    <ToolButton
                      type="radio"
                      icon={arrowheads.text}
                      checked={appState.activeTool.type === "text"}
                      name="editor-current-shape"
                      title={`${t("tool.text")} — ${KEYS[7]}`}
                      keyBinding="7"
                      aria-label={t("tool.text")}
                      aria-keyshortcuts="7"
                      data-testid="toolbar-text"
                    />
                    <ToolButton
                      type="radio"
                      icon={frame}
                      checked={appState.activeTool.type === "frame"}
                      name="editor-current-shape"
                      title={t("tool.frame")}
                      aria-label={t("tool.frame")}
                      data-testid="toolbar-frame"
                    />
                    {appState.objectsSnapModeEnabled && (
                      <ToolButton
                        type="radio"
                        icon={boltIcon}
                        checked={appState.activeTool.type === "magicframe"}
                        name="editor-current-shape"
                        title={t("tool.magicframe")}
                        aria-label={t("tool.magicframe")}
                        data-testid="toolbar-magicframe"
                      />
                    )}
                    <ToolButton
                      type="button"
                      icon={image}
                      title={t("tool.image")}
                      aria-label={t("tool.image")}
                      name="editor-library"
                      onClick={() => {
                        actionManager.executeAction(
                          actionManager.actions.insertImage,
                        );
                      }}
                    />
                  </div>
                  {renderAction("eraser")}
                  {renderAction("laser")}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="App-menu App-menu_bottom">
          <div className="App-menu_bottom__left">
            {actionManager.renderAction("undo")}
            {actionManager.renderAction("redo")}
          </div>
          <div className="App-menu_bottom__right">
            {renderAction("toggleStats")}
            {actionManager.renderAction("zoomIn")}
            {actionManager.renderAction("zoomOut")}
            {actionManager.renderAction("zoomToFit", { size: null })}
          </div>
        </div>
      </div>
    </>
  );
};

export const LiveCollaborationTrigger = ({
  isCollaborating,
  onSelect,
}: {
  isCollaborating: boolean;
  onSelect: () => void;
}) => {
  const { t } = useI18n();
  const appState = useUIAppState();
  const setAppState = useExcalidrawSetAppState();
  const nCollaborators = appState.collaborators.size;
  return (
    <ToolButton
      className="collab-button"
      type="button"
      title={t("labels.liveCollaboration")}
      aria-label={t("labels.liveCollaboration")}
      onClick={() => {
        if (isCollaborating) {
          setAppState({ openDialog: { name: "liveCollaboration" } });
        } else {
          onSelect();
        }
      }}
    >
      {nCollaborators > 0 && (
        <div className="CollabButton-collaborators">
          <div className="CollabButton-collaborator-count">
            {nCollaborators}
          </div>
        </div>
      )}
    </ToolButton>
  );
};
LiveCollaborationTrigger.displayName = "LiveCollaborationTrigger";

export const ExitZenModeAction = ({
  actionManager,
}: {
  actionManager: ActionManager;
}) => (
  <button
    className="disable-zen-mode"
    onClick={() => {
      actionManager.executeAction(actionManager.actions.toggleZenMode);
    }}
  >
    <ActionIcon
      action={actionManager.actions.toggleZenMode}
      showLabel={true}
    />
  </button>
);

export const FinalizeAction = ({
  renderAction,
  className,
}: {
  renderAction: ActionManager["renderAction"];
  className: string;
}) => {
  return (
    <div className={className}>
      <div className="finalize-button">
        {renderAction("finalize", { size: "small" })}
      </div>
    </div>
  );
};

export const ShapesSwitcherWrapper = ({
  appState,
  activeTool,
}: {
  appState: UIAppState;
  activeTool: AppState["activeTool"];
}) => {
  const { t } = useI18n();
  return (
    <>
      <div className="App-toolbar-section">
        <div className="App-toolbar-shape-actions">
          {activeTool.type === "rectangle" ||
            activeTool.type === "diamond" ||
            activeTool.type === "ellipse" ||
            activeTool.type === "hexagon" ||
            activeTool.type === "arrow" ||
            activeTool.type === "line" ? (
            <ToolButton
              type="button"
              icon={
                activeTool.type === "rectangle"
                  ? rectangle
                  : activeTool.type === "diamond"
                    ? diamond
                    : activeTool.type === "hexagon"
                      ? hexagon
                      : activeTool.type === "ellipse"
                        ? ellipse
                        : activeTool.type === "arrow"
                          ? arrowheads.arrow
                          : arrowheads.line
              }
              aria-label={t(`toolBar.shapes`)}
              title={t(`toolBar.shapes`)}
              name="editor-current-shape"
              id="active-shape"
            />
          ) : null}
        </div>
      </div>
    </>
  );
};

export const actionChangeShape = {
  "change-shape": {
    PanelComponent: ({ appState, updateData, data }: any) => {
      return (
        <div className="change-shape-button-container">
          {data?.property === "changeShape" ? (
            <div
              style={{
                display: "flex",
                gap: ".225rem",
              }}
            >
              <ChangeShapeBtn
                type="rectangle"
                title={t("tool.rectangle")}
                icon={rectangle}
                isActive={getCommonAttributeOfSelectedElements(
                  data.elements,
                  appState,
                  "type",
                ) === "rectangle"}
                appState={appState}
                elements={data.elements}
              />
              <ChangeShapeBtn
                type="diamond"
                title={t("tool.diamond")}
                icon={diamond}
                isActive={getCommonAttributeOfSelectedElements(
                  data.elements,
                  appState,
                  "type",
                ) === "diamond"}
                appState={appState}
                elements={data.elements}
              />
              <ChangeShapeBtn
                type="hexagon"
                title={t("tool.hexagon")}
                icon={hexagon}
                isActive={getCommonAttributeOfSelectedElements(
                  data.elements,
                  appState,
                  "type",
                ) === "hexagon"}
                appState={appState}
                elements={data.elements}
              />
              <ChangeShapeBtn
                type="ellipse"
                title={t("tool.ellipse")}
                icon={ellipse}
                isActive={getCommonAttributeOfSelectedElements(
                  data.elements,
                  appState,
                  "type",
                ) === "ellipse"}
                appState={appState}
                elements={data.elements}
              />
            </div>
          ) : null}
        </div>
      );
    },
  },
};
