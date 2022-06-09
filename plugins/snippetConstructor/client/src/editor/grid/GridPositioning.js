#lx:namespace lxsc;
class GridPositioning extends lxsc.Positioning {
	constructor(grid, position) {
		super();
		this.grid = grid;
		this.x0 = position[0];
		this.y0 = position[1];
		this.x1 = position[2];
		this.y1 = position[3];
	}

	actualize() {
		let firstBox = this.grid.getBox(this.x0, this.y0),
			lastBox = this.grid.getBox(this.x1, this.y1),
			newW = lastBox.left('px') + lastBox.width('px') - firstBox.left('px'),
			newH = lastBox.top('px') + lastBox.height('px') - firstBox.top('px'),
			box = this.elem.getAvatarBox();
		box.left(firstBox.left('px') + 'px');
		box.top(firstBox.top('px') + 'px');
		box.width(newW + 'px');
		box.height(newH + 'px');
	}
}
