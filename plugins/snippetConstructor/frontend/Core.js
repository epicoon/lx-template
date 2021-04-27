#lx:private;

class Core #lx:namespace lxsc {
	constructor(plugin, config) {
		this.plugin = plugin;
		this.widgets = config.widgets;

		this.selectedPluginName = null;

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

		this.selectedPluginName = event.data.pluginName;
		this.widgets.mainMenu.setPlugin(event.data.pluginName);
		this.widgets.mainMenu.setSnippetsList(res.data);
	});
}

function __onSnippetSelected(event) {
	console.log('__onSnippetSelected');	
	console.log(this.selectedPluginName);
	console.log(event.data);

	^Respondent.getSnippetData(this.selectedPluginName, event.data.snippetPath).then(res=>{
		if (res.success === false) {
			lx.Tost.error(res.message);
			return;
		}


		console.log(res);


	});
}
