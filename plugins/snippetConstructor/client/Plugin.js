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

    run() {
        this.initGuiNodes({
            pluginSelector: lxsc.gui.PluginSelector,
            pluginDisplayer: lxsc.gui.PluginDisplayer,
            snippetsAggregator: lxsc.gui.SnippetsAggregator,
            contentNode: lxsc.gui.ContentNode,
            newBoxDataForm: lxsc.gui.NewBoxDataForm,
        });

        this.core = new lxsc.Core(this);

        


        //TODO --dev
        var testBut = this.root.add(lx.Box, {geom: [null, null, 10, 10, 0, 0]});
        testBut.border();
        testBut.click(()=>{
            console.log('!!!TEST');
            console.log(this.core);
        });
        /*
        TODO
        Сокращения:
            - СП - стратегии позиционирования
        Доделывать:
        - добавить EggMenu для эдитора пропорционального грида
            - возможность менять количество строк и колонок
            - возможность менять отступы
            - возможность менять минимальные размеры ячеек
        - доделать полиморфизм эдиторов для разных СП
            - реализация эдиторов для обычного грида(?), обычной СП, карты
            - EggMenu для СП кому это нужно
        - реализовать переключение СП
            - использовать справочник в модели для ContentNodeSelected, реализовать связывание с выпадающим списком

        - реализовать переключение типа виджета
            - нужно разметить код классов виджетов доками
            - использовать справочник в модели для ContentNodeSelected, реализовать связывание с выпадающим списком

        - реализовать редактирование массива CSS-классов
        - реализовать редактирование конфигурации элемента
            - геоматрия отдельно (включая volume:true/false)
            - информация для полей конфигурирования берется из парсинга доков виджетов
        - реализовать редактирование вызовов методов
            - нужно разметить код методов виджетов доками
            - информация для доступных методов и их аргументов берется из парсинга доков методов виджетов

        - реализовать множественное выделение
        - реализовать интерфейс создания блоков из узлов дерева, идущих подряд
        - крупная подзадача - эдитор пресетов
        */


        // Загружаю тестовый сниппет
        let testPlugin = 'lx/help:test';
        let testSnippet = 'snippets/test2.lxtpl';
        this.on('e-pluginSelected', ()=>{
            this.core.loadSnippet(testSnippet);
        });
        this.on('e-snippetAdded', ()=>{
            // Code

        });

        this.on('e-referencesLoaded', ()=>{
            this.core.selectPlugin(testPlugin);
        })



    }
}
