<?php

namespace lx\template;

use lx\template\tree\Factory;
use lx\template\tree\renderer\NodeRenderer;
use lx\template\tree\TemplateNode;
use lx\template\tree\TemplateTree;

class TemplateRenderer
{
    private TemplateTree $tree;
    private string $code;
    private bool $prettyMode;
    /** @var array<NodeRenderer> */
    private array $rendererMap;

    public function __construct(TemplateTree $tree)
    {
        $this->tree = $tree;
        $this->code = '';
        $this->prettyMode = false;
        $this->rendererMap = [];
    }

    public function init(TemplateTree $tree): void
    {
        $this->tree = $tree;
        $this->code = '';
    }

    public function render($pretty = false): string
    {
        $this->code = '';
        $this->prettyMode = $pretty;
        $children = $this->tree->getRootNode()->getChildren();
        $this->renderNodes($children, $this->code);

        foreach ($this->tree->getContents() as $name => $content) {
            $code = $name;
            $this->renderNodes($content->getChildren(), $code);
            $this->code .= ($this->prettyMode ? (PHP_EOL . PHP_EOL) : PHP_EOL) . $code;
        }

        return $this->code;
    }

    /**
     * @param array<TemplateNode> $nodes
     */
    private function renderNodes(array $nodes, string &$code): void
    {
        foreach ($nodes as $node) {
            $this->renderNode($node, $code);
            $this->renderNodes($node->getChildren(), $code);
        }
    }

    private function renderNode(TemplateNode $node, string &$code): void
    {
        $renderer = $this->getRenderer($node);
        $code .= ($code == '')
            ? $renderer->render($node, $this->prettyMode)
            : (PHP_EOL . $renderer->render($node, $this->prettyMode));
    }

    private function getRenderer(TemplateNode $node): NodeRenderer
    {
        $type = $node->getType();
        if (!array_key_exists($type, $this->rendererMap)) {
            $this->rendererMap[$type] = Factory::createRenderer($type);
        }

        return $this->rendererMap[$type];
    }
}
