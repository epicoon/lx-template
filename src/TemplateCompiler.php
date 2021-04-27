<?php

namespace lx\template;

use lx\template\tree\compiler\NodeCompiler;
use lx\template\tree\Factory;
use lx\template\tree\TemplateNode;
use lx\template\tree\TemplateTree;

class TemplateCompiler
{
    private TemplateTree $tree;
    private string $code;
    private array $compilerMap;

    private bool $withOutput = false;
    private int $funcCounter = 0;
    private int $varCounter = 0;
    private array $funcMap = [];
    private array $widgets = [];

    public function __construct(TemplateTree $tree)
    {
        $this->tree = $tree;
        $this->code = '';
        $this->compilerMap = [];
    }

    public function init(TemplateTree $tree): void
    {
        $this->tree = $tree;
        $this->code = '';
    }

    public function compile(string $outputName = ''): string
    {
        $this->withOutput = ($outputName != '');

        $codeStart = ($this->withOutput)
            ? "const $outputName=(()=>{let __out__=new lx.HashMap();"
            : '(()=>{';

        $contentFuncs = '';
        foreach ($this->tree->getContents() as $contentName => $content) {
            $funcName = '_f' . $this->funcCounter++;
            $this->funcMap[$contentName] = $funcName;
            $funcCode = "function $funcName(){";
            $funcCode .= $this->compileNodes($content->getChildren());
            $funcCode .= "}";
            $contentFuncs .= $funcCode;
        }

        $children = $this->tree->getRootNode()->getChildren();
        $code = $this->compileNodes($children);


        $codeEnd = ($this->withOutput)
            ? "return __out__.toObject();})();"
            : '})();';

        $useWidgets = $this->getUseWidgets();
        $this->code = "$useWidgets$codeStart$contentFuncs$code$codeEnd";
        return $this->code;
    }

    /**
     * @param array<TemplateNode> $nodes
     * @return string
     */
    private function compileNodes(array $nodes): string
    {
        $code = '';
        foreach ($nodes as $node) {
            if ($node->isType(TemplateNode::TYPE_CONTENT)) {
                $def = $node->toArray();
                $name = $def['name'];
                $func = $this->funcMap[$name];
                $code .= "$func();";
                continue;
            }

            $varName = '_w' . $this->varCounter++;
            $code .= $this->compileWidget($node, $varName);

            $children = $node->getChildren();
            if (empty($children)) {
                continue;
            }

            $code .= "$varName.begin();";
            $code .= $this->compileNodes($node->getChildren());
            $code .= "$varName.end();";
        }

        return $code;
    }

    private function compileWidget(TemplateNode $node, string $varName): string
    {
        $compiler = $this->getCompiler($node);
        $nodeCode = $compiler->compile($node, $varName);

        $def = $node->toArray();
        $this->registerWidget($def['widget']);
        if ($this->withOutput && $def['var']) {
            $nodeCode .= "__out__.add('{$def['var']}',$varName);";
        }

        return $nodeCode;
    }

    private function registerWidget($widget)
    {
        if (in_array($widget, ['lx.Rect', 'lx.Box', 'lx.Input', 'lx.TextBox', 'lx.Textarea'])
            || in_array($widget, $this->widgets)) {
            return;
        }

        $this->widgets[] = $widget;
    }

    private function getUseWidgets(): string
    {
        if (empty($this->widgets)) {
            return '';
        }

        $result = '';
        foreach ($this->widgets as $widget) {
            $result .= "#lx:use $widget;";
        }
        return $result;
    }
    
    private function getCompiler(TemplateNode $node): NodeCompiler
    {
        $type = $node->getType();
        if (!array_key_exists($type, $this->compilerMap)) {
            $this->compilerMap[$type] = Factory::createCompiler($this, $type);
        }

        return $this->compilerMap[$type];
    }
}
