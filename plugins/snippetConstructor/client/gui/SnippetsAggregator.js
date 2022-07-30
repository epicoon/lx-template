#lx:namespace lxsc.gui;
class SnippetsAggregator extends lx.GuiNode {
    init() {
        this.selected = null;
        this.snippetDisplayers = {};
    }

    initHandlers() {
        this.getWidget()->>snippetLabelsWrapper.move();
    }

    subscribeEvents() {
        this.getPlugin().on(
            'e-snippetAdded',
            event=>{
                const snippetInfo = event.data.snippetInfo;
                this.snippetDisplayers[snippetInfo.getKey()] = new lxsc.SnippetDisplayer(
                    snippetInfo,
                    this.getWidget()->>snippetLabels,
                    this.getWidget()->>snippets
                );
            }
        );
        this.getPlugin().on(
            'e-snippetSelected',
            event=>this.select(event.data.selectedPlugin, event.data.selectedSnippet)
        );
    }

    select(pluginName, snippetPath) {
        this.unselect();
        const key = this.getCore().getSnippetKey(pluginName, snippetPath);
        this.selected = this.snippetDisplayers[key];
        this.selected.on();
    }

    unselect() {
        if (!this.selected) return;
        this.selected.off();
        this.selected = null;
    }
}
