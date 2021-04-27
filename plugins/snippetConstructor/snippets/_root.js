/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.EggMenu;
#lx:use lx.ActiveBox;
#lx:use lx.TreeBox;


/***********************************************************************************************************************
 * MENU
 **********************************************************************************************************************/
var egg = new lx.EggMenu({
    coords: ['5px', '5px'],
    menuWidget: lx.ActiveBox

    ,
    menuRenderer: function(menu) {
        menu->resizer.move({
            parentResize: true,
            xLimit: false,
            yLimit: false
        });
    }
});

var menuBox = egg->menuBox;
var menu = menuBox.add(lx.Box, {geom:true, key:'menu'});
menu.streamProportional({indent: '10px'});
menu.begin();
var header = new lx.Box({height: '40px'});
var list = new lx.Box({height: 1});
menu.end();


header.grid({step:'10px'});
header.begin();
(new lx.Box({width:3, text:'Plugin:'})).align(lx.RIGHT, lx.MIDDLE);
var plugin = new lx.Box({width:9, key:'plugin'});
header.end();

plugin.align(lx.LEFT, lx.MIDDLE);
plugin.addClass('lxsc-current-plugin');

list.add(lx.TreeBox, {geom:true, key:'snippetsTree'});





/*
var menuRenderer = function(pult) {
	pult->resizer.move({
		parentResize: true,
		xLimit: false,
		yLimit: false
	});
};
#lx:<snt
<lx.EggMenu>(coords:['5px', '5px'], menuWidget:lx.ActiveBox, menuRenderer)
	<lx.Box@menu>(volume).streamProportional(indent:'10px')
		<lx.Box>(height:'40px').grid(step:'10px')
			<lx.Box>(width:3, text:'Plugin:').align(lx.RIGHT, lx.MIDDLE)
			<lx.Box@plugin.lxsc-current-plugin>(width:9).align(lx.CENTER, lx.MIDDLE)
		<lx.Box>
			<lx.TreeBox@snippetsTree>(volume)

#lx:snt>
/**/





/***********************************************************************************************************************
 * PLUGIN SELECTOR
 **********************************************************************************************************************/
var pluginSelector = new lx.Box({geom:true, key:'pluginSelector'});
pluginSelector.style('z-index', 1000);
pluginSelector.hide();
pluginSelector.begin();
var back = new lx.Box({geom:true});
back.fill('black');
back.opacity(0.5);

new lx.TreeBox({geom:[25, 20, 50, 50], key:'tree'});
pluginSelector.end();


/*
#lx:<snt
<lx.Box@pluginSelector>(geom:true)
	.style('z-index', 1000)
	.hide()
	<lx.Box>(geom:true).fill('black').opacity(0.5)
	<lx.TreeBox@tree>(geom:[25, 20, 50, 50])
#lx:snt>
/**/

