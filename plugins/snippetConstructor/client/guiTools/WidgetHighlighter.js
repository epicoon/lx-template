#lx:namespace lxsc.gui;
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
    self.core.plugin.on('e-contentTreeOver', event=>__onOver(self, event.data.node, true));
    self.core.plugin.on('e-blockTreeOver', event=>__onOver(self, event.data.node, false));

    self.core.plugin.on('e-contentTreeOut', event=>__reset(self));
    self.core.plugin.on('e-blockTreeOut', event=>__reset(self));
}

function __reset(self) {
    for (let i in self.highlightedList)
        self.highlightedList[i].removeClass('lxsc-higlighted-box');
    self.highlightedList = [];
}

function __onOver(self, node, inContentTree) {
    const snippetInfo = self.core.getSelectedSnippetInfo();
    const map = snippetInfo.content;
    const pathes = inContentTree
        ? map.getPathesFromRoot(node)
        : map.getPathesFromBlock(node);
    const boxes = __defineBoxes(self, snippetInfo.rootBox, pathes);
    for (let i in boxes)
        boxes[i].addClass('lxsc-higlighted-box');
    self.highlightedList = boxes;
}

function __defineBoxes(self, rootBox, pathes) {
    let boxes = [];
    for (let i in pathes) {
        let path = pathes[i];
        let temp = rootBox;
        for (let j in path) {
            let index = path[j];
            temp = temp.child(index);
        }
        boxes.push(temp);
    }
    return boxes;
}
