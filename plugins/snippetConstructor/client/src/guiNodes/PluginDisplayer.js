#lx:require -R PluginDisplayer/;

let _showSnippets = true;

#lx:namespace lxsc.gui;
class PluginDisplayer extends lx.GuiNode {
    get box() { return this.getWidget(); }

    setPlugin(pluginName) {
        this.box->>pluginName.html(pluginName)
    }

    setSnippetsList(list) {
        let tree = lx.Tree.createFromObject(list);
        this.box->>snippetsTree.setData(tree);
    }

    init() {
        // Кнопки актуализации выбранного сниппета
        this.actualSnippetButs = #lx:model { save:{default:0}, reset:{default:0} };
        this.getSaveSnippetButton().setField('save', function (val) { this.disabled(!val); });
        this.getResetSnippetButton().setField('reset', function (val) { this.disabled(!val); });
        this.actualSnippetButs.bind(this.getWidget()->>actualSnippetButs);

        // Структура выбранного сниппета
        this.contentTreeDisplayer = new ContentTreeDisplayer(this);
        this.blocksTreeDisplayer = new BlocksTreeDisplayer(this);
    }

    initHandlers() {
        const widget = this.getWidget();

        // Выбор редактируемого плагина
        widget->>pluginChanger.click(()=>{
            ^Respondent.getPluginsList().then(
                res=>this.getGuiNode('pluginSelector').open(res.data)
            );
        });

        // Переключение отображения дерева сниппетов
        widget->>snippetsLabel.click(()=>{
            _showSnippets = !_showSnippets;
            widget->>snippetsLabel.text('Snippets ' + (_showSnippets ? '&#9650;' : '&#9660;'));
            widget->>snippetsWrapper.style('display', _showSnippets ? null : 'none');
        });

        // Дерево сниппетов выбранного плагина
        const snippetsTree = widget->>snippetsTree;
        snippetsTree.setLeafsRight(snippetsTree.step);
        snippetsTree.setLeafConstructor(leaf=>{
            let node = leaf.node;
            leaf->label.text(node.data.value || node.data.key);
            if (node.data.value) {
                leaf->label.style('cursor', 'pointer');
                leaf->label.click(() => {
                    let snippetPath = node.root.data.key + '/' + node.data.value;
                    this.getPlugin().core.loadSnippet(snippetPath);
                });
            }
        });

        // Кнопки актуализации выбранного сниппета
        this.getSaveSnippetButton().click(()=>{
            const snippetInfo = this.getCore().getSelectedSnippetInfo(),
                pluginName = snippetInfo.pluginName,
                snippetPath = snippetInfo.snippetPath,
                map = snippetInfo.content.toMap();
            ^Respondent.saveSnippet(pluginName, snippetPath, map).then(res=>{
                //TODO if (!res.success)
                snippetInfo.resetChanged();
                snippetInfo.actualize(res.data);
            });
        });
        this.getResetSnippetButton().click(()=>{
            const snippetInfo = this.getCore().getSelectedSnippetInfo(),
                pluginName = snippetInfo.pluginName,
                snippetPath = snippetInfo.snippetPath;
            ^Respondent.getSnippetData(pluginName, snippetPath).then(res=>{
                //TODO if (!res.success)
                snippetInfo.resetChanged();
                snippetInfo.actualize(res.data);
            });
        });
    }

    subscribeEvents() {
        const plugin = this.getPlugin();
        plugin.on('e-pluginSelected', event=>{
            this.setPlugin(event.data.pluginName);
            this.setSnippetsList(event.data.pluginData);
        });
        plugin.on('e-snippetSelected',event=>
            __actualizeSnippet(this, this.getCore().getSnippetInfo(
                event.data.selectedPlugin,
                event.data.selectedSnippet
            ))
        );
        plugin.on('e-snippetActualized', event=>{
            let contentOpenedInfo = this.getContentTree().getOpenedInfo(),
                blocksOpenedInfo = this.getBlocksTree().getOpenedInfo();
            __actualizeSnippet(this, event.data.snippetInfo);
            this.getContentTree().useOpenedInfo(contentOpenedInfo);
            this.getBlocksTree().useOpenedInfo(blocksOpenedInfo);
        });
        plugin.on('e-contentTreeNodeSelected', event=>__actualizeLeafCss(this, event.data.node, true));
        plugin.on('e-contentTreeNodeUpdated', event=>__actualizeLeafCss(this, event.data.node, true));
        plugin.on('e-contentTreeNodeUnselected', event=>__actualizeLeafCss(this, event.data.node, false));
    }

    getContentTree() {
        return this.getWidget()->>contentTree;
    }

    getBlocksTree() {
        return this.getWidget()->>blocksTree;
    }

    getSaveSnippetButton() {
        return this.getWidget()->>butSaveSnippet;
    }

    getResetSnippetButton() {
        return this.getWidget()->>butResetSnippet;
    }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * PRIVATE
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function __actualizeLeafCss(self, node, add) {
    const leaf = __getLeafByNode(self, node);
    if (!leaf) return;
    add
        ? leaf->label.addClass('lxsc-tree-list-selected')
        : leaf->label.removeClass('lxsc-tree-list-selected');
}

function __getLeafByNode(self, node) {
    const treeBox = self.getContentTree();
    let leaf = null;
    treeBox.leafs().forEach(function (iLeaf) {
        if (iLeaf.node === node) {
            leaf = iLeaf;
            this.stop();
        }
    });
    return leaf;
}

function __actualizeSnippet(self, snippetInfo) {
    self.getContentTree().setData(snippetInfo.content.getRoot());
    self.getBlocksTree().setData(snippetInfo.content.getBlocks());
    if (snippetInfo.isChanged()) {
        self.actualSnippetButs.save = 1;
        self.actualSnippetButs.reset = 1;
    } else {
        self.actualSnippetButs.save = 0;
        self.actualSnippetButs.reset = 0;
    }
}
