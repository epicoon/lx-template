#lx:namespace lxsc.gui;
class ContentNode extends lx.GuiNode {
    init() {
        this.editorMode = false;
    }

    initHandlers() {
        const plugin = this.getPlugin(), 
            widget = this.getWidget();

        widget->>butRunContentEditor.click(()=>{
            this.editorMode
                ? plugin.trigger('e-endContentEditor')
                : plugin.trigger('e-runContentEditor');
        });
    }

    subscribeEvents() {
        const plugin = this.getPlugin(),
            widget = this.getWidget(),
            butRunContentEditor = widget->>butRunContentEditor;

        plugin.on('e-runContentEditor', ()=>{
            this.editorMode = true;
            butRunContentEditor.text('apply content changes');
        });
        plugin.on('e-endContentEditor', ()=>{
            this.editorMode = false;
            butRunContentEditor.text('manage content');
        });
    }
}
