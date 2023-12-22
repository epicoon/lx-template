#lx:namespace lxsc;
class RootBlockData extends lxsc.BoxData {
    getLabel() {
        return this.name.match(/<(.+?)>/)[1];
    }

    contentIsAllowed() {
        return true;
    }

    del() {
        console.log(this);

        const rootBlockName = this.name;
        let list = [];
        function check(node) {
            const nodeData = node.data;
            if (nodeData.type !== lxsc.ContentMap.TYPE_BLOCK) return;
            if (nodeData.name !== rootBlockName) return;
            list.push(nodeData)
        }
        this.contentMap.root.eachNodeRecursive(node=>check(node));
        this.contentMap.blocks.eachNodeRecursive(node=>check(node));

        list.forEach(nodeData=>nodeData.del());
        super.del();
    }

    static createBlank(contentMap, data) {
        let params = data.lxClone();
        params.type = lxsc.ContentMap.TYPE_ROOT_BLOCK;
        if (!params.name)
            params.name = '<#' + lx.Math.decChangeNotation(lx.Math.rand(100000, 999999), 62) + '>';
        if (params.name[0] != '<')
            params.name = '<#' + params.name + '>';
        return new this(contentMap, params, null);
    }
}
