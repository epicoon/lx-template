#lx:namespace lxsc;
class AbstractReference {
    constructor(core) {
        this.core = core;
        this.data = null;
        this.names = [];
    }

    getItemReference(item) {
        return item;
    }

    getNames() {
        return this.names;
    }

    setData(data) {
        this.data = {};
        for (let i in data) {
            this.data[i] = this.getItemReference(data[i]); // new lxsc.WidgetReference(data[i]);
            this.names.push(i);
        }
    }

    get(widgetName) {
        return this.data[widgetName] || null;
    }
}
