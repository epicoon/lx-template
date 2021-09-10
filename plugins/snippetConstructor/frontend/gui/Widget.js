class Widget #lx:namespace lxsc.gui {
	constructor(plugin, box) {
		this.plugin = plugin;
		this.box = box;
		this.initHandlers();
	}

	getWidget(name) {
		return this.plugin.core.widgets[name];
	}

	triggerCoreEvent(eventName, data) {
		this.plugin.core.trigger(eventName, data);
	}

	initHandlers() {
		// pass
	}
}
