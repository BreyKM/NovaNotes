<script>
  import { Editor, rootCtx, defaultValueCtx } from "@milkdown/kit/core";
  import { history } from "@milkdown/kit/plugin/history";
  import { gfm, tableSchema } from "@milkdown/kit/preset/gfm";
  import { clipboard } from "@milkdown/kit/plugin/clipboard";
  import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
  import { indent, indentConfig } from "@milkdown/plugin-indent";
  import { commonmark } from "@milkdown/kit/preset/commonmark";

  import { linkSchema } from "@milkdown/kit/preset/commonmark";

  import { Plugin, PluginKey } from "@milkdown/prose/state";

  import {
    schema,
    markInputRules,
    commands,
    keymap as commonKeymap,
    plugins as commonmarkPlugins,
  } from "@milkdown/kit/preset/commonmark";

  import {
    listItemBlockComponent,
    listItemBlockConfig,
  } from "@milkdown/kit/component/list-item-block";
  import {
    tableBlock,
    tableBlockConfig,
    TableNodeView,
  } from "@milkdown/kit/component/table-block";
  import {
    codeBlockComponent,
    codeBlockConfig,
    defaultConfig,
  } from "@milkdown/components/code-block";
  import { defaultKeymap, indentWithTab } from "@codemirror/commands";
  import { languages } from "@codemirror/language-data";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { keymap } from "@codemirror/view";
  import { basicSetup } from "codemirror";

  import {
    $view as viewUtil,
    getMarkdown,
    replaceAll,
  } from "@milkdown/kit/utils";
  import { onMount, afterUpdate, onDestroy } from "svelte";
  import { fly } from "svelte/transition";
  import { quintOut, quadInOut } from "svelte/easing";
  import isValidFilename from "valid-filename";

  import {
    inputRules as createInputRules,
    smartQuotes,
    ellipsis,
    emDash,
    InputRule,
  } from "@milkdown/kit/prose/inputrules";

  import {
    $inputRule as utilInputRule,
    $prose as utilProse,
  } from "@milkdown/kit/utils";

  // Import the original NodeView class we need to extend
  // import { TableBlockView } from "@milkdown/kit/component/table-block";

  import {
    loadNotes,
    userInputCurrentNoteTitle,
    selectedNoteStore,
    handleAutoSaving,
    renameNote,
    updateNoteContent,
    isSwitchingTabs,
  } from "../../../store/Store";

 let CopyTextPopupShow

  function showCopyTextPopup() {
    CopyTextPopupShow = true;
    clearTimeout(popupTimer);
    popupTimer = setTimeout(() => {
      CopyTextPopupShow = false;
    }, 3000);
  }

  class FixedTableNodeView extends TableNodeView {
    stopEvent(e) {
      if (e.type === "drop" || e.type.startsWith("drag")) return true;
      if (e.type === "mousedown" || e.type === "pointerdown") {
        if (e.target instanceof Element && e.target.closest("button"))
          return true;

        const target = e.target;
        if (
          target instanceof HTMLElement &&
          (target.closest("th") || target.closest("td"))
        ) {
          return false;
        }
      }
      return super.stopEvent(e);
    }
  }

  const markdownLink = utilInputRule(
    () =>
      new InputRule(
        // The regex to match markdown links: [text](url)
        /\[(?<text>.+?)]\((?<url>.*?)\)$/,
        (state, match, start, end) => {
          const { tr } = state;
          const { text, url } = match.groups ?? {};

          if (!text) return null; // URL can be empty

          const linkMarkType = state.schema.marks.link;
          if (!linkMarkType) return null;

          const mark = linkMarkType.create({ href: url || "" });
          const textNode = state.schema.text(text, [mark]);

          // This is the transaction that does the replacement
          const transaction = tr.replaceWith(start, end, textNode);

          // --- ✨ THE FIX IS HERE ✨ ---
          // After creating the link, we remove the link mark from the set of "stored" marks.
          // This prevents the next character typed (the space) from also becoming a link.
          return transaction.removeStoredMark(linkMarkType);
        },
      ),
  );

  const FixedTableBlockView = viewUtil(tableSchema.node, (ctx) => {
    return (initialNode, view, getPos) => {
      return new FixedTableNodeView(ctx, initialNode, view, getPos);
    };
  });

  const obsidianLinkPluginKey = new PluginKey("OBSIDIAN_LINK_PLUGIN");

  const rawObsidianLinkPlugin = new Plugin({
    key: obsidianLinkPluginKey,

    state: {
      init: () => ({ unfurledLink: null }),
      apply(tr, value, oldState, newState) {
        // If the transaction has metadata from our plugin, update the state
        const meta = tr.getMeta(obsidianLinkPluginKey);
        if (meta) return meta;
        // If the document changed, we need to map our stored position
        if (tr.docChanged && value.unfurledLink) {
          const mapped = tr.mapping.mapResult(value.unfurledLink.from);
          if (mapped.deleted) return { unfurledLink: null };
          return {
            unfurledLink: { from: mapped.pos, to: value.unfurledLink.to },
          };
        }
        return value;
      },
    },

    appendTransaction: (transactions, oldState, newState) => {
      const selectionChanged = transactions.some((tr) => tr.selectionSet);
      if (!selectionChanged) return null;
      const pluginState = obsidianLinkPluginKey.getState(newState);
      const { from, to } = newState.selection;
      let newTr = newState.tr;
      let modified = false;
      // --- Logic to COLLAPSE a link ---
      if (pluginState?.unfurledLink) {
        const { from: unfurledFrom, to: unfurledTo } = pluginState.unfurledLink;

        if (from < unfurledFrom || to > unfurledTo) {
          const text = oldState.doc.textBetween(unfurledFrom, unfurledTo);
          const match = /\[(?<text>.+?)]\((?<url>.*?)\)/.exec(text);
          if (match?.groups) {
            const { text, url } = match.groups;

            const linkMarkType = newState.schema.marks.link;

            if (linkMarkType && text) {
              const mark = linkMarkType.create({ href: url || "" });

              const textNode = newState.schema.text(text, [mark]);

              newTr.replaceWith(unfurledFrom, unfurledTo, textNode);

              newTr.setMeta(obsidianLinkPluginKey, { unfurledLink: null });

              modified = true;
            }
          }
        }
      }
      // --- Logic to UNFURL a link ---
      if (from === to && !pluginState?.unfurledLink) {
        const $pos = newState.doc.resolve(from);

        const linkMark =
          $pos.marks().find((m) => m.type.name === "link") ||
          (newState.doc.rangeHasMark(
            $pos.pos - 1,

            $pos.pos,

            newState.schema.marks.link,
          ) &&
            $pos

              .marksAcross(newState.doc.resolve($pos.pos - 1))

              ?.find((m) => m.type.name === "link"));

        if (linkMark) {
          // Find the full range of the link mark
          let start = from;
          let end = from;
          while (oldState.doc.rangeHasMark(start - 1, start, linkMark.type)) {
            start--;
          }
          while (oldState.doc.rangeHasMark(end, end + 1, linkMark.type)) {
            end++;
          }
          if (from === start || to === end) {
            const text = newState.doc.textBetween(start, end);

            const url = linkMark.attrs.href;

            const markdownText = `[${text}](${url})`;

            const textNode = newState.schema.text(markdownText);

            newTr.replaceWith(start, end, textNode);

            newTr.setMeta(obsidianLinkPluginKey, {
              unfurledLink: { from: start, to: start + markdownText.length },
            });

            modified = true;
          }
        }
      }

      return modified ? newTr : null;
    },
  });

  const obsidianLinkPlugin = utilProse(() => rawObsidianLinkPlugin);

  const myInputRulesPlugin = createInputRules({
    rules: [markdownLink, ...smartQuotes, ellipsis, emDash],
  });

  import "./Content.css";

  let popupTimer;

  let debounceTimer;

  let isNoteFileNameValidPopupShow = false;
  let isNoteFileNameValid;

  let editorInstance = null;
  let editorContainer;

  const invalidCharacters = ' * " \\\ / < > : | ?';

  const BulletIcon = `<svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 9.5C13.3807 9.5 14.5 10.6193 14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5Z" fill="var(--color-primary)"/>
</svg>`;

  const checkedIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
    <path d="m424-312 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/>
    </svg>`;

  const unCheckedIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Z"/>
    </svg>`;

  const plusIcon = `<svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5 12H19" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 5L12 19" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  const colDragIcon = `<svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Interface / Drag_Horizontal">
