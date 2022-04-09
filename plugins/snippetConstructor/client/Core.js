#lx:require dataStructures/;
#lx:require guiNodes/;
#lx:require -R guiTools/;

#lx:namespace lxsc;
class Core {
	constructor(plugin) {
		this.plugin = plugin;
		this.selectedPlugin = null;
		this.selectedSnippet = null;
		this.snippets = {};

		this.renderer = new lxsc.gui.GuiRenderer();

		this.plugin.initGuiNodes({
			pluginDisplayer: lxsc.gui.PluginDisplayer,
			pluginSelector: lxsc.gui.PluginSelector,
			snippetsAgregator: lxsc.gui.SnippetsAgregator
		});

		this.widgetHighlighter = new lxsc.gui.WidgetHighlighter(this);
	}

	trigger(eventName, data) {
		this.plugin.trigger(eventName, data);
	}
	
	selectPlugin(pluginName) {
		^Respondent.getPluginData(pluginName).then(res=>{
			if (res.success === false) {
				lx.Tost.error(res.data);
				return;
			}

			this.selectedPlugin = pluginName;
			this.trigger('e-pluginSelected', {pluginName, pluginData: res.data});
		});
	}

	loadSnippet(snippetPath) {
		if (this.getSnippetKey(this.selectedPlugin, snippetPath) in this.snippets) {
			this.selectSnippet(this.selectedPlugin, snippetPath);
			return;
		}

		^Respondent.getSnippetData(this.selectedPlugin, snippetPath).then(res=>{
			if (res.success === false) {
				lx.Tost.error(res.data);
				return;
			}

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
	lx.dependencies.promiseModules(
		snippetData.dependencies.modules || [],
		()=>{
			let snippetKey = self.getSnippetKey(pluginName, snippetPath);
			self.snippets[snippetKey] = {
				plugin: pluginName,
				snippet: snippetPath,
				content: new lxsc.ContentMap(snippetData.tree)
			};
			self.plugin.trigger('e-snippetAdded', {
				snippetKey,
				snippetCode: snippetData.code,
				images: snippetData.images
			});
			self.selectSnippet(pluginName, snippetPath);
		}
	)
}
