#lx:public;

class ContentTreeDisplayer extends AbstractTreeDisplayer {
    findTreeWidget() {
        return this.pluginDisplayer.box->>contentTree;
    }
    
    getOverEventName() {
        return 'e-contentTreeOver';
    }
    
    getOutEventName() {
        return 'e-contentTreeOut';
    }
}
