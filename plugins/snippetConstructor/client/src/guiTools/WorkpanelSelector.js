#lx:namespace lxsc;
class WorkpanelSelector {
    #lx:const
        CONTENT_NODE = 'contentNode';

    constructor(core) {
        this.core = core;
        this.subscribeEvents();

        this.selected = null;
        this.currentDesk = null;
    }

    subscribeEvents() {
        const plugin = this.core.getPlugin();

        plugin.on('e-contentTreeNodeSelected', e=>{
            const snippetInfo = e.data.snippetInfo,
                boxesData = e.data.node.data;
            if (boxesData.type != lxsc.ContentMap.TYPE_WIDGET) return;
            __select(this, self::CONTENT_NODE, {
                snippetInfo,
                node: e.data.node
            });
        });
        
    }
}

/**
 * @private
 * @param {lxsc.WorkpanelSelector} self
 * @param {String} selectedType
 * @param {Object} params
 */
function __select(self, selectedType, params) {
    if (self.selected)
        self.selected.unselect();
    if (self.currentDesk)
        self.currentDesk.hide();
    self.selected = __createSelected(self, selectedType, params);
    self.currentDesk = self.core.getGuiNode(__getDeskKey(selectedType)).getWidget();
    self.currentDesk.show();
    self.selected.bind(self.currentDesk);
}

/**
 * @private
 * @param {lxsc.WorkpanelSelector} self
 * @param {String} selectedType
 * @param {Object} params
 * @returns {lxsc.AbstractSelected}
 */
function __createSelected(self, selectedType, params) {
    switch (selectedType) {
        case lxsc.WorkpanelSelector.CONTENT_NODE: return new lxsc.ContentNodeSelected(self, params);
    }
}

/**
 * @private
 * @param {String} selectedType
 * @returns {String}
 */
function __getDeskKey(selectedType) {
    switch (selectedType) {
        case lxsc.WorkpanelSelector.CONTENT_NODE: return 'contentNode';
    }
}
