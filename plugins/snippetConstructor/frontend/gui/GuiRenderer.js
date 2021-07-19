class GuiRenderer #lx:namespace lxsc.gui {
    getSnippetBox(header) {
        var boxes = this.__renderSnippetBox(header);

        // boxes->>
        
     
        return boxes;
    }

    #lx:tpl-method __renderSnippetBox(header) {
        <lx.ActiveBox:^snippetBox._vol>(header,closeButton:true)
            .gridProportional(cols:10)
            <lx.Box:@workField>(geom:[0,0,8,8])
            <lx.Box:@contentTree>(geom:[8,0,2,10])
                <lx.Box:@elements>.fill('red')
                <lx.JointMover>(top:'1/2')
                <lx.Box:@blocks>.fill('yellow')
            <lx.Box:@subMenu>(geom:[0,8,8,2])
    }
}
