#lx:namespace lxsc;
class SnippetInfo {
    constructor(core, pluginName, snippetPath) {
        this.core = core;
        this.pluginName = pluginName;
        this.snippetPath = snippetPath;
        this.displayer = null;
        this.snippetCode = null;
        this.content = null;
        this.images = null;
        this._changed = false;
    }

    getCore() {
        return this.core;
    }

    getPlugin() {
        return this.core.getPlugin();
    }

    isChanged() {
        return this._changed;
    }

    setChanged() {
        this._changed = true;
    }

    resetChanged() {
        this._changed = false;
    }

    actualize(data, callback = null) {
        this.snippetCode = data.code;
        this.content = new lxsc.ContentMap(this, data.tree);
        if (data.images !== undefined)
            this.images = data.images;
        lx.app.loader.loadModules({
            modules: data.dependencies.modules || [],
            callback: ()=>{
                if (this.displayer) {
                    this.displayer.actualize();
                    this.core.getPlugin().trigger('e-snippetActualized', {snippetInfo: this});
                }
                if (callback) callback();
            }
        });
    }

    getKey() {
        return this.core.getSnippetKey(this.pluginName, this.snippetPath);
    }

    setDisplayer(displayer) {
        this.displayer = displayer;
    }
    
    getDisplayer() {
        return this.displayer;
    }

    getRootBox() {
        if (!this.displayer) return null;
        return this.displayer.snippetBox;
    }
    
    getBoxes(node) {
        let rootNode = node.rootNode(),
            inContentTree = (rootNode === this.content.root),
            pathes = inContentTree
                ? this.content.getPathesFromRoot(node)
                : this.content.getPathesFromBlock(node),
            boxes = [];
        for (let i in pathes) {
            let path = pathes[i];
            let temp = this.getRootBox();
            for (let j in path) {
                let index = path[j];
                temp = temp.child(index);
            }
            boxes.push(temp);
        }
        return boxes;
    }
}
