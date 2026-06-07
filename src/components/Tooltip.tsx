import {
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipPositioner,
  TooltipPopup,
} from "./ClientCollapsible";

type TooltipProps = {
  text: string;
  tooltip: string;
  class?: string;
  onClick?: (e: MouseEvent) => void;
};

export function Tooltip(props: TooltipProps) {
  return (
    <TooltipRoot>
      <TooltipTrigger
        render="span"
        class={props.class ?? "underline decoration-dotted underline-offset-2"}
        onClick={props.onClick}
      >
        {props.text}
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipPositioner sideOffset={4}>
          <TooltipPopup class="bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-xs rounded px-2 py-1 shadow-lg">
            {props.tooltip}
          </TooltipPopup>
        </TooltipPositioner>
      </TooltipPortal>
    </TooltipRoot>
  );
}
