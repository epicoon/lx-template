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
}
