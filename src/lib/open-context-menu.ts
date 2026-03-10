import type * as React from "react";

export function openContextMenuFromButton(
  event: React.MouseEvent<HTMLElement>,
) {
  event.preventDefault();
  event.stopPropagation();

  const trigger = event.currentTarget.closest(
    '[data-slot="context-menu-trigger"]',
  ) as HTMLElement | null;

  if (!trigger) {
    return;
  }

  const { right, bottom } = event.currentTarget.getBoundingClientRect();

  trigger.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: right,
      clientY: bottom,
    }),
  );
}
