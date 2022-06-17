#lx:namespace lxsc;
class ContentNodeSelected extends lxsc.AbstractSelected {
    init(params) {
        this.snippetInfo = params.snippetInfo;
        this.node = params.node;
        this.nodeIndexes = this.node.getIndexes();

        this.boxes = null;
        this.boxesData = null;
        this.model = null;
        this.editor = null;
        this.initRest();
    }

    initRest() {
        this.boxes = this.snippetInfo.getBoxes(this.node);
        this.boxesData = this.node.data;
    }

    initModel() {
        this.model = new ContentNodeModel(this.boxesData);
    }

    subscribeEvents() {
        const plugin = this.getPlugin();

        plugin.on('e-runContentEditor', () => {
            this.editor = new lxsc.ContentEditor(
                this.snippetInfo,
                this.boxes,
                this.boxesData
            );
            this.editor.start();
        });

        plugin.on('e-endContentEditor', () => {
            this.editor.applyChanges();
            const map = this.snippetInfo.content.toMap();
            plugin.trigger('e-actualizeSnippet', {
                callback: ()=>{
                    this.editor.stop();
                    this.editor = null;
                    this.node = this.snippetInfo.content.getRoot().getNth(this.nodeIndexes);
                    this.initRest();
                    this.initModel();
                    this.getPlugin().trigger('e-contentTreeNodeUpdated', {node: this.node});
                }
            });
        });
    }

    unselect() {
        this.getPlugin().trigger('e-contentTreeNodeUnselected', {node: this.node});
        super.unselect();
    }
}

class ContentNodeModel extends lx.BindableModel {
    #lx:schema
        field << data.field,
        key << data.key,
        var << data.var;

    constructor(data) {
        super();
        this.data = data;

        console.log(data);
    }
}
