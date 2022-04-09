/**
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.ActiveBox;

#lx:require Core;
#lx:require -R src/;

class Plugin extends lx.Plugin {
    initCssAsset(css) {
        // Work boxes
        css.addClass('lxsc-worktree', {
            backgroundColor: css.preset.altBodyBackgroundColor
        });
        css.addClass('lxsc-workpanel', {
            backgroundColor: css.preset.altBodyBackgroundColor
        });
        css.addClass('lxsc-snippetmark', {
            '@ellipsis': true,
            cursor: 'pointer',
            backgroundColor: css.preset.altMainBackgroundColor,
            borderTop: '1px solid ' + css.preset.widgetBorderColor,
            borderLeft: '1px solid ' + css.preset.widgetBorderColor,
            borderRight: '1px solid ' + css.preset.widgetBorderColor,
            borderTopLeftRadius: css.preset.borderRadius,
            borderTopRightRadius: css.preset.borderRadius
        });
        css.addClass('lxsc-snippet-selected', {
            backgroundColor: css.preset.checkedDeepColor
        });
        css.addClass('lxsc-snippet-container', {
            backgroundColor: css.preset.mainBackgroundColor
        });

        // Current plugin
        css.addClass('lxsc-current-plugin-wrapper', {
            cursor: 'pointer',
            backgroundColor: css.preset.bodyBackgroundColor
        });
        css.addClass('lxsc-current-plugin-lbl', {
            backgroundColor: css.preset.altBodyBackgroundColor,
            display: 'block',
            float: 'left',
            paddingLeft: '10px',
            paddingRight: '10px'
        });
        css.addClass('lxsc-current-plugin', {
            display: 'block',
            paddingLeft: '10px',
            overflow: 'hidden',
        });

        css.addClass('lxsc-snippets-lbl', {
            cursor: 'pointer'
        });
        
        // Misc
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

        css.addClass('lxsc-higlighted-box', {
            border: '2px dashed ' + css.preset.hotLightColor,
            zIndex: 1000
        }, {
            before: {
                content: '\'\'',
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.5,
                backgroundColor: css.preset.checkedLightColor
            }
        });
    }

    run() {
        this.core = new lxsc.Core(this);



        //!!!
        //TODO баг - если предварительно не открыть три-виджет, будет хрень с отображением дерева
        // this.root.child(0).open();

        // this.core.trigger('e-pluginSelected', {pluginName:'lx/help:test'});
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





