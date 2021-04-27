/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.ActiveBox;

#lx:require Core;
#lx:require -R gui/;
#lx:require -R src/;

Plugin.core = new lxsc.Core(Plugin, {
	widgets: {
		mainMenu: new lxsc.gui.MainMenu(Plugin, Snippet->>menu),
		pluginSelector: new lxsc.gui.PluginSelector(Plugin, Snippet->>pluginSelector)
	}
});



//!!!
//TODO баг - если предварительно не открыть три-виджет, будет хрень с отображением дерева
Plugin.root.child(0).open();
Plugin.core.trigger('e-pluginSelected', {pluginName:'lx/help:test'});




// var ab = new lx.ActiveBox({
// 	header: 'Some snippet',
// 	geom: true
// });
// var box = ab.add(lx.Box, {
// 	geom: true
// });

// var elem = new lxsc.Element(box);
// elem.setGrid();





