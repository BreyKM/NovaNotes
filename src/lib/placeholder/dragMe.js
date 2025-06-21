/** @type {import('svelte/action').Action}  */
export const onDrag = (node, params) => {
  let dragStart = null;
  let currentParams = params;


  const attr = currentParams.orientation === 'vertical' ? 'screenX' : 'screenY';

  const mouseMoveHandler = (e) => {
    if (dragStart !== null) {
      const initialWidth = currentParams.initialWidth;
      const delta = e[attr] - dragStart;
      node.dispatchEvent(new CustomEvent('drag', { detail: { delta, initialWidth } }));
    }
  };
  
  const mouseUpAction = () => {
    dragStart = null;
    node.dispatchEvent(new CustomEvent('dragEnd'));

 
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpAction);
  };
  
  const mouseDownAction = (e) => {
    e.preventDefault();
    dragStart = e[attr];
    node.dispatchEvent(new CustomEvent('dragStart', { detail: { x: e.screenX, y: e.screenY } }));


    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpAction);
  };

  node.addEventListener('mousedown', mouseDownAction);

  return {
    update(newParams) {
      currentParams = newParams;
    },

    destroy() {
      node.removeEventListener('mousedown', mouseDownAction);
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpAction);
    }
  };
};