#lx:namespace lxsc;
class BoxData {
    static create(contentMap, boxData, node) {
        switch (boxData.type) {
            case lxsc.ContentMap.TYPE_WIDGET: return new lxsc.WidgetData(contentMap, boxData, node);
            case lxsc.ContentMap.TYPE_BLOCK: return new lxsc.BlockData(contentMap, boxData, node);
            case lxsc.ContentMap.TYPE_ROOT_BLOCK: return new lxsc.RootBlockData(contentMap, boxData, node);
            default: return new this(contentMap, boxData, node);
        }
    }

    /**
     * @param {String} type
     * @param {lxsc.ContentMap} contentMap
     * @param {Object} data
     */
    static createBlank(type, contentMap, data = {}) {
        switch (type) {
            case lxsc.ContentMap.TYPE_WIDGET: return lxsc.WidgetData.createBlank(contentMap, data);
            case lxsc.ContentMap.TYPE_BLOCK: return lxsc.BlockData.createBlank(contentMap, data);
            case lxsc.ContentMap.TYPE_ROOT_BLOCK: return lxsc.RootBlockData.createBlank(contentMap, data);
            default: return null;
        }
    }

    constructor(contentMap, boxData, node) {
        this.contentMap = contentMap;
        this.boxData = this.normalizeData(boxData);
        this.node = node;

        const self = this;
        for (let key in boxData) {
            Object.defineProperty(self, key, {
                get: function() {
                    return self.boxData[key];
                }
            });
        }
        
        this.init();
    }

    /**
     * @abstract
     * @protected
     */
    init() {
        // pass
    }

    normalizeData(dataObject) {
        return dataObject;
    }

    getCore() {
        return this.contentMap.getCore();
    }

    getPlugin() {
        return this.getCore().getPlugin();
    }

    getSnippetInfo() {
        return this.contentMap.getSnippetInfo();
    }

    getContentMap() {
        return this.contentMap;
    }
    
    getBoxData() {
        return this.boxData;
    }

    getParent() {
        if (!this.node.root) return null;
        return this.node.root.data;
    }

    /**
     * @abstract
     */
    getLabel() {
        // pass
    }

    /**
     * @abstract
     */
    contentIsAllowed() {
        // pass
    }

    child(i) {
        const children = this.children;
        if (!children || i >= children.len) return null;
        return lxsc.BoxData.create(this.contentMap, children[i], this.node.getNth(i));
    }
    
    resetChildren() {
        this.boxData.children = [];
    }
    
    addChild(boxData) {
        if (!this.boxData.children) {
            this.boxData.children = [];
            Object.defineProperty(this, 'children', {
                get: function() {
                    return self.boxData.children;
                }
            });
        }
        this.boxData.children.push(boxData.getBoxData());
    }

    removeData(data) {
        this.boxData.children.lxRemove(data.getBoxData());
    }

    del() {
        this.getParent().removeData(this);
    }
}
