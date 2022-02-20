let _showSnippets = true;

class PluginDisplayer extends lx.GuiNode #lx:namespace lxsc.gui {
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
        this.box->>contentTree.setLeafConstructor(leaf=>{

            leaf->label.text( leaf.node.data.type );
            leaf->label.click(()=>{
                console.log( leaf.node );
            });
            leaf->label.on('mouseover', e=>{
                if (e.target !== leaf->label.getDomElem()) return;

                console.log('mouseover');
                console.log(e);
                console.log(e.target);
                e.stopPropagation();
                this.getPlugin().trigger('e-widgetOver', {node: leaf.node})
            });
            leaf->label.on('mouseout', e=>{
                if (e.target !== leaf->label.getDomElem()) return;

                console.log('mouseout');
                console.log(e.target);
                e.stopPropagation();
                this.getPlugin().trigger('e-widgetOut', {node: leaf.node})
            });
        });
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

    console.log(snippetInfo);

    const tree = lx.Tree.uCreateFromObject(
        snippetInfo.content.root,
    	'children',
    	(obj, node) => node.data = obj
    );

    console.log(tree);

    self.box->>contentTree.setData(tree);
}
