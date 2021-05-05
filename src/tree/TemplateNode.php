<?php

namespace lx\template\tree;

use lx\template\tree\data\NodeData;
use lx\template\tree\parser\NodeConfigParser;

class TemplateNode
{
    const TYPE_COMMON = 'common';
    const TYPE_WIDGET = 'widget';
    const TYPE_CONTENT = 'content';

    private ?TemplateNode $parent = null;
    /** @var array<TemplateNode> */
    private array $children = [];

    private int $level;
    private string $type;
    private ?NodeData $data;

    public static function create(int $level = -1): TemplateNode
    {
        $node = new self();
        $node->level = $level;
        $node->type = self::TYPE_COMMON;
        $node->data = null;
        return $node;
    }

    public static function createByParsed(array $config): TemplateNode
    {
        $node = new self();
        $node->level = $config['indent'] ?? 0;
        $type = Factory::definyTypeByConfig($config);
        if (!$type) {
            $node->type = self::TYPE_COMMON;
            $node->data = null;
            return $node;
        }

        $node->type = $type;

        $parser = Factory::createParser($node->type);
        $data = $parser->parse($config);
        $node->data = Factory::createData($node->type);
        $node->data->init($data);
        return $node;
    }

    public static function createByArray(array $array): TemplateNode
    {
        $node = new self($array['level'] ?? -1, $array['type'] ?? self::TYPE_COMMON);
        if (!$node->isType(self::TYPE_COMMON) && array_key_exists('data', $array)) {
            $node->data = Factory::createData($node->type);
            $node->data->init($array['data']);
        }

        if (array_key_exists('children', $array)) {
            foreach ($array['children'] as $childData) {
                $child = self::createByArray($childData);
                $node->add($child);
            }
        }

        return $node;
    }

    protected function __construct(int $level = -1, string $type = self::TYPE_COMMON)
    {
        $this->level = $level;
        $this->type = $type;
        $this->data = null;
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

    public function toArrayWithChildren(): array
    {
        $result = ['type' => $this->type];
        if (!$this->isType(self::TYPE_COMMON)) {
            $result['data'] = $this->toArray();
        }
        
        if (!empty($this->children)) {
            $result['children'] = [];
            foreach ($this->children as $child) {
                $result['children'][] = $child->toArrayWithChildren();
            }
        }
        
        return $result;        
    }
    
    protected function setParent(TemplateNode $node): void
    {
        $this->parent = $node;
        $this->each(function (TemplateNode $node) {
            $node->level = $node->parent->getLevel() + 1;
        });
    }
}
