#lx:namespace lxsc;
class Element {
	constructor(config) {
		this.avatarBox = config.avatarBox;
		this.originalBox = config.originalBox || null;
		this.boxData = config.boxData || null;

		this.positioning = config.positioning;
		this.positioning.elem = this;
	}

	destruct() {
		this.avatarBox.del();
	}

	actualizeGeom() {
		this.positioning.actualize();
	}

	getAvatarBox() {
		return this.avatarBox;
	}
	
	getBoxData() {
		return this.boxData;
	}
}
