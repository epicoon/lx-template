#lx:public;

class AbstractTreeDisplayer {
    constructor(pluginDisplayer) {
        this.pluginDisplayer = pluginDisplayer;
        this.plugin = pluginDisplayer.getPlugin();
        this.tree = this.findTreeWidget();

        this.tree.setLeafsRight( this.tree.step * 3 + this.tree.leafHeight * 2 );
        this.tree.setLeafRenderer(leaf=>{
            this.setLeafName(leaf);
            leaf->label.align(lx.LEFT, lx.MIDDLE);
            __setHandlers(this, leaf);
            __addButtons(this, leaf);
        });

        const plugin = this.getPlugin();
        this.tree.beforeAddLeaf(parentNode=>{
            this.tree.holdAdding();
            const parentBoxData = parentNode.data,
                content = parentBoxData.getContentMap();

            if (parentNode === content.getBlocks()) {
                lx.InputPopup.open('New block name')
                    .confirm(newBlockName=>
                        __addBoxData(this, parentNode, lxsc.ContentMap.TYPE_ROOT_BLOCK, {name: newBlockName})
                    ).reject(()=>this.tree.breakAdding());
                return;
            }

            plugin.getGuiNode('newBoxDataForm').open(__getBlocksList(parentBoxData))
                .onAddElement(type=>
                    __addBoxData(this, parentNode, lxsc.ContentMap.TYPE_WIDGET, {widget: type})
                ).onAddBlock(name=>
                    __addBoxData(this, parentNode, lxsc.ContentMap.TYPE_BLOCK, {name})
                ).onCancel(()=>this.tree.breakAdding());
        });
    }

    getPlugin() {
        return this.pluginDisplayer.getPlugin();
    }

    getCore() {
        return this.pluginDisplayer.getCore();
    }

    /**
     * @abstract
     */
    findTreeWidget() {
        // pass
    }

    /**
     * @abstract
     */
    getOverEventName() {
        // pass
    }

    /**
     * @abstract
     */
    getOutEventName() {
        // pass
    }

    setLeafName(leaf) {
        const node = leaf.node;
        const nodeData = node.data;
        leaf->label.text(nodeData.getLabel());
    }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * PRIVATE
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function __setHandlers(self, leaf) {
    leaf->label.click(()=>{
        self.plugin.trigger('e-contentTreeNodeSelected', {
            snippetInfo: self.getCore().getSelectedSnippetInfo(),
            node: leaf.node
        });
    });

    leaf.mouseover(()=>self.plugin.trigger(self.getOverEventName(), {node: leaf.node}));
    leaf.mouseout(()=>self.plugin.trigger(self.getOutEventName()));
}

function __addButtons(self, leaf) {
    const plugin = self.getPlugin(),
        nodeData = leaf.node.data;

    if (nodeData.contentIsAllowed()) leaf.createAddButton();
    else leaf.createChild();

    leaf.createButton({css: 'lxsc-tree-but-del', click: ()=>{
        nodeData.del();
        plugin.trigger('e-actualizeSnippet');
    }});
}

function __addBoxData(self, parentNode, type, data) {
    const plugin = self.getPlugin(),
        parentBoxData = parentNode.data,
        content = parentBoxData.getContentMap(),
        boxData = content.createBoxDataBlank(type, data),
        newNode = self.tree.resumeAdding({ data: boxData });
    boxData.node = newNode;
    parentBoxData.addChild(boxData);
    plugin.trigger('e-actualizeSnippet');
}

function __getBlocksList(boxData) {
    let rootBlock = null,
        tempNode = boxData.node;
    while (tempNode && !rootBlock) {
        if (tempNode.data.type === lxsc.ContentMap.TYPE_ROOT_BLOCK) rootBlock = tempNode.data;
        else tempNode = tempNode.root;
    }

    const blocks = boxData.getContentMap().getBlocks();
    if (!rootBlock) {
        let result = [];
        for (let i in blocks.nodes) {
            let node = blocks.nodes[i];
            result.push(node.data.name.match(/<(.+?)>/)[1]);
        }
        return result;
    };

    let result = [];
    for (let i in blocks.nodes) {
        let node = blocks.nodes[i];
        if (node.data === rootBlock) continue;
        let valid = true;
        node.eachNodeRecursive(iNode=>{
            if (iNode.data.name === rootBlock.name)
                valid = false;
        });
        if (!valid) continue;
        result.push(node.data.name.match(/<(.+?)>/)[1]);
    }
    return result;
}
