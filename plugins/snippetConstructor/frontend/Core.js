#lx:private;

#lx:require -R gui/;

class Core #lx:namespace lxsc {
	constructor(plugin) {
		this.plugin = plugin;
		this.selectedPlugin = null;
		this.selectedSnippet = null;

		this.renderer = new lxsc.gui.GuiRenderer();

		__initWidgets(this);
		__initEventListeners(this);
	}

	trigger(eventName, data) {
		this.plugin.trigger(eventName, data);
	}
}


/***********************************************************************************************************************
 * CORE EVENTS
 **********************************************************************************************************************/

function __initWidgets(self) {
	self.widgets = {
		mainMenu: new lxsc.gui.MainMenu(self.plugin, self.plugin->>menu),
		pluginSelector: new lxsc.gui.PluginSelector(self.plugin, self.plugin->>pluginSelector)
	};
}

function __initEventListeners(self) {
	self.plugin.on('e-pluginSelected', __onPluginSelected.bind(self));
	self.plugin.on('e-snippetSelected', __onSnippetSelected.bind(self));
}

function __onPluginSelected(event) {
	^Respondent.getPluginData(event.data.pluginName).then(res=>{
		if (res.success === false) {
			lx.Tost.error(res.data);
			return;
		}
		
		this.selectedPlugin = event.data.pluginName;
		this.widgets.mainMenu.setPlugin(event.data.pluginName);
		this.widgets.mainMenu.setSnippetsList(res.data);
	});
}

function __onSnippetSelected(event) {
	^Respondent.getSnippetData(this.selectedPlugin, event.data.snippetPath).then(res=>{
		if (res.success === false) {
			lx.Tost.error(res.data);
			return;
		}

		this.selectedSnippet = event.data.snippetPath;
		__processSnippetData(this, res.data);
	});
}

function __processSnippetData(self, data) {
	console.log('__processSnippetData');
	console.log(data);

	lx.dependencies.promiseModules(
		data.dependencies.modules || [],
		()=>__renderSnippet(self, data.code, data.tree)
	)
}

function __renderSnippet(self, code, tree) {
	var header = self.selectedPlugin + ' - ' + self.selectedSnippet;
	var boxes = self.renderer.getSnippetBox(header);

	boxes.snippetBox->>workField.begin();
	lx._f.createAndCallFunction(code);
	boxes.snippetBox->>workField.end();



	console.log('__renderSnippet');
	console.log(tree);


	lx.Tree.uCreateFromObject(
		tree.root,
		'children',
		function(obj, node) {

			console.log(obj, node);

		}
	);




}
