class NewBoxDataPromise {
    constructor() {
        this._onAddElement = null;
        this._onAddBlock = null;
        this._onCancel = null;
    }

    reset() {
        this._onAddElement = null;
        this._onAddBlock = null;
        this._onCancel = null;
    }

    onAddElement(callback) {
        this._onAddElement = callback;
        return this;
    }

    onAddBlock(callback) {
        this._onAddBlock = callback;
        return this;
    }

    onCancel(callback) {
        this._onCancel = callback;
        return this;
    }

    triggerAddElement(type) {
        if (this._onAddElement) this._onAddElement(type);
    }

    triggerAddBlock(name) {
        if (this._onAddBlock) this._onAddBlock(name);
    }

    triggerCancel() {
        if (this._onCancel) this._onCancel();
    }
}

#lx:namespace lxsc.gui;
class NewBoxDataForm extends lx.GuiNode {
    init() {
        this.promise = new NewBoxDataPromise();
    }

    initHandlers() {
        const widget = this.getWidget();

        widget->>back.click(()=>this.close());
        widget->>close.click(()=>this.close());

        widget->>butAddElem.click(()=>{
            const widgetDropbox = widget->>elemType;
            if (widgetDropbox.value() === null) {
                lx.Tost.warning('Select a widget type');
                return;
            }
            this.promise.triggerAddElement(widgetDropbox.selectedText());
            this.close();
        });

        widget->>butAddBlock.click(()=>{
            const blockNameDropbox = widget->>blockName;
            if (blockNameDropbox.value() === null) {
                lx.Tost.warning('Select a block name');
                return;
            }
            this.promise.triggerAddBlock(blockNameDropbox.selectedText());
            this.close();
        });
    }

    subscribeEvents() {

    }

    open(blocksList) {
        const core = this.getCore(),
            widget = this.getWidget();
        widget.show();

        let widgetNames = core.widgetsReference.getNames();
        widget->>elemType.options(widgetNames);
        widget->>elemType.value(widgetNames.indexOf('lx.Box'));

        if (blocksList.len) {
            widget->>blockRow.style('display', 'grid');
            widget->>blockName.options(blocksList);
            widget->>blockName.value(null);
        } else widget->>blockRow.style('display', 'none');

        return this.promise;
    }

    close() {
        this.promise.triggerCancel();
        this.promise.reset();
        this.getWidget().hide();
    }
}
