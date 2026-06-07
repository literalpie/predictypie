import { clientOnly } from "@solidjs/start";

export const CollapsibleRoot = clientOnly(() =>
  import("@msviderok/base-ui-solid").then((m) => ({ default: m.Collapsible.Root })),
);
export const CollapsibleTrigger = clientOnly(() =>
  import("@msviderok/base-ui-solid").then((m) => ({ default: m.Collapsible.Trigger })),
);
export const CollapsiblePanel = clientOnly(() =>
  import("@msviderok/base-ui-solid").then((m) => ({ default: m.Collapsible.Panel })),
);

export const TooltipRoot = clientOnly(() =>
  import("@msviderok/base-ui-solid").then((m) => ({ default: m.Tooltip.Root })),
);
export const TooltipTrigger = clientOnly(() =>
  import("@msviderok/base-ui-solid").then((m) => ({ default: m.Tooltip.Trigger })),
);
export const TooltipPortal = clientOnly(() =>
  import("@msviderok/base-ui-solid").then((m) => ({ default: m.Tooltip.Portal })),
);
export const TooltipPositioner = clientOnly(() =>
  import("@msviderok/base-ui-solid").then((m) => ({ default: m.Tooltip.Positioner })),
);
export const TooltipPopup = clientOnly(() =>
  import("@msviderok/base-ui-solid").then((m) => ({ default: m.Tooltip.Popup })),
);

export const PopoverRoot = clientOnly(() =>
  import("@msviderok/base-ui-solid").then((m) => ({ default: m.Popover.Root })),
);
export const PopoverTrigger = clientOnly(() =>
  import("@msviderok/base-ui-solid").then((m) => ({ default: m.Popover.Trigger })),
);
export const PopoverPortal = clientOnly(() =>
  import("@msviderok/base-ui-solid").then((m) => ({ default: m.Popover.Portal })),
);
export const PopoverPositioner = clientOnly(() =>
  import("@msviderok/base-ui-solid").then((m) => ({ default: m.Popover.Positioner })),
);
export const PopoverPopup = clientOnly(() =>
  import("@msviderok/base-ui-solid").then((m) => ({ default: m.Popover.Popup })),
);
export const PopoverClose = clientOnly(() =>
  import("@msviderok/base-ui-solid").then((m) => ({ default: m.Popover.Close })),
);
