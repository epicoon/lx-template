#lx:namespace lxsc;
class WidgetData extends lxsc.BoxData {
    init() {
        const self = this;
        for (let key in this.boxData.data) {
            let val = this.boxData.data[key];
            Object.defineProperty(self, key, {
                set: function(val) {
                    self.boxData.data[key] = val;
                },
                get: function() {
                    return self.boxData.data[key];
                }
            });
        }
    }

    normalizeData(dataObject) {
        if (dataObject.data.config && lx.isArray(dataObject.data.config))
            dataObject.data.config = {};
        return dataObject;
    }

    static createBlank(contentMap, data = {}) {
        let params = data.lxClone();
        params.lxMerge({
            widget: 'lx.Box',
            volume: false,
            field: null,
            key: null,
            var: null,
            css: [],
            config: {},
            actions: []
        });
        return new this(contentMap, {
            type: lxsc.ContentMap.TYPE_WIDGET,
            data: params
        }, null);
    }

    getReference() {
        return this.getCore().widgetsReference.get(this.widget);
    }

    getLabel() {
        let name = this.widget;
        let key = this.key || this.field || this.var;
        if (key !== null) name += ': ' + key;
        return name;
    }

    contentIsAllowed() {
        return !this.getReference().contentIsDisallowed()
    }

    setGeom(geom) {
        this.config.geom = '['+geom.left+','+geom.top+','+geom.width+','+geom.height+']';
    }
}
