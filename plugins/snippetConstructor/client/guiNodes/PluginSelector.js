class PluginSelector extends lx.GuiNode #lx:namespace lxsc.gui {
	get box() { return this.getWidget(); }

	open(data) {
		this.box.show();
		var tree = lx.Tree.createFromObject(data);
		this.box->tree.setData(tree);
	}

	close() {
		this.box.hide();
	}

	initHandlers() {
		// Закрытие по бэклоку
		this.box->back.click(()=>this.close());

		// Дерево плагинов
		this.box->tree.setLeafConstructor(leaf=>{
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
