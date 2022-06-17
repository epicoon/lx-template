#lx:namespace lxsc;
class AbstractContainerField {
    static create(editor, type) {
        switch (type) {
            case 'lx.GridPositioningStrategy':
                return new lxsc.GridProportionalField(editor);
            default:
                return null;
        }
    }
    
    constructor(editor) {
        this.core = editor.getCore();
        this.editor = editor;
        this.originalBox = editor.getOriginalBox();
        this.editorBox = editor.getEditorBox();
        this.elemCollection = new lxsc.ElementsCollection();
        this.init();
    }
    
    getPlugin() {
        return this.core.getPlugin();
    }
    
    getCore() {
        return this.core;
    }

    /**
     * @abstract
     */
    init() {
        // pass
    }
    
    /**
     * @abstract
     */
    applyChanges() {
        // pass
    }    
}
