#lx:namespace lxsc;
class BoxData {
    static create(boxData) {
        switch (boxData.type) {
            case lxsc.ContentMap.TYPE_WIDGET: return new lxsc.WidgetData(boxData);
            case lxsc.ContentMap.TYPE_BLOCK: return new lxsc.BlockData(boxData);
            case lxsc.ContentMap.TYPE_ROOT_BLOCK: return new lxsc.RootBlockData(boxData);
            default: return new this(boxData);
        }
    }
    
    constructor(boxData) {
        this.boxData = boxData;

        const self = this;
        for (let key in boxData) {
            Object.defineProperty(self, key, {
                get: function() {
                    return self.boxData[key];
                }
            });
        }
    }
    
    getBoxData() {
        return this.boxData;
    }

    child(i) {
        const children = this.children;
        if (!children || i >= children.len) return null;
        return lxsc.BoxData.create(children[i]);
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
}
