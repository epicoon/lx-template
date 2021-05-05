<?php

namespace lx\template\tree;

class TemplateTree
{
    private TemplateNode $rootNode;
    /** @var array<TemplateNode> */
    private array $contents;

    public function __construct(TemplateNode $rootNode, array $contents)
    {
        $this->rootNode = $rootNode;
        $this->contents = $contents;
    }

    public function getRootNode(): TemplateNode
    {
        return $this->rootNode;
    }

    /**
     * @return array<TemplateNode>
     */
    public function getContents(): array
    {
        return $this->contents;
    }
    
    public function toArray(): array
    {
        $contents = [];
        foreach ($this->contents as $name => $node) {
            $contents[$name] = $node->toArrayWithChildren();
        }
        
        return [
            'root' => $this->rootNode->toArrayWithChildren(),
            'contents' => $contents,
        ];
    }

    public static function createFromArray(array $array): ?TemplateTree
    {
        $root = $array['root'] ?? null;
        if (!$root) {
            return null;
        }

        $contents = $array['contents'] ?? [];

        $node = TemplateNode::createByArray($root);
        foreach ($contents as $name => &$content) {
            $content['level'] = 0;
            $content = TemplateNode::createByArray($content);
        }
        unset($content);

        return new self($node, $contents);
    }
}
