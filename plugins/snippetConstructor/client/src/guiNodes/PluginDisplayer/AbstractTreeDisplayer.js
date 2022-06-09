#lx:public;

class AbstractTreeDisplayer {
    constructor(pluginDisplayer) {
        this.pluginDisplayer = pluginDisplayer;
        this.plugin = pluginDisplayer.getPlugin();
        this.tree = this.findTreeWidget();

        this.tree.setLeafsRight( this.tree.step * 3 + this.tree.leafHeight * 2 );
        this.tree.setLeafConstructor(leaf=>{
            this.setLeafName(leaf);
            leaf->label.align(lx.LEFT, lx.MIDDLE);
            this.setHandlers(leaf);
            this.addButtons(leaf);
        });
    }

    getPlugin() {
        return this.pluginDisplayer.getPlugin();
    }

    getCore() {
        return this.pluginDisplayer.getCore();
    }
    
    findTreeWidget() {
        // abstract
    }

    getOverEventName() {
        // abstract
    }

    getOutEventName() {
        // abstract
    }

    setLeafName(leaf) {
        const node = leaf.node;
        const nodeData = node.data;
        let name = nodeData.type;
        switch (nodeData.type) {
            case lxsc.ContentMap.TYPE_WIDGET:

                //TODO в ContentMap для блоков надо обернуть данные чем-то вроде lxsc.BoxData

                name = nodeData.widget;
                let key = nodeData.key || nodeData.field || nodeData.var;
                if (key !== null) name += ': ' + key;
                break;
            case lxsc.ContentMap.TYPE_BLOCK:

                console.log(nodeData);

                let blockName = nodeData.data.name.match(/<(.+?)>/)[1];
                name = 'block: ' + blockName;
                break;
        }
        leaf->label.text(name);
    }

    setHandlers(leaf) {
        leaf->label.click(()=>{
            this.plugin.trigger('e-contentTreeNodeSelected', {
                snippetInfo: this.getCore().getSelectedSnippetInfo(),
                node: leaf.node
            });
        });

        leaf.mouseover(()=>this.plugin.trigger(this.getOverEventName(), {node: leaf.node}));
        leaf.mouseout(()=>this.plugin.trigger(this.getOutEventName()));
    }
    
    addButtons(leaf) {
        // pass
    }
}
