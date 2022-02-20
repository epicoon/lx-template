class WidgetHighlighter #lx:namespace lxsc.gui {
    constructor(core) {
        this.core = core;
        __setHandlers(this);
    }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * PRIVATE
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function __setHandlers(self) {
    self.core.plugin.on('e-widgetOver', event=>{


        console.log('!!! widget over');
        console.log(event);

        console.log(event.data.node.data);


    });

    self.core.plugin.on('e-widgetOut', event=>{


        console.log('!!! widget out');
        console.log(event);

        console.log(event.data.node.data);

    });
}
