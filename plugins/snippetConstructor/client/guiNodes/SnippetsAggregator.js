#lx:namespace lxsc.gui;
class SnippetsAggregator extends lx.GuiNode {
    init() {
        this.selected = {
            mark: null,
            box: null
        };
        this.marks = {};
        this.boxes = {};
    }

    initHandlers() {
        this.getWidget()->>snippetLabelsWrapper.move();
    }

    subscribeEvents() {
        this.getPlugin().on(
            'e-snippetAdded',
            event=>__addSnippet(this, event.data.snippetKey, event.data.snippetCode, event.data.images)
        );
        this.getPlugin().on(
            'e-snippetSelected',
            event=>this.select(event.data.selectedPlugin, event.data.selectedSnippet)
        );
    }

    select(pluginName, snippetPath) {
        this.unselect();
        const key = this.getPlugin().core.getSnippetKey(pluginName, snippetPath);
        const mark = this.marks[key];
        const box = this.boxes[key];
        mark.addClass('lxsc-snippet-selected');
        box.show();
        this.selected.mark = mark;
        this.selected.box = box;
    }

    unselect() {
        if (this.selected.box !== null) {
            this.selected.box.hide();
            this.selected.box = null;
        }
        if (this.selected.mark !== null) {
            this.selected.mark.removeClass('lxsc-snippet-selected');
            this.selected.mark = null;
        }
    }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * PRIVATE
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function __addSnippet(self, snippetKey, snippetCode, images) {
    const snippetInfo = self.getPlugin().core.snippets[snippetKey];
    const mark = self.getWidget()->>snippetLabels.add(lx.Box, {
        key: 'snippetMark',
        css: 'lxsc-snippetmark',
        text: snippetInfo.snippet
    });
    mark.align(lx.LEFT, lx.MIDDLE);

    const wrapper = self.getWidget()->>snippets.add(lx.Box, {
        key: 'snippetWrapper',
        geom: true,
        css: 'lxsc-snippet-selected'
    });
    const snippetBox = wrapper.add(lx.Box, {
        key: 'snippet',
        margin: '5px',
        css: 'lxsc-snippet-container'
    });

    snippetBox.setImagesMap(images);
    snippetBox.begin();
    lx._f.createAndCallFunction(snippetCode);
    snippetBox.end();
    wrapper.hide();

    snippetInfo.rootBox = snippetBox;

    self.marks[snippetKey] = mark;
    self.boxes[snippetKey] = wrapper;

    mark.click(()=>{
        self.getPlugin().core.selectSnippet(snippetInfo.plugin, snippetInfo.snippet);
    });
}
