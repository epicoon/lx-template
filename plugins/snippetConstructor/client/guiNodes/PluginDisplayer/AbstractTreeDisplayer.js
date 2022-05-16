#lx:public;

class AbstractTreeDisplayer {
    constructor(pluginDisplayer) {
        this.pluginDisplayer = pluginDisplayer;
        this.plugin = pluginDisplayer.getPlugin();
        this.tree = this.findTreeWidget();
        this.tree.setLeafConstructor(leaf=>{
            this.setLeafName(leaf);
            leaf->label.align(lx.LEFT, lx.MIDDLE);
            this.setHandlers(leaf);
        });
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
            case 'widget':
                name = nodeData.data.widget;
                let key = nodeData.data.var || nodeData.data.key || nodeData.data.field;
                if (key !== null) name += ': ' + key;
                break;
            case 'block':
                let blockName = nodeData.data.name.match(/<(.+?)>/)[1];
                name = 'block: ' + blockName;
                break;
        }
        leaf->label.text(name);
    }

    setHandlers(leaf) {
        leaf->label.click(()=>{
            console.log( leaf.node );
        });

        leaf.mouseover(()=>{
            this.plugin.trigger(this.getOverEventName(), {node: leaf.node});
        });

        leaf.mouseout(()=>{
            this.plugin.trigger(this.getOutEventName());
        });
    }
}
