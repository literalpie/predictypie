import { Tooltip as KobalteTooltip } from "@kobalte/core/tooltip";

type TooltipProps = {
  text: string;
  tooltip: string;
  class?: string;
  onClick?: (e: MouseEvent) => void;
};

export function Tooltip(props: TooltipProps) {
  return (
    <KobalteTooltip gutter={4}>
      <KobalteTooltip.Trigger
        as="span"
        class={props.class ?? "underline decoration-dotted underline-offset-2"}
        onClick={props.onClick}
      >
        {props.text}
      </KobalteTooltip.Trigger>
      <KobalteTooltip.Portal>
        <KobalteTooltip.Content class="bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-xs rounded px-2 py-1 shadow-lg">
          {props.tooltip}
        </KobalteTooltip.Content>
      </KobalteTooltip.Portal>
    </KobalteTooltip>
  );
}
