#lx:namespace lxsc;
class WidgetsReference {
    constructor(core) {
        this.core = core;
        this.data = null;
    }
    
    setData(data) {
        this.data = {};
        for (let i in data) {
            this.data[i] = new lxsc.WidgetReference(data[i]);
        }
    }
    
    get(widgetName) {
        return this.data[widgetName] || null;
    }
}
