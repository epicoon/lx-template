class MainMenu extends lxsc.gui.Widget #lx:namespace lxsc.gui {
	setPlugin(pluginName) {
		this.box->>plugin.text(pluginName)
	}

	setSnippetsList(list) {
		let tree = lx.Tree.createFromObject(list);
		this.box->>snippetsTree.setData(tree);
	}

	initHandlers() {
		// Открытие формы выбора плагина
		this.box->>plugin.click(()=>{
			^Respondent.getPluginsList().then(
				res=>this.getWidget('pluginSelector').open(res)
			);
		});

		// Дерево сниппетов выбранного плагина
		this.box->>snippetsTree.setLeafConstructor(leaf=>{
			let node = leaf.node;
			leaf->label.text(node.data.value || node.data.key);
			if (node.data.value) {
				leaf->label.style('cursor', 'pointer');
				leaf->label.click(() => {
					let snippetPath = node.root.data.key + '/' + node.data.value;
					this.triggerCoreEvent('e-snippetSelected', {snippetPath});
				});
			}
		});
	}
}
