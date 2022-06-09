#lx:namespace lxsc;
class BlockData extends lxsc.BoxData {
    constructor(boxData) {
        super(boxData);

        const self = this;
        for (let key in boxData.data) {
            let val = boxData.data[key];
            Object.defineProperty(self, key, {
                get: function () {
                    return self.boxData.data[key];
                }
            });
        }
    }
}
