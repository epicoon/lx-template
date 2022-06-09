#lx:namespace lxsc;
class ContentEditor {
    constructor(snippetInfo, boxes, boxesData) {
        this.core = snippetInfo.core;
        this.snippetInfo = snippetInfo;
        this.boxesData = boxesData;
        this.originalBoxes = boxes;
        this.originalBox = this.originalBoxes[0];
        this.containerField = null;
        this.editorBox = null;
    }
    
    getCore() {
        return this.core;
    }

    getOriginalBox() {
        return this.originalBox;
    }

    getEditorBox() {
        return this.editorBox;
    }

    getEditingBoxData() {
        return this.boxesData;
    }

    applyChanges() {
        this.containerField.applyChanges();
    }

    start() {
        const wrapper = this.snippetInfo.getDisplayer().getWrapper();
        const snippetEditorWrapper = wrapper.add(lx.Box, {
            key: 'snippetEditorWrapper',
            margin: '5px',
        });
        snippetEditorWrapper.add(lx.Box, {
            geom: true,
            css: 'lxsc-transparent-back'
        });

        let relGeom = this.originalBox.getRelativeRect(this.snippetInfo.getDisplayer().getBox());
        let geom = [
            relGeom.left + 'px',
            relGeom.top + 'px',
            relGeom.width + 'px',
            relGeom.height + 'px',
        ];
        this.editorBox = snippetEditorWrapper.add(lx.Box, {key:'snippetEditor', geom});
        this.editorBox.fill('white');


        //TODO Фабричный метод
        this.containerField = new lxsc.GridProportionalField(this);
    }

    stop() {
        const wrapper = this.snippetInfo.getDisplayer().getWrapper();
        wrapper.del('snippetEditorWrapper');
    }
}
