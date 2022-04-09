#lx:public;

class BlocksTreeDisplayer extends AbstractTreeDisplayer {
    findTreeWidget() {
        return this.pluginDisplayer.box->>blocksTree;
    }

    getOverEventName() {
        return 'e-blockTreeOver';
    }

    getOutEventName() {
        return 'e-blockTreeOut';
    }

    setLeafName(leaf) {
        const node = leaf.node;
        const nodeData = node.data;
        if (nodeData.type == lxsc.ContentMap.TYPE_ROOT_BLOCK) {
            let name = nodeData.name.match(/<(.+?)>/)[1];
            leaf->label.text(name);
        } else {
            super.setLeafName(leaf);
        }
    }
}
