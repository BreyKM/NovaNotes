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
    "rounded-sim flex h-[26px] w-full flex-none items-center px-2 text-left text-xs",
    isActive
      ? "bg-surface-raised text-text-primary"
      : "text-text-primary/80 hover:bg-surface-raised",
  ]}
>
  <span class="truncate">{title}</span>
</button>