<g id="Vector">
<path d="M18 14C17.4477 14 17 14.4477 17 15C17 15.5523 17.4477 16 18 16C18.5523 16 19 15.5523 19 15C19 14.4477 18.5523 14 18 14Z" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 14C11.4477 14 11 14.4477 11 15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15C13 14.4477 12.5523 14 12 14Z" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 14C5.44772 14 5 14.4477 5 15C5 15.5523 5.44772 16 6 16C6.55228 16 7 15.5523 7 15C7 14.4477 6.55228 14 6 14Z" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18 8C17.4477 8 17 8.44772 17 9C17 9.55228 17.4477 10 18 10C18.5523 10 19 9.55228 19 9C19 8.44772 18.5523 8 18 8Z" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 8C11.4477 8 11 8.44772 11 9C11 9.55228 11.4477 10 12 10C12.5523 10 13 9.55228 13 9C13 8.44772 12.5523 8 12 8Z" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 8C5.44772 8 5 8.44772 5 9C5 9.55228 5.44772 10 6 10C6.55228 10 7 9.55228 7 9C7 8.44772 6.55228 8 6 8Z" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</g>
</svg>`;

  const rowDragIcon = `<svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Interface / Drag_Vertical">
<g id="Vector">
<path d="M14 18C14 18.5523 14.4477 19 15 19C15.5523 19 16 18.5523 16 18C16 17.4477 15.5523 17 15 17C14.4477 17 14 17.4477 14 18Z" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 18C8 18.5523 8.44772 19 9 19C9.55228 19 10 18.5523 10 18C10 17.4477 9.55228 17 9 17C8.44772 17 8 17.4477 8 18Z" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 12C14 12.5523 14.4477 13 15 13C15.5523 13 16 12.5523 16 12C16 11.4477 15.5523 11 15 11C14.4477 11 14 11.4477 14 12Z" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 12C8 12.5523 8.44772 13 9 13C9.55228 13 10 12.5523 10 12C10 11.4477 9.55228 11 9 11C8.44772 11 8 11.4477 8 12Z" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 6C14 6.55228 14.4477 7 15 7C15.5523 7 16 6.55228 16 6C16 5.44772 15.5523 5 15 5C14.4477 5 14 5.44772 14 6Z" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 6C8 6.55228 8.44772 7 9 7C9.55228 7 10 6.55228 10 6C10 5.44772 9.55228 5 9 5C8.44772 5 8 5.44772 8 6Z" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</g>
</svg>`;

  const deleteIcon = `<svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 12V17" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 12V17" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4 7H20" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="var(--color-text-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  const leftAlignIcon = `<svg fill="var(--color-text-primary)" width="16px" height="16px" viewBox="0 -2.5 29 29" xmlns="http://www.w3.org/2000/svg">
  <path d="m1.334 2.666h26.665c.011 0 .024.001.037.001.737 0 1.334-.597 1.334-1.334s-.597-1.334-1.334-1.334c-.013 0-.026 0-.039.001h.002-26.665c-.72.021-1.296.61-1.296 1.333s.576 1.312 1.294 1.333h.002z"/>
  <path d="m1.334 7.999h19.555c.011 0 .024.001.037.001.737 0 1.334-.597 1.334-1.334s-.597-1.334-1.334-1.334c-.013 0-.026 0-.039.001h.002-19.555c-.72.021-1.296.61-1.296 1.333s.576 1.312 1.294 1.333h.002z"/>
  <path d="m27.999 10.667h-26.665c-.72.021-1.296.61-1.296 1.333s.576 1.312 1.294 1.333h.002 26.665c.72-.021 1.296-.61 1.296-1.333s-.576-1.312-1.294-1.333z"/>
  <path d="m27.999 21.333h-26.665c-.72.021-1.296.61-1.296 1.333s.576 1.312 1.294 1.333h.002 26.665c.72-.021 1.296-.61 1.296-1.333s-.576-1.312-1.294-1.333z"/><path d="m1.334 18.666h19.555c.72-.021 1.296-.61 1.296-1.333s-.576-1.312-1.294-1.333h-.002-19.555c-.72.021-1.296.61-1.296 1.333s.576 1.312 1.294 1.333z"/>
  </svg>`;

  const centerAlignIcon = `<svg fill="var(--color-text-primary)" width="16px" height="16px" viewBox="0 -2.5 29 29" xmlns="http://www.w3.org/2000/svg">
    <path d="m1.334 2.666h26.665c.011 0 .024.001.037.001.737 0 1.334-.597 1.334-1.334s-.597-1.334-1.334-1.334c-.013 0-.026 0-.039.001h.002-26.665c-.72.021-1.296.61-1.296 1.333s.576 1.312 1.294 1.333h.002z"/>
    <path d="m4.889 5.333c-.011 0-.024-.001-.037-.001-.737 0-1.334.597-1.334 1.334s.597 1.334 1.334 1.334c.013 0 .026 0 .039-.001h-.002 19.555c.72-.021 1.296-.61 1.296-1.333s-.576-1.312-1.294-1.333h-.002z"/>
    <path d="m27.999 10.667h-26.665c-.72.021-1.296.61-1.296 1.333s.576 1.312 1.294 1.333h.002 26.665c.72-.021 1.296-.61 1.296-1.333s-.576-1.312-1.294-1.333z"/>
    <path d="m27.999 21.333h-26.665c-.72.021-1.296.61-1.296 1.333s.576 1.312 1.294 1.333h.002 26.665c.72-.021 1.296-.61 1.296-1.333s-.576-1.312-1.294-1.333z"/>
    <path d="m24.444 18.666c.72-.021 1.296-.61 1.296-1.333s-.576-1.312-1.294-1.333h-.002-19.555c-.72.021-1.296.61-1.296 1.333s.576 1.312 1.294 1.333h.002z"/>
    </svg>`;

  const rightAlignIcon = `<svg fill="var(--color-text-primary)" width="16px" height="16px" viewBox="0 -2.5 29 29" xmlns="http://www.w3.org/2000/svg">
    <path d="m27.999 21.333h-26.665c-.72.021-1.296.61-1.296 1.333s.576 1.312 1.294 1.333h.002 26.665c.72-.021 1.296-.61 1.296-1.333s-.576-1.312-1.294-1.333z"/>
    <path d="m27.999 16h-19.555c-.72.021-1.296.61-1.296 1.333s.576 1.312 1.294 1.333h.002 19.555c.72-.021 1.296-.61 1.296-1.333s-.576-1.312-1.294-1.333z"/>
    <path d="m27.999 10.667h-26.665c-.72.021-1.296.61-1.296 1.333s.576 1.312 1.294 1.333h.002 26.665c.72-.021 1.296-.61 1.296-1.333s-.576-1.312-1.294-1.333z"/>
    <path d="m1.334 2.666h26.665c.011 0 .024.001.037.001.737 0 1.334-.597 1.334-1.334s-.597-1.334-1.334-1.334c-.013 0-.026 0-.039.001h.002-26.665c-.72.021-1.296.61-1.296 1.333s.576 1.312 1.294 1.333h.002z"/>
    <path d="m27.999 5.333h-19.555c-.011 0-.024-.001-.037-.001-.737 0-1.334.597-1.334 1.334s.597 1.334 1.334 1.334c.013 0 .026 0 .039-.001h-.002 19.555c.72-.021 1.296-.61 1.296-1.333s-.576-1.312-1.294-1.333z"/>
    </svg>`;

  const caretDownIcon = `<svg fill="var(--color-text-primary)" width="16px" height="16px" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg">
  <path d="M128,188a11.96187,11.96187,0,0,1-8.48535-3.51465l-80-80a12.0001,12.0001,0,0,1,16.9707-16.9707L128,159.0293l71.51465-71.51465a12.0001,12.0001,0,0,1,16.9707,16.9707l-80,80A11.96187,11.96187,0,0,1,128,188Z"/>

</svg>`;

  const copyIcon = `<svg width="16px" height="16px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16 12.9V17.1C16 20.6 14.6 22 11.1 22H6.9C3.4 22 2 20.6 2 17.1V12.9C2 9.4 3.4 8 6.9 8H11.1C14.6 8 16 9.4 16 12.9Z" stroke="var(--color-text-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M22 6.9V11.1C22 14.6 20.6 16 17.1 16H16V12.9C16 9.4 14.6 8 11.1 8H8V6.9C8 3.4 9.4 2 12.9 2H17.1C20.6 2 22 3.4 22 6.9Z" stroke="var(--color-text-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  onMount(() => {
    const makeEditor = async () => {
      const editor = await Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, editorContainer);
          ctx.set(defaultValueCtx, "");
          ctx.set(indentConfig.key, {
            type: "space",
            size: 4,
          });
          ctx.set(listItemBlockConfig.key, {
            renderLabel: ({ label, listType, checked, readonly }) => {
              if (checked == null) {
                console.log("no checked");
                if (listType === "bullet")
                  return `<span class="label">${BulletIcon}</span>`;

                return `<span class="label">${label}</span>`;
              }
              if (checked)
                return `<span class="label checkbox${readonly ? " readonly" : ""}">${checkedIcon}</span>`;

              return `<span class="label checkbox${readonly ? " readonly" : ""}">${unCheckedIcon}</span>`;
            },
          });
          ctx.update(tableBlockConfig.key, (defaultConfig) => ({
            ...defaultConfig,
            renderButton: (renderType) => {
              switch (renderType) {
                case "add_row":
                  return `${plusIcon}`;
                case "add_col":
                  return `${plusIcon}`;
                case "delete_row":
                  return `${deleteIcon}`;
                case "delete_col":
                  return `${deleteIcon}`;
                case "align_col_left":
                  return `${leftAlignIcon}`;
                case "align_col_center":
                  return `${centerAlignIcon}`;
                case "align_col_right":
                  return `${rightAlignIcon}`;
                case "col_drag_handle":
                  return `${colDragIcon}`;
                case "row_drag_handle":
                  return `${rowDragIcon}`;
              }
            },
          }));
          ctx.update(codeBlockConfig.key, (defaultConfig) => ({
            ...defaultConfig,
            expandIcon: `${caretDownIcon}`,
            copyIcon: `${copyIcon}`,
            copyText: "Copy",
            languages,
            onCopy: (text) => {
              showCopyTextPopup()
            },
            extensions: [
              basicSetup,
              oneDark,
              keymap.of(defaultKeymap.concat(indentWithTab)),
            ],
            renderLanguage: (language, selected) =>
              selected ? `✔ ${language}` : language,
          }));
          ctx.get(listenerCtx).updated((ctx, doc, prevDoc) => {
            if (doc.content.eq(prevDoc.content)) {
              return;
            }
            const markdown = editorInstance.action(getMarkdown());
            updateNoteContent(markdown);
            handleAutoSaving(markdown);
          });
        })
        .use(commonmark)
        .use(markdownLink)
        .use(gfm)
        .use(obsidianLinkPlugin)
        .use(history)
        .use(clipboard)
        .use(indent)
        .use(listener)
        .use(listItemBlockComponent)
        .use([tableBlockConfig, FixedTableBlockView])
        .use(codeBlockComponent)

        .create();

      editorInstance = editor;
    };
    makeEditor();

    if (editorContainer) {
      editorContainer.addEventListener("click", (event) => {
        const target = event.target;
        // Check if it's an anchor tag (<a>) with an 'href' attribute
        if (
          target instanceof HTMLElement &&
          target.tagName === "A" &&
          target.hasAttribute("href")
        ) {
          const href = target.getAttribute("href");
          console.log("HREF", href);
          event.preventDefault();
          if (
            href &&
            (href.startsWith("http://") || href.startsWith("https://"))
          ) {
            window.main.openLink(href);
          } else {
            console.log("invalid protocol");
          }
        }
      });
    }
  });

  afterUpdate(() => {
    if (editorInstance && $selectedNoteStore) {
      const currentMarkdown = editorInstance.action(getMarkdown());
      if (currentMarkdown !== $selectedNoteStore.content) {
        editorInstance.action(replaceAll($selectedNoteStore.content || ""));
      }
    }
  });

  $: if (
    $userInputCurrentNoteTitle &&
    $selectedNoteStore &&
    !$isSwitchingTabs
  ) {
    if ($userInputCurrentNoteTitle !== $selectedNoteStore.title) {
      if (isValidFilename($userInputCurrentNoteTitle)) {
        isNoteFileNameValid = true;
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
          renameNote();
        }, 1500);
      } else {
        isNoteFileNameValid = false;
        showInvalidNotebookNamePopup();
      }
    }
  }

  function handleTitleBlur() {
    if ($isSwitchingTabs) return;

    clearTimeout(debounceTimer);
    renameNote();
  }

  function handleTitleKeydown(event) {
    if (event.key === "Enter") {
      event.preventDefault();

      if ($userInputCurrentNoteTitle === "") {
        userInputCurrentNoteTitle.set($selectedNoteStore.title);
      }
    }
  }

  function showInvalidNotebookNamePopup() {
    isNoteFileNameValidPopupShow = true;
    clearTimeout(popupTimer);
    popupTimer = setTimeout(() => {
      isNoteFileNameValidPopupShow = false;
    }, 500);
  }

  onDestroy(() => {
    if (editorInstance) {
      editorInstance.destroy();
    }
  });
</script>

<div
  class="p-8 flex flex-col mx-auto items-start content-container h-screen overflow-y-auto overflow-x-hidden  mt-10
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar]:mt-10
  [&::-webkit-scrollbar-track]:bg-transparent
[&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-transparent
dark:[&::-webkit-scrollbar-thumb]:bg-background-nav
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-thumb]:rounded-full"
>
  <div class="note-title-container">
    <div
      class=" note-title text-4xl outline-none font-bold"
      tabindex="-1"
      onkeydown={handleTitleKeydown}
      onblur={handleTitleBlur}
      contenteditable="true"
      role="none"
      bind:textContent={$userInputCurrentNoteTitle}
    ></div>
    {#if isNoteFileNameValidPopupShow === true}
      <div
        class="invalid-directory relative p-2 w-fit text-sm mx-auto rounded-lg bg-background-error shadow-lg"
        in:fly={{ y: "100%", duration: 150, easing: quadInOut }}
        out:fly={{ y: "100%", duration: 150, easing: quadInOut }}
      >
        File name can not contain any of these characters: {invalidCharacters}
      </div>
    {/if}
    {#if CopyTextPopupShow === true}
      <div
        class="invalid-directory absolute top-12 right-4 p-2 text-sm rounded-lg bg-background-code-block shadow-lg"
        in:fly={{ x: "100%", duration: 250, easing: quadInOut }}
        out:fly={{ x: "100%", duration: 250, easing: quadInOut }}
      >
        Text Copied
      </div>
    {/if}
  </div>

  <div
    bind:this={editorContainer}
    class="  editor-container relative max-w-[700px] h-screen"
  ></div>
</div>
