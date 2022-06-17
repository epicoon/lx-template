#lx:use lx.Color;

#lx:namespace lxsc;
class GridProportionalField extends lxsc.AbstractContainerField {
	init() {
		this.activeElem = null;

		this.preElemColor = 'red';
		this.elemColor = 'blue';
		this.baseColor = new lx.Color('pink');
		this.lightColor = this.baseColor.clone().lighten(10);
		this.darkColor = this.baseColor.clone().darken(10);

		this.cols = this.originalBox.positioning().getCols();
		this.rows = this.originalBox.positioning().getRows() || 1;
		let config = this.originalBox.positioning().getIndents();
		this.indents = new lx.IndentData(config);

		this.cursor = new lxsc.GridCursor(this);
		this.container = null;
		this.grid = null;
		this.map = [];
		__buildBox(this);
		this.editorBox.on('resize', ()=>{
			this.elemCollection.forEach(el=>el.actualizeGeom());
		});

		this.originalBox.getChildren().forEach((child, i)=>{
			this.addElement(this.createElement({
				originalBox: child,
				boxData: this.editor.getEditingBoxData().child(i)
			}));
		});
	}

	applyChanges() {
		const containerBoxData = this.editor.getEditingBoxData();
		containerBoxData.resetChildren();
		this.elemCollection.forEach(elem=>{
			//TODO цепочка вызовов this.editor.snippetInfo.content. некрасиво
			let boxData = elem.getBoxData() || this.editor.snippetInfo.content.createBoxDataBlank(lxsc.ContentMap.TYPE_WIDGET),
				geom = {
					left: elem.positioning.x0,
					top: elem.positioning.y0,
					width: elem.positioning.x1 - elem.positioning.x0 + 1,
					height: elem.positioning.y1 - elem.positioning.y0 + 1
				};
			boxData.setGeom(geom);
			containerBoxData.addChild(boxData);
		});
	}

	getBox(x, y) {
		return this.map[y][x];
	}

	getElems(x, y) {
		var matches = [];
		this.elemCollection.forEach(elem=>{
			if (
				elem.positioning.x0 <= x
				&& elem.positioning.x1 >= x
				&& elem.positioning.y0 <= y
				&& elem.positioning.y1 >= y
			) matches.push(elem);
		});

		return matches;
	}

	createElement(config) {
		const avatarBox = new lx.Box({parent: this.container, geom: [0, 0, 0, 0]});
		avatarBox.fill(this.preElemColor);

		const elemConfig = {avatarBox};
		let position;
		if (config.gridCell)
			position = [config.gridCell.column, config.gridCell.row, config.gridCell.column, config.gridCell.row];
		else if (config.originalBox) {
			position = config.originalBox.style('grid-area').match(/\d+/g);
			for (let i in position) position[i] = +position[i] - 1;
			position = [position[1], position[0], position[3]-1, position[2]-1];
			elemConfig.originalBox = config.originalBox;
			elemConfig.boxData = config.boxData;
		}

		elemConfig.positioning = new lxsc.GridPositioning(this, position);
		const elem = new lxsc.Element(elemConfig);
		elem.actualizeGeom();
		return elem;
	}

	addElement(elem) {
		const box = elem.getAvatarBox();
		box.fill(this.elemColor);
		box.on('mouseout', ()=>__deactivateElem(this, elem));
		this.elemCollection.add(elem);
	}

	delElement(elem) {		
		this.elemCollection.del(elem);
		elem.destruct();
	}

