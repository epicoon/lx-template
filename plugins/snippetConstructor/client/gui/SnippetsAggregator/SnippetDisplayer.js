#lx:namespace lxsc;
class SnippetDisplayer {
    constructor(snippetInfo, snippetLabelsBox, snippetWrappersBox) {
        this.core = snippetInfo.core;
        this.snippetInfo = snippetInfo;
        this.snippetInfo.setDisplayer(this);
        
        this.mark = snippetLabelsBox.add(lx.Box, {
            key: 'snippetMark',
            css: 'lxsc-snippetmark',
            text: this.snippetInfo.snippetPath
        });
        this.mark.align(lx.LEFT, lx.MIDDLE);
        this.mark.click(()=>{
            this.core.getPlugin().trigger('e-beforeChangeSnippet');
            this.core.selectSnippet(this.snippetInfo.pluginName, this.snippetInfo.snippetPath);
        });

        this.wrapper = snippetWrappersBox.add(lx.Box, {
            key: 'snippetWrapper',
            geom: true,
            css: 'lxsc-snippet-selected'
        });

        this.snippetBox = this.wrapper.add(lx.Box, {
            key: 'snippet',
            margin: '5px',
            css: 'lxsc-snippet-container'
        });

        this.actualize();
        this.wrapper.hide();
    }
    
    actualize() {
        const rootBox = this.snippetBox;
        rootBox.clear();
        rootBox.setImagesMap(this.snippetInfo.images);
        rootBox.begin();
        lx._f.createAndCallFunction(this.snippetInfo.snippetCode);
        rootBox.end();
    }
    
    on() {
        this.mark.addClass('lxsc-snippet-selected');
        this.wrapper.show();
    }
    
    off() {
        this.mark.removeClass('lxsc-snippet-selected');
        this.wrapper.hide();
    }
    
    getBox() {
        return this.snippetBox;
    }
    
    getWrapper() {
        return this.wrapper;
    }
}
