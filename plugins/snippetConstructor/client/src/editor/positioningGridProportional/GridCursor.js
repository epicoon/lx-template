#lx:namespace lxsc;
class GridCursor {
	#lx:const
		MODE_NONE = 0,
		MODE_SELECT = 1;

	constructor(grid) {
		this.mode = self::MODE_NONE;
		this.grid = grid;
		this.anchorFirst = null;
		this.anchorLast = null;
		this.elem = null;
	}

	isSelectioning() {
		return this.mode == self::MODE_SELECT;
	}

	setAnchor(gridCell) {
		this.anchorFirst = gridCell;
		this.mode = self::MODE_SELECT;
		this.elem = this.grid.createElement({gridCell});
	}

	actualize(gridCell) {
		if (this.mode == self::MODE_NONE) return;

		this.anchorLast = gridCell;
		this.elem.positioning.x0 = Math.min(this.anchorFirst.column, this.anchorLast.column);
		this.elem.positioning.x1 = Math.max(this.anchorFirst.column, this.anchorLast.column);
		this.elem.positioning.y0 = Math.min(this.anchorFirst.row, this.anchorLast.row);
		this.elem.positioning.y1 = Math.max(this.anchorFirst.row, this.anchorLast.row);
		this.elem.actualizeGeom();
	}

	collapse() {
		if (this.mode == self::MODE_NONE) return;

		this.grid.addElement(this.elem);
		this.elem = null;
		this.anchorFirst = null;
		this.anchorLast = null;
		this.mode = self::MODE_NONE;
	}
}
