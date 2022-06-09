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

    addButtons(leaf) {
        const widgetName = leaf.node.data.widget,
            ref = this.getCore().widgetsReference.get(widgetName);

        console.log(leaf.node);
        console.log(widgetName);

        if (!ref || ref.contentIsDisallowed()) leaf.createChild();
        else leaf.createButton({css: 'lxsc-tree-but-add', click: ()=>__addNode(this, leaf.node)});

        leaf.createButton({css: 'lxsc-tree-but-del', click: ()=>__delNode(this, leaf.node)});
    }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * PRIVATE
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function __addNode(self, node) {

    //TODO
    console.log('ADD', node);

}

function __delNode(self, node) {
    node.root.data.removeData(node.data);
    self.getPlugin().trigger('e-actualizeSnippet');
}
