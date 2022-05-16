/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.ActiveBox;

/***********************************************************************************************************************
 * MAIN GUI
 **********************************************************************************************************************/
#lx:tpl-begin;
<lx.Box:@snippetsAggregator>(geom: [0,0,80,80])
	.style('fontSize', '15px')
	.streamProportional()
	<lx.Box>(height:'30px', minHeight:'30px')
		.overflow('hidden')
		<lx.Box:@snippetLabelsWrapper._vol>(width:'auto')
			<lx.Box:@snippetLabels>(height:'100%')
				.stream(direction: lx.HORIZONTAL, minWidth:'100px', maxWidth:'200px', width:'auto')
	<lx.Box:@snippets>
<lx.Box:.lxsc-worktree>(geom:[80,0,20,100])
	<lx.Box:@pluginDisplayer>
		.style('fontSize', '15px')
		.stream(indent:'10px', minHeight:'20px', height:'20px')
		<lx.Box:@pluginChanger.lxsc-current-plugin-wrapper>
			<lx.Box:.lxsc-current-plugin-lbl>.html('Plugin')
			<lx.Box:@pluginName.lxsc-current-plugin>
		<lx.Box:@snippetsLabel.lxsc-snippets-lbl>(text:'Snippets &#9650;').align(lx.CENTER, lx.MIDDLE)
		<lx.Box:@snippetsWrapper>(minHeight:0, height:0)
			<lx.TreeBox:@snippetsTree>(width:'100%')
		<lx.Box>(text:'Content').align(lx.CENTER, lx.MIDDLE)
		<lx.Box:@contentWrapper>(minHeight:0, height:0)
			<lx.TreeBox:@contentTree>(width:'100%')
		<lx.Box>(text:'Blocks').align(lx.CENTER, lx.MIDDLE)
		<lx.Box:@blocksWrapper>(minHeight:0, height:0)
			<lx.TreeBox:@blocksTree>(width:'100%')
<lx.Box:.lxsc-workpanel>(geom:[0,80,80,20])
#lx:tpl-end;


/***********************************************************************************************************************
 * PLUGIN SELECTOR
 **********************************************************************************************************************/
#lx:tpl-begin;
<lx.Box:@pluginSelector._vol>.style('z-index',5000).hide()
	<lx.Box:@back._vol>.fill('black').opacity(0.5)
	<lx.TreeBox:@tree>(geom:[25,20,50,50])
#lx:tpl-end;
