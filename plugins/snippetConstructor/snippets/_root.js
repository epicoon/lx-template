/**
 * @const {lx.Application} App
 * @const {lx.Plugin} Plugin
 * @const {lx.Snippet} Snippet
 */

#lx:use lx.ActiveBox;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * MAIN GUI
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
#lx:tpl-begin;
<lx.Box:@snippetsAggregator (geom: [0,0,80,80])>
	.style('fontSize', '15px')
	.streamProportional()
	<lx.Box (height:'30px', minHeight:'30px')>
		.overflow('hidden')
		<lx.Box:@snippetLabelsWrapper._spread (width:'auto')>
			<lx.Box:@snippetLabels (height:'100%')>
				.stream(direction: lx.HORIZONTAL, minWidth:'100px', maxWidth:'200px', width:'auto')
	<lx.Box:@snippets>
<lx.Box:.lxsc-worktree (geom:[80,0,20,100])>
	<lx.Box:@pluginDisplayer>
		.style('fontSize', '15px')
		.stream(indent:'10px', minHeight:'25px', height:'25px')
		<lx.Box:@pluginChanger.lxsc-current-plugin-wrapper>
			<lx.Box:.lxsc-current-plugin-lbl>.html('Plugin')
			<lx.Box:@pluginName.lxsc-current-plugin>
		<lx.Box:@snippetsLabel.lxsc-snippets-lbl (text:'Snippets &#9650;')>.align(lx.CENTER, lx.MIDDLE)
		<lx.Box:@snippetsWrapper (minHeight:0, height:0)>
			<lx.TreeBox:@snippetsTree (width:'100%', labelWidth:100)>
		<lx.Box:@actualSnippetButs>
			.grid(cols:3, step:'10px', minHeight:'25px', height:'25px')
			<lx.Button:@butSaveSnippet (text:'Save')>
			<lx.Button:@butResetSnippet (text:'Reset')>
			<lx.Button:@butSwitchContent (text:'Content')>
		<lx.Box (text:'Content')>.align(lx.CENTER, lx.BOTTOM)
		<lx.Box:@contentWrapper (minHeight:0, height:0)>
			<lx.TreeBox:@contentTree (width:'100%', labelWidth:100, rootAddAllowed:true)>
		<lx.Box (text:'Blocks')>.align(lx.CENTER, lx.BOTTOM)
		<lx.Box:@blocksWrapper (minHeight:0, height:0)>
			<lx.TreeBox:@blocksTree (width:'100%', labelWidth:100, rootAddAllowed:true)>
<lx.Box:@workpanel.lxsc-workpanel (geom:[0,80,80,20])>
	<lx.Box:@contentNode (geom:true)>.setSnippet('selected/contentNode').hide()
#lx:tpl-end;


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * PLUGIN SELECTOR
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
#lx:tpl-begin;
<lx.Box:@pluginSelector._spread>.style('z-index',5000).hide()
	<lx.Box:@back._spread>.fill('black').opacity(0.5)
	<lx.TreeBox:@tree.lxsc-Box (geom:[25,20,50,50])>
#lx:tpl-end;


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * NEW BOX DATA FORM
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
#lx:tpl-begin;
<lx.Box:@newBoxDataForm._spread>.style('z-index',1000).hide()
	<lx.Box:@back._spread>.fill('black').opacity(0.5)
	<lx.Box:.lxsc-Box (geom:[20, 30, 60, 'auto'])>
		<lx.Box>.stream(indent:'10px')
			<lx.Box:@elemRow>
				.grid(step:'10px')
				<lx.Box (width:5, text: 'Select new element type')>.align(lx.CENTER, lx.MIDDLE)
				<lx.Dropbox:@elemType (width:5)>
				<lx.Button:@butAddElem (width:2, text:'Add')>
			<lx.Box:@blockRow>
				.grid(step:'10px')
				<lx.Box (width:5, text: 'Or select block')>.align(lx.CENTER, lx.MIDDLE)
				<lx.Dropbox:@blockName (width:5)>
				<lx.Button:@butAddBlock (width:2, text:'Add')>
			<lx.Box>
				<lx.Button:@close (geom:[25, 0, 50, 100], text:'Close')>
#lx:tpl-end;


#lx:use lx.InputPopup;
