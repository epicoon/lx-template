#lx:namespace lxsc;
class ElementsCollection {
	constructor() {
		this.list = [];
	}

	add(elem) {
		this.list.push(elem);
	}

	del(elem) {
		this.list.lxRemove(elem);
	}

	forEach(func) {
		this.list.forEach(func);
	}
}
