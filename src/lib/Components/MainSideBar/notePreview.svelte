<script lang="ts">
  interface Props {
    title: string;
    isActive?: boolean;
    onclick: () => void;
    onpointerenter: (event: PointerEvent) => void;
    onpointerleave: () => void;
  }

  let {
    title,
    isActive = false,
    onclick,
    onpointerenter,
    onpointerleave,
  }: Props = $props();
</script>

<button
  type="button"
  {onclick}
  {onpointerenter}
  {onpointerleave}
  class={[
    "flex h-[26px] w-full flex-none items-center rounded-sm px-2 text-left text-xs",
    isActive
      ? "bg-surface-selected text-text-primary"
      : "text-text-secondary hover:bg-surface-raised",
  ]}
>
  <span class="truncate">{title}</span>
</button>
