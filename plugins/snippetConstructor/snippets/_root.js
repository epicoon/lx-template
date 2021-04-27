/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.ActiveBox;

/***********************************************************************************************************************
 * MAIN MENU
 **********************************************************************************************************************/
#lx:tpl-begin;
<lx.EggMenu>(coords:['5px','5px'],menuWidget:lx.ActiveBox,menuConfig:{size:['400px', '250px']})
	<lx.Box:@menu._vol>
		.streamProportional(indent:'10px')
		<lx.Box>(height:'40px')
			.grid(step:'10px')
			<lx.Box>(width:3,text:'Plugin:').align(lx.RIGHT, lx.MIDDLE)
			<lx.Box:@plugin.lxsc-current-plugin>(width:9).align(lx.LEFT, lx.MIDDLE)
		<lx.Box>(height:1)
			<lx.TreeBox:@snippetsTree._vol>
#lx:tpl-end;


/***********************************************************************************************************************
 * PLUGIN SELECTOR
 **********************************************************************************************************************/
#lx:tpl-begin;
<lx.Box:@pluginSelector._vol>.style('z-index',1000).hide()
	<lx.Box:@back._vol>.fill('black').opacity(0.5)
	<lx.TreeBox:@tree>(geom:[25,20,50,50])
#lx:tpl-end;
