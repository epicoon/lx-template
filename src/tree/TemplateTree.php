<?php

namespace lx\template\tree;

class TemplateTree
{
    private TemplateNode $rootNode;
    /** @var array<TemplateNode> */
    private array $blocks;

    public function __construct(TemplateNode $rootNode, array $blocks)
    {
        $this->rootNode = $rootNode;
        $this->blocks = $blocks;
    }

    public function getRootNode(): TemplateNode
    {
        return $this->rootNode;
    }

    /**
     * @return array<TemplateNode>
     */
    public function getBlocks(): array
    {
        return $this->blocks;
    }
    
    public function toArray(): array
    {
        $blocks = [];
        foreach ($this->blocks as $name => $node) {
            $blocks[$name] = $node->toArrayWithChildren();
        }
        
        return [
            'root' => $this->rootNode->toArrayWithChildren(),
            'blocks' => $blocks,
        ];
    }

    public static function createFromArray(array $array): ?TemplateTree
    {
        $root = $array['root'] ?? null;
        if (!$root) {
            return null;
        }

        $blocks = $array['blocks'] ?? [];

        $node = TemplateNode::createByArray($root);
        foreach ($blocks as $name => &$block) {
            $block['level'] = 0;
            $block = TemplateNode::createByArray($block);
        }
        unset($block);

        return new self($node, $blocks);
    }
}
