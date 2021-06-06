#lx:private;

class Core #lx:namespace lxsc {
	constructor(plugin, config) {
		this.plugin = plugin;
		this.widgets = config.widgets;

		this.selectedPlugin = null;
		this.selectedSnippet = null;

		__initEventListeners(this);
	}

	trigger(eventName, data) {
		this.plugin.trigger(eventName, data);
	}
}


/***********************************************************************************************************************
 * CORE EVENTS
 **********************************************************************************************************************/

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

		console.log('__onPluginSelected');
		console.log(res);

		this.selectedPlugin = event.data.pluginName;
		this.widgets.mainMenu.setPlugin(event.data.pluginName);
		this.widgets.mainMenu.setSnippetsList(res.data);
	});
}

function __onSnippetSelected(event) {
	console.log('__onSnippetSelected');	

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
	console.log(data);

	lx.dependencies.promiseModules(
		data.dependencies.modules,
		()=>__renderSnippet(self, data.code, data.tree)
	)
}

function __renderSnippet(self, code, tree) {
	var header = self.selectedPlugin + ' - ' + self.selectedSnippet;
	var boxes = __getSnippetBox(header);

	// var b = snippetBox.add(lx.Box, {geom:[10,10,40,40],style:{fill:'red'}});
	// var c = b.add(lx.Box, {geom:[10,10,40,40],style:{fill:'green'}});
	// var ee = snippetBox.getChildren(true);
	// console.log(ee);


	// boxes.snippetBox.begin();
	// lx.createAndCallFunction(code);
	// boxes.snippetBox.end();
}

#lx:tpl-function __getSnippetBox(header) {
	<lx.ActiveBox:^snippetBox._vol>(header:header,closeButton: true)
		<lx.Box>(geom:[10,10,40,40]).fill('red')
		<lx.Box>(geom:[20,20,40,40]).fill('blue')
		<lx.Box>(geom:[30,30,40,40]).fill('green')
}

