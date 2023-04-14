#lx:namespace lxsc.css;
class MainAsset extends lx.PluginCssAsset {
    init(css) {
        // Work boxes
        css.inheritClass('lxsc-Box', 'AbstractBox');
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

        // Current snippet tree
        css.addClass('lxsc-tree-list-selected', {
            backgroundColor: css.preset.checkedDeepColor,
        });
        css.addClass('lxsc-tree-but-add', {
            '@icon': ['\\271A', {fontSize:10, paddingBottom:'0px'}],
            '@clickable': true,
            borderRadius: css.preset.borderRadius,
            color: css.preset.widgetIconColor,
            backgroundColor: css.preset.checkedMainColor,
        });
        css.addClass('lxsc-tree-but-del', {
            '@icon': ['\\2716', {fontSize:10, paddingBottom:'0px'}],
            '@clickable': true,
            borderRadius: css.preset.borderRadius,
            color: css.preset.widgetIconColor,
            backgroundColor: css.preset.hotMainColor,
        });
        css.addClass('lxsc-tree-but-folder', {
            '@icon': ['\\1F4C1', {fontSize:10, paddingBottom:'0px'}],
            '@clickable': true,
            borderRadius: css.preset.borderRadius,
            color: css.preset.widgetIconColor,
            backgroundColor: css.preset.checkedMainColor,
        });
        css.addClass('lxsc-tree-but-file', {
            '@icon': ['\\1F5D2', {fontSize:10, paddingBottom:'0px'}],
            '@clickable': true,
            borderRadius: css.preset.borderRadius,
            color: css.preset.widgetIconColor,
            backgroundColor: css.preset.checkedMainColor,
        });

        // Current snippet displayer
        css.addClass('lxsc-content', {
            border: '2px dotted ' + css.preset.widgetBorderColor,
        });
        css.addClass('lxsc-higlighted-box', {
            border: '2px dashed ' + css.preset.hotLightColor,
            zIndex: 1000
        }, {
            before: {
                content: '\'\'',
                display: 'block',
                position: 'inherit',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.5,
                backgroundColor: css.preset.checkedLightColor
            }
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
        css.addClass('lxsc-transparent-back', {
            backgroundColor: css.preset.textColor,
            opacity: 0.5
        });
    }
}
