#lx:namespace lxsc;
class Core extends lx.PluginCore {
	init() {
		this.selectedPlugin = null;
		this.selectedSnippet = null;
		this.snippets = {};

		this.widgetHighlighter = new lxsc.WidgetHighlighter(this);
		this.workpanelSelector = new lxsc.WorkpanelSelector(this);
		
		this.widgetsReference = new lxsc.WidgetsReference(this);
		this.positioningStrategiesReference = new lxsc.PositioningStrategiesReference(this);
		__loadReferences(this);
		__subscribeEvents(this);
	}

	selectPlugin(pluginName) {
		^Respondent.getPluginData(pluginName).then(res=>{
			if (res.success === false) {
				lx.tostError(res.data);
				return;
			}

			this.selectedPlugin = pluginName;
			this.plugin.trigger('e-pluginSelected', {pluginName, pluginData: res.data});
		});
	}

	loadSnippet(snippetPath) {
		if (this.getSnippetKey(this.selectedPlugin, snippetPath) in this.snippets) {
			this.selectSnippet(this.selectedPlugin, snippetPath);
			return;
		}

		^Respondent.getSnippetData(this.selectedPlugin, snippetPath).then(res=>{
			if (res.success === false) {
				lx.tostError(res.data);
				return;
			}

			this.getPlugin().trigger('e-beforeChangeSnippet');
			__addSnippet(this, this.selectedPlugin, snippetPath, res.data);
		});
	}

	selectSnippet(pluginName, snippetPath) {
		if (this.selectedPlugin == pluginName && this.selectedSnippet == snippetPath)
			return;
		this.selectedPlugin = pluginName;
		this.selectedSnippet = snippetPath;
		this.plugin.trigger('e-snippetSelected', {
			selectedPlugin: pluginName,
			selectedSnippet: snippetPath
		});
	}

	getSnippetKey(pluginName, snippetPath) {
		return pluginName + '__' + snippetPath;
	}

	getSnippetInfo(pluginName, snippetPath) {
		return this.snippets[this.getSnippetKey(pluginName, snippetPath)];
	}
	
	getSelectedSnippetInfo() {
		if (!this.selectedPlugin || !this.selectedSnippet) return null;
		return this.getSnippetInfo(this.selectedPlugin, this.selectedSnippet);
	}
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * PRIVATE
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function __addSnippet(self, pluginName, snippetPath, snippetData) {
	let snippetKey = self.getSnippetKey(pluginName, snippetPath),
		snippetInfo = new lxsc.SnippetInfo(self, pluginName, snippetPath);
	self.snippets[snippetKey] = snippetInfo;
	snippetInfo.actualize(snippetData, ()=>{
		self.plugin.trigger('e-snippetAdded', {snippetInfo});
		self.selectSnippet(pluginName, snippetPath);
	});
}

function __loadReferences(self) {
	^Respondent.loadReferences().then(res=>{
		self.widgetsReference.setData(res.data.widgetsReference);
		self.positioningStrategiesReference.setData(res.data.positioningStrategies);
		self.getPlugin().trigger('e-referencesLoaded');
	});
}

function __subscribeEvents(self) {
	const plugin = self.getPlugin();

	plugin.on('e-actualizeSnippet', e=>{
		const snippetInfo = e.data.snippetInfo || self.getSelectedSnippetInfo(),
			callback = e.data.callback || null,
			pluginName = snippetInfo.pluginName,
			snippetPath = snippetInfo.snippetPath,
			map = snippetInfo.content.toMap();
		^Respondent.actualizeSnippet(pluginName, snippetPath, map).then(res=>{
			//TODO if (!res.success)
			snippetInfo.setChanged();
			snippetInfo.actualize(res.data);
			if (callback) callback();
		});
	});
}
