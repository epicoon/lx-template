#lx:namespace lxsc;
class ContentMap {
    #lx:const
        TYPE_ROOT = 'common',
        TYPE_WIDGET = 'widget',
        TYPE_BLOCK = 'block',
        TYPE_ROOT_BLOCK = 'rootBlock';
    
    constructor(snippetInfo, map) {
        this.core = snippetInfo.core;
        this.snippetInfo = snippetInfo;
        this.root = lx.Tree.uCreateFromObject(
            map.root,
            'children',
            (obj, node) => node.data = lxsc.BoxData.create(this, obj, node)
        );
        
        let blocks = [];
        for (let blockName in map.blocks) {
            let blockData = map.blocks[blockName];
            blockData.type = self::TYPE_ROOT_BLOCK;
            blockData.name = blockName;
            blocks.push(blockData);
        }
        this.blocks = lx.Tree.uCreateFromObject(
            {
                type: 'common',
                children: blocks
            },
            'children',
            (obj, node) => node.data = lxsc.BoxData.create(this, obj, node)
        );
    }
    
    getCore() {
        return this.core;
    }
    
    getPlugin() {
        return this.core.getPlugin();
    }

    getSnippetInfo() {
        return this.snippetInfo;
    }
    
    toMap() {
        let blocks = {};
        this.blocks.data.children.forEach(block=>{
            blocks[block.name] = block;
        });
        return { root: this.root.data.getBoxData(), blocks };
    }
    
    getRoot() {
        return this.root;
    }
    
    getBlocks() {
        return this.blocks;
    }

    getRootBlock(name) {
        for (let i in this.blocks.nodes) {
            let node = this.blocks.nodes[i];
            if (node.data.name == name)
                return node;
        }
        return null;
    }

    getPathesFromRoot(node) {
        switch (node.data.type) {
            case self::TYPE_WIDGET:
                return __inRoot.getWidgetPathes(this, node);
            case self::TYPE_BLOCK:
                return __inRoot.getBlockPathes(this, node);
        }
        return [];
    }

    getPathesFromBlock(node) {
        switch (node.data.type) {
            case self::TYPE_ROOT_BLOCK:
                return __inBlocks.getRootBlockPathes(this, node);
            case self::TYPE_WIDGET:
                return __inBlocks.getWidgetPathes(this, node);
            case self::TYPE_BLOCK:
                return __inBlocks.getBlockPathes(this, node);
        }

        return [];
    }

    createBoxDataBlank(type, data = {}) {
        return lxsc.BoxData.createBlank(type, this, data);
    }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * PRIVATE
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/**
 * @namespace __inRoot
 */
class __inRoot {
    static getWidgetPathes(self, node) {
        return [node.getIndexes()];
    }

    static getBlockPathes(self, node) {
        const rootBlock = self.getRootBlock(node.data.data.name);
        const blocksInRoot = [node];
        let pathes = [];
        for (let i in blocksInRoot) {
            let tempNode = blocksInRoot[i];
            let path = tempNode.getIndexes();

            let lastIndex = path.lxLast();
            for (let j=0, l=__getRootBlockSize(self, rootBlock); j<l; j++) {
                let tempPath = path.lxClone();
                tempPath[tempPath.len - 1] = lastIndex + j;
                pathes.push(tempPath);
            }
        }
        return pathes;
    }
}

/**
 * @namespace __inBlocks
 */
class __inBlocks {
    static getRootBlockPathes(self, node) {
        const blockPathes = this.__getRootBlockSelfPathes(self, node);
        return this.__spreadBlockPathes(self, node, blockPathes);
    }

    static getWidgetPathes(self, node) {
        let block = null;
        const path = node.getIndexes(root=>{
            if (block !== null) return true;
            if (root.data.type == lxsc.ContentMap.TYPE_ROOT_BLOCK)
                block = root;
        });
        const blockPathes = this.__getRootBlockSelfPathes(self, block);
        const result = [];
        for (let i in blockPathes) {
            result.push(__mergePathes(blockPathes[i], path));
        }
        return result;
    }

    static getBlockPathes(self, node) {
        const rootBlock = self.getRootBlock(node.data.data.name);
        const pathes = this.getWidgetPathes(self, node);
        return this.__spreadBlockPathes(self, rootBlock, pathes);
    }

    static __spreadBlockPathes(self, rootBlock, blockPathes) {
        const pathes = [];
        for (let i in blockPathes) {
            let path = blockPathes[i];
            let lastIndex = path.lxLast();
            for (let j=0, l=__getRootBlockSize(self, rootBlock); j<l; j++) {
                let tempPath = path.lxClone();
                tempPath[tempPath.len - 1] = lastIndex + j;
                pathes.push(tempPath);
            }
        }
        return pathes;
    }

    static __getRootBlockSelfPathes(self, node) {
        const pathes = [];
        const pathesMap = this.__getBlockPathesMap(self, node.data.name);
        for (let i in pathesMap) {
            let item = pathesMap[i];
            let nodesWithBlock = this.__getNodesWithBlock(self, item.blockName);
            for (let j in nodesWithBlock) {
                let tempNode = nodesWithBlock[j];
                let path = tempNode.getIndexes();
                pathes.push(__mergePathes(path, item.path));
            }
        }
        return pathes;
    }

    static __getNodesWithBlock(self, blockName) {
        let list = [];
        self.root.eachNode(tempNode=>{
            if (tempNode.data.type == lxsc.ContentMap.TYPE_BLOCK && tempNode.data.data.name == blockName)
                list.push(tempNode);
        });
        return list;
    }

    static __getBlockPathesMap(self, blockName) {
        const blocksMap = this.__getBlocksMap(self);
        const pathesMap = [{ blockName, path: [] }];
        function findPathes(nodes, path) {
            for (let i in nodes) {
                let node = nodes[i];
                let block = null;
                let indexes = node.getIndexes(root=>{
                    if (block !== null) return true;
                    if (root.data.type == lxsc.ContentMap.TYPE_ROOT_BLOCK)
                        block = root;
                });
                let name = block.data.name;
                indexes = path.len
                    ? __mergePathes(indexes, path)
                    : indexes;
                pathesMap.push({ blockName: name, path: indexes });
                if (name in blocksMap) findPathes(blocksMap[name], indexes);
            }
        }
        findPathes(blocksMap[blockName], []);
        return pathesMap;
    }

    static __getBlocksMap(self) {
        const blocksMap = {};
        self.blocks.eachNode(tempNode=>{
            if (tempNode.data.type == lxsc.ContentMap.TYPE_BLOCK) {
                let name = tempNode.data.data.name;
                if (!(name in blocksMap)) blocksMap[name] = [];
                blocksMap[name].push(tempNode);
            }
        });
        return blocksMap;
    }
}

function __getRootBlockSize(self, node) {
    let result = 0;
    for (let i in node.nodes) {
        let iNode = node.nodes[i];
        if (iNode.data.type == lxsc.ContentMap.TYPE_BLOCK)
            result += __getRootBlockSize(self, self.getRootBlock(iNode.data.data.name));
        else result += 1;
    }
    return result;
}

function __mergePathes(outher, inner) {
    if (!inner.len) return outher;
    let result = outher.lxClone();
    let lastIndex = result.lxLast();
    result[result.len - 1] += inner[0];
    for (let i=1, l=inner.len; i<l; i++)
        result.push(inner[i]);
    return result;
}
