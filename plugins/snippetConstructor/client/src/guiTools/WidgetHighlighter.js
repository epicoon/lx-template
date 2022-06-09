#lx:namespace lxsc;
class WidgetHighlighter {
    constructor(core) {
        this.core = core;
        this.inFocus = null;
        __setHandlers(this);

        this.highlightedList = [];
    }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * PRIVATE
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function __setHandlers(self) {
    self.core.plugin.on('e-contentTreeOver', event=>__onOver(self, event.data.node));
    self.core.plugin.on('e-blockTreeOver', event=>__onOver(self, event.data.node));

    self.core.plugin.on('e-contentTreeOut', event=>__reset(self));
    self.core.plugin.on('e-blockTreeOut', event=>__reset(self));
}

function __reset(self) {
    for (let i in self.highlightedList)
        self.highlightedList[i].removeClass('lxsc-higlighted-box');
    self.highlightedList = [];
}

function __onOver(self, node) {
    const boxes = self.core.getSelectedSnippetInfo().getBoxes(node);
    for (let i in boxes)
        boxes[i].addClass('lxsc-higlighted-box');
    self.highlightedList = boxes;
}
