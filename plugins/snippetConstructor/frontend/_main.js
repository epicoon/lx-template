/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.ActiveBox;

#lx:require -R src/;

/*
1. Сначала выбрать плагин, только потом строить сниппет
*/

const menu = Snippet->>menu;
const pluginSelector = Snippet->>pluginSelector;
const snippetsTreeBox = Snippet->>snippetsTree;


// Не самое красивое доопределение виджета
// menu~>pult->resizer.move({
// 	parentResize: true,
// 	xLimit: false,
// 	yLimit: false
// });
menu.parent.parent.size('400px', '250px');

menu->>plugin.click(()=>{
	^Respondent.getPluginsList().then(res=>pluginSelector.open(res));
});


pluginSelector.open = function(data) {
	this.show();

	// var tree = new lx.Tree('a', 'b', 'c', 'a/a');
	// pluginSelector.show();
	// pluginSelector->tree.setData(tree);
	console.log(data);

	var tree = lx.Tree.createFromObject(data);
	this->tree.setData(tree);

	console.log(tree);
};

pluginSelector->tree.setLeafConstructor(function(leaf) {
	let node = leaf.node;
	leaf->label.text(node.data.value || node.data.key);
	if (node.data.value) {
		leaf->label.style('cursor', 'pointer');
		leaf->label.click(()=>{
			let pluginName = node.root.data.key + ':' + node.data.value;
			pluginSelector.hide();
			Plugin.trigger('e-pluginSelected', {pluginName});
		});
	}
});

snippetsTreeBox.setLeafConstructor(function(leaf) {
	let node = leaf.node;
	leaf->label.text(node.data.value || node.data.key);
	if (node.data.value) {
		leaf->label.style('cursor', 'pointer');
		leaf->label.click(() => {
			let snippetPath = node.root.data.key + '/' + node.data.value;
			Plugin.trigger('e-snippetSelected', {snippetPath});
		});
	}
});


Plugin.on('e-pluginSelected', function(event) {
	^Respondent.getPluginData(event.data.pluginName).then(res=>{
		if (res.success === false) {
			lx.Tost.error(res.message);
			return;
		}

		menu->>plugin.text(event.data.pluginName);
		let tree = lx.Tree.createFromObject(res.data);
		snippetsTreeBox.setData(tree);
	});
});

Plugin.on('e-snippetSelected', function(event) {

	console.log(event);

});









// var ab = new lx.ActiveBox({
// 	header: 'Some snippet',
// 	geom: true
// });
// var box = ab.add(lx.Box, {
// 	geom: true
// });

// var elem = new lxsc.Element(box);
// elem.setGrid();





