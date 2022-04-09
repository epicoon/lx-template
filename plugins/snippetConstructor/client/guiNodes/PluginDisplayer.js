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

    initHandlers() {
        // Выбор редактируемого плагина
        this.box->>pluginChanger.click(()=>{
            ^Respondent.getPluginsList().then(
                res=>this.getGuiNode('pluginSelector').open(res.data)
            );
        });

        // Переключение отображения дерева сниппетов
        this.box->>snippetsLabel.click(()=>{
            _showSnippets = !_showSnippets;
            this.box->>snippetsLabel.text('Snippets ' + (_showSnippets ? '&#9650;' : '&#9660;'));
            this.box->>snippetsWrapper.style('display', _showSnippets ? null : 'none');
        });

        // Дерево сниппетов выбранного плагина
        this.box->>snippetsTree.setLeafConstructor(leaf=>{
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

        // Структура выбранного сниппета
        new ContentTreeDisplayer(this);
        new BlocksTreeDisplayer(this);
    }

    subscribeEvents() {
        this.getPlugin().on('e-pluginSelected', event=>{
            this.setPlugin(event.data.pluginName);
            this.setSnippetsList(event.data.pluginData);
        });
        this.getPlugin().on(
            'e-snippetSelected',
            event=>__onSelectSnippet(this, event.data.selectedPlugin, event.data.selectedSnippet)
        );
    }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * PRIVATE
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function __onSelectSnippet(self, selectedPlugin, selectedSnippet) {
    const snippetInfo = self.getPlugin().core.getSnippetInfo(selectedPlugin, selectedSnippet);
    self.box->>contentTree.setData(snippetInfo.content.getRoot());
    self.box->>blocksTree.setData(snippetInfo.content.getBlocks());
}
