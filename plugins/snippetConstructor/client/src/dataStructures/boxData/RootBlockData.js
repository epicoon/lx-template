#lx:namespace lxsc;
class RootBlockData extends lxsc.BoxData {
    constructor(boxData) {
        super(boxData);

        // const self = this;
        // for (let key in boxData.data) {
        //     let val = boxData.data[key];
        //     Object.defineProperty(self, key, {
        //         set: function (val) {
        //             self.boxData.data[key] = val;
        //         },
        //         get: function () {
        //             return self.boxData.data[key];
        //         }
        //     });
        // }
    }
}