	actualizeElementGeom(elem, x0, y0, x1, y1) {
		var indents = this.indents.get(this.editorBox, 'px');
		var lastPoint = {x:null, y:null};
		for (var y=this.rows-1; y>=0; y--) {
			var tyle = this.getBox(0, y);
			if (y1 >= Math.round(tyle.top('px') - indents.stepY + tyle.height('px') * 0.5)) {
				lastPoint.y = tyle.row;
				break;
			}
		}
		for (var x=this.cols-1; x>=0; x--) {
			var tyle = this.getBox(x, 0);
			if (x1 >= Math.round(tyle.left('px') - indents.stepX + tyle.width('px') * 0.5)) {
				lastPoint.x = tyle.column;
				break;
			}
		}

		const firstPoint = {x:null, y:null},
			avatarBox = elem.getAvatarBox();
		if (avatarBox.left('px') == x0 && avatarBox.top('px') == y0) {
			firstPoint.x = elem.positioning.x0;
			firstPoint.y = elem.positioning.y0;
		} else {
			firstPoint.x = lastPoint.x + elem.positioning.x0 - elem.positioning.x1;
			firstPoint.y = lastPoint.y + elem.positioning.y0 - elem.positioning.y1;
		}

		elem.positioning.x0 = firstPoint.x;
		elem.positioning.y0 = firstPoint.y;
		elem.positioning.x1 = lastPoint.x;
		elem.positioning.y1 = lastPoint.y;
		elem.actualizeGeom();
	}
}


/***********************************************************************************************************************
 * PRIVATE
 **********************************************************************************************************************/

function __buildBox(self) {
	self.editorBox.useRenderCache();

	self.container = new lx.Box({parent: self.editorBox, geom: true});
	self.grid = new lx.Box({parent: self.editorBox, geom: true});

	self.grid.fill(self.lightColor);
	self.grid.opacity(0.7);
	var config = self.indents.get();
	config.cols = self.cols;
	config.minHeight = '1px';
	self.grid.gridProportional(config);

	self.grid.begin();
		for (var y=0; y<self.rows; y++) {
			var b = new lx.Box({
				geom: [0, y, self.cols, 1]
			});
			b.fill(self.darkColor);
			b.opacity(0.5);
		}
		for (var x=0; x<self.cols; x++) {
			var b = new lx.Box({
				geom: [x, 0, 1, self.rows]
			});
			b.fill(self.darkColor);
			b.opacity(0.5);
		}
		for (var y=0; y<self.rows; y++) {
			self.map.push([]);
			for (var x=0; x<self.cols; x++) {
				var b = new lx.Box({
					geom: [x, y, 1, 1],
					css: 'lxsc-hlgc'
				});
				b.column = x;
				b.row = y;

				b.on('mousedown', function(e) {
					e.preventDefault();
					self.cursor.setAnchor(this);
				});
				b.on('mouseover', function(e) {
					if (self.cursor.isSelectioning()) {
						self.cursor.actualize(this);
						return;
					}

					var elems = self.getElems(this.column, this.row);
					if (!elems.len) return;

					__activateElem(self, elems[0]);
				});
				self.map[y].push(b);
			}
		}
	self.grid.end();

	self.editorBox.applyRenderCache();

	lx.body.on('mouseup', function(e) {
		e.preventDefault();
		self.cursor.collapse();
	});
}

function __activateElem(self, elem) {
	if (self.activeElem) __deactivateElem(self, self.activeElem);
	self.activeElem = elem;

	var box = elem.getAvatarBox();
	box.style('z-index', 50);

	box.add(lx.Box, {
		key: 'delBut',
		geom: [null, '5px', '20px', '20px', '5px'],
		css: 'lxsc-delbut',
		click: function() {
			self.delElement(elem);
			self.activeElem = null;
		}
	});

	var moveBut = box.add(lx.Box, {
		key: 'moveBut',
		geom: ['5px', '5px', '20px', '20px'],
		css: 'lxsc-movebut'
	});
	moveBut.on('mousedown', function(e) {
		e.preventDefault();
		var cursor = new lxsc.MoveCursor(self, elem);
		cursor.move(e);
	});

	var resizeBut = box.add(lx.Box, {
		key: 'resizeBut',
		geom: [null, null, '20px', '20px', '5px', '5px'],
		css: 'lxsc-resizebut'
	});
	resizeBut.on('mousedown', function(e) {
		e.preventDefault();
		var cursor = new lxsc.MoveCursor(self, elem);
		cursor.resize(e);
	});
}

function __deactivateElem(self, elem) {
	var box = elem.getAvatarBox();
	box.style('z-index', null);
	box.del('delBut');
	box.del('moveBut');
	box.del('resizeBut');

	self.activeElem = null;
}
