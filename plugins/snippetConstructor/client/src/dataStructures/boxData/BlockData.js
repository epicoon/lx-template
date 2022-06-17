#lx:namespace lxsc;
class BlockData extends lxsc.BoxData {
    init() {
        const self = this;
        for (let key in this.boxData.data) {
            let val = this.boxData.data[key];
            Object.defineProperty(self, key, {
                get: function () {
                    return self.boxData.data[key];
                }
            });
        }
    }

    getLabel() {
        return 'block: ' + this.name.match(/<(.+?)>/)[1];
    }

    contentIsAllowed() {
        return false;
    }

    static createBlank(contentMap, data = {}) {
        let params = data.lxClone();
        params.lxMerge({ name: '' });
        if (params.name != '' && params.name[0] != '<')
            params.name = '<' + params.name + '>';
        return new this(contentMap, {
            type: lxsc.ContentMap.TYPE_BLOCK,
            data: params
        }, null);
    }
}
