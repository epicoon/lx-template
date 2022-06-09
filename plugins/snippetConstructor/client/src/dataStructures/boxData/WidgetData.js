#lx:namespace lxsc;
class WidgetData extends lxsc.BoxData {
    constructor(boxData) {
        super(boxData);
        
        const self = this;
        for (let key in boxData.data) {
            let val = boxData.data[key];
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

    static createBlank() {
        return new this({
            type: lxsc.ContentMap.TYPE_WIDGET,
            data: {
                widget: 'lx.Box',
                volume: false,
                field: null,
                key: null,
                var: null,
                css: [],
                config: {},
                actions: []
            }
        });
    }

    setGeom(geom) {
        this.config.geom = '['+geom.left+','+geom.top+','+geom.width+','+geom.height+']';
    }

    removeData(data) {
        this.boxData.children.lxRemove(data.getBoxData());
    }
}
