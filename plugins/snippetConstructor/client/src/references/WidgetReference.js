#lx:namespace lxsc;
class WidgetReference {
    constructor(data) {
        this.data = data;
        const self = this;
        for (let key in this.data) {
            Object.defineProperty(self, key, {
                get: function() {
                    return self.data[key];
                }
            });
        }
    }

    contentIsDisallowed() {
        return !!this.doc['content-disallowed'];
    }
}
