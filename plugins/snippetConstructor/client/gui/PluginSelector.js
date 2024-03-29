#lx:namespace lxsc.gui;
class PluginSelector extends lx.GuiNode {
	get box() { return this.getWidget(); }

	open(data) {
		this.box.show();
		var tree = lx.Tree.createFromObject(data);
		this.box->tree.setTree(tree);
	}

	close() {
		this.box.hide();
	}

	initHandlers() {
		// Закрытие по бэклоку
		this.box->back.click(()=>this.close());

		// Дерево плагинов
		this.box->tree.setLeafRenderer(leaf=>{
			let node = leaf.node;
			leaf->label.text(node.data.value || node.data.key);
			if (node.data.value) {
				leaf->label.style('cursor', 'pointer');
				leaf->label.click(()=>{
					let pluginName = node.root.data.key + ':' + node.data.value;
					this.close();
					this.getPlugin().core.selectPlugin(pluginName);
				});
			}
		});
	}
}
