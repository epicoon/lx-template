#lx:namespace lxsc;
class AbstractSelected {
    constructor(selector, params) {
        this.selector = selector;
        this.model = null;
        this.init(params);
        this.initModel();
        this.subscribeEvents();
    }

    /**
     * @abstract
     * @protected
     * @param {Object} params
     */
    init(params) {
        // pass
    }

    /**
     * @abstract
     * @protected
     */
    initModel() {
        // pass
    }

    /**
     * @abstract
     * @protected
     */
    subscribeEvents() {
        // pass
    }

    unselect() {
        this.unbind();
    }

    getCore() {
        return this.selector.core;
    }

    getPlugin() {
        return this.getCore().getPlugin();
    }

    /**
     * @returns {lx.BindableModel|null}
     */
    getModel() {
        return this.model;
    }
    
    bind(widget) {
        const model = this.getModel();
        if (model) model.bind(widget);
    }
    
    unbind() {
        const model = this.getModel();
        if (model) model.unbind();
    }
}
