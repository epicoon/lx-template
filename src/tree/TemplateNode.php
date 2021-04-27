<?php

namespace lx\template\tree;

use lx\template\tree\data\NodeData;
use lx\template\tree\parser\NodeConfigParser;

class TemplateNode
{
    const TYPE_WIDGET = 'widget';
    const TYPE_CONTENT = 'content';

    private ?TemplateNode $parent = null;
    /** @var array<TemplateNode> */
    private array $children = [];

    private int $level;
    private string $type;
    private NodeData $data;

    public function __construct(?array $config = null)
    {
        if ($config === null) {
            $this->level = -1;
            return;
        }
        
        $this->level = $config['indent'] ?? 0;
        $type = Factory::definyTypeByConfig($config);
        if (!$type) {
            return;
        }

        $this->type = $type;

        $parser = Factory::createParser($this->type);
        $data = $parser->parse($config);
        $this->data = Factory::createData($this->type);
        $this->data->init($data);
    }
    
    public function isRoot(): bool
    {
        return $this->parent === null;
    }
    
    public function isType($type): bool
    {
        return $this->type == $type;
    }
    
    public function getType(): string
    {
        return $this->type;
    }

    public function add(TemplateNode $node): void
    {
        $this->children[] = $node;
        $node->setParent($this);
    }

    public function getLevel(): int
    {
        return $this->level;
    }
    
    public function getParent(): TemplateNode
    {
        return $this->parent;
    }

    /**
     * @return array<TemplateNode>
     */
    public function getChildren(): array
    {
        return $this->children;
    }
    
    public function getChild($index): ?TemplateNode
    {
        return $this->children[$index] ?? null;
    }

    public function each(callable $callback): void
    {
        $callback($this);
        foreach ($this->children as $child) {
            $child->each($callback);
        }
    }

    public function clone(): TemplateNode
    {
        $node = new self();
        $node->level = $this->level;
        $node->type = $this->type;
        $node->data = Factory::createData($this->type);
        $node->data->init($this->data->toArray());

        foreach ($this->children as $child) {
            $childClone = $child->clone();
            $node->add($childClone);
        }

        return $node;
    }

    public function merge(TemplateNode $node): void
    {
        $children = $node->getChildren();
        foreach ($children as $child) {
            $child->setParent($this);
        }
        $this->children = array_merge($this->children, $children);
        
        $arr = $node->toArray();
        $this->data->merge($arr);
    }
    
    public function toArray(): array
    {
        return $this->data->toArray();
    }
    
    protected function setParent(TemplateNode $node): void
    {
        $this->parent = $node;
        $this->each(function (TemplateNode $node) {
            $node->level = $node->parent->getLevel() + 1;
        });
    }
}
