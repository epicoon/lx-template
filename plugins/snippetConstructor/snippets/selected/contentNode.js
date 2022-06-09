/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

let wrapper = new lx.Box({geom: true});
wrapper.gridProportional({indent:'10px'});
wrapper.begin();

#lx:use lx.Button;
#lx:use lx.Input;
#lx:use lx.Dropbox;
#lx:use lx.LabeledGroup;

new lx.LabeledGroup({
    widget: lx.Dropbox,
    geom: [0, 0, 4, 2],
    fields: {
        widget: 'widget',
        positioning: 'positioning'
    }
});

new lx.Button({
    key: 'butRunContentEditor',
    text: 'manage content',
    geom: [0, 2, 4, 1]
});

new lx.LabeledGroup({
    widget: lx.Input,
    geom: [4, 0, 3, 3],
    fields: {
        field: 'field',
        key: 'key',
        var: 'var'
    }
});

wrapper.end();
