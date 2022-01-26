/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.ActiveBox;

#lx:require Core;
#lx:require -R src/;

class Plugin extends lx.Plugin {
    initCssAsset(css) {
        css.addClass('lxsc-current-plugin', {
            cursor: 'pointer',
            backgroundColor: css.preset.bodyBackgroundColor
        });
        css.addClass('lxsc-hlgc', {
            opacity: 0.66
        }, {
            hover: {
                backgroundColor: 'yellow'
            }
        });
        css.addClass('lxsc-delbut', {
            cursor: 'pointer',
            backgroundColor: 'red'
        });
        css.addClass('lxsc-movebut', {
            cursor: 'pointer',
            backgroundColor: 'green'
        });
        css.addClass('lxsc-resizebut', {
            cursor: 'pointer',
            backgroundColor: 'green'
        });
        css.addClass('lxsc-movecursor', {
            border: 'dotted blue 2px'
        });
    }

    run() {
        this.core = new lxsc.Core(this);

        //!!!
        //TODO баг - если предварительно не открыть три-виджет, будет хрень с отображением дерева
        this.root.child(0).open();

        this.core.trigger('e-pluginSelected', {pluginName:'lx/help:test'});
    }
}








// var ab = new lx.ActiveBox({
// 	header: 'Some snippet',
// 	geom: true
// });
// var box = ab.add(lx.Box, {
// 	geom: true
// });

// var elem = new lxsc.Element(box);
// elem.setGrid();





