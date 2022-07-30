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
}
