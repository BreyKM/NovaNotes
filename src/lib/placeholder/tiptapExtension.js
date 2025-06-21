import { CodeBlock } from '@tiptap/extension-code-block'
import { SvelteNodeViewRenderer } from 'svelte-tiptap'

import CodeBlockView from '../Components/Content/CodeBlockView.svelte'

export const CopyCodeExtension = CodeBlock.extend({
    name: 'codeBlock',

    addNodeView() {
        return SvelteNodeViewRenderer(CodeBlockView)
    }
})

