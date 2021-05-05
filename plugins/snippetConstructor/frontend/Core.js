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
			lx.Tost.error(res.message);
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
			lx.Tost.error(res.message);
			return;
		}

		this.selectedSnippet = event.data.snippetPath;
		__processSnippetData(this, res.data);
	});
}

function __processSnippetData(self, data) {
	console.log(data);

	var need = lx.dependencies.defineNecessaryModules(data.dependencies.modules);
	if (need.lxEmpty) {
		__renderSnippet(self, data.code, data.tree);
	} else {
		var modulesRequest = new lx.ServiceRequest('get-modules', need);
		modulesRequest.send().then(res=>{
			if (!res) return;
			lx.createAndCallFunction('', res);
			lx.dependencies.depend({
				modules: need
			});
			__renderSnippet(self, data.code, data.tree);
		});
	}
}

function __renderSnippet(self, code, tree) {
	var snippetBox = new lx.ActiveBox({
		geom: true,
		header: self.selectedPlugin + ' - ' + self.selectedSnippet,
		closeButton: true
	});



	// var b = snippetBox.add(lx.Box, {geom:[10,10,40,40],style:{fill:'red'}});
	// var c = b.add(lx.Box, {geom:[10,10,40,40],style:{fill:'green'}});
	// var ee = snippetBox.getChildren(true);
	// console.log(ee);

	snippetBox.begin();
	lx.createAndCallFunction(code);
	snippetBox.end();
}

