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

        $func = 'function _out(key,name){if(!(key in __out__)){__out__[key]=name;}else{'
            .'if(!lx.isArray(__out__[key]))__out__[key]=[__out__[key]];'
            .'__out__[key].push(name)}}';
        $codeStart = ($this->withOutput)
            ? "const $outputName=(()=>{let __out__={};$func"
            : '(()=>{';

        $blockFuncs = '';
        foreach ($this->tree->getBlocks() as $blockName => $block) {
            $funcName = '_f' . $this->funcCounter++;
            $this->funcMap[$blockName] = $funcName;
            $funcCode = "function $funcName(){";
            $funcCode .= $this->compileNodes($block->getChildren());
            $funcCode .= "}";
            $blockFuncs .= $funcCode;
        }

        $children = $this->tree->getRootNode()->getChildren();
        $code = $this->compileNodes($children);

        $codeEnd = ($this->withOutput)
            ? "return __out__;})();"
            : '})();';

        $useWidgets = $this->getUseWidgets();
        $this->code = "$useWidgets$codeStart$blockFuncs$code$codeEnd";
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
            switch (true) {
                case $node->isType(TemplateNode::TYPE_BLOCK):
                    $code .= $this->compileBlock($node);
                    break;

                case $node->isType(TemplateNode::TYPE_WIDGET):
                case $node->isType(TemplateNode::TYPE_TAG):
                    $code .= $this->compileWidget($node);
                    break;

                case $node->isType(TemplateNode::TYPE_FOR):
                    $code .= $this->compileFor($node);
                    break;
            }
        }

        return $code;
    }

    private function compileBlock(TemplateNode $node): string
    {
        $def = $node->toArray();
        $name = $def['name'];
        $func = $this->funcMap[$name];
        return "$func();";
    }

    private function compileWidget(TemplateNode $node): string
    {
        $varName = '_w' . $this->varCounter++;

        $compiler = $this->getCompiler($node);
        $nodeCode = $compiler->compile($node, $varName);

        $def = $node->toArray();
        $this->registerWidget($def['widget']);
        if ($this->withOutput) {
            if ($def['field']) {
                $nodeCode .= $this->getOutString($def['field'], $varName);
            }
            if ($def['key'] && $def['key'] !== $def['field']) {
                $nodeCode .= $this->getOutString($def['key'], $varName);
            }
            if ($def['var'] && $def['var'] !== $def['key']) {
                $nodeCode .= $this->getOutString($def['var'], $varName);
            }
        }

        $children = $node->getChildren();
        if (empty($children)) {
            return $nodeCode;
        }

        if ($node->getLevel() == 0) {
            $nodeCode .= "$varName.useRenderCache();";
        }
        $nodeCode .= "$varName.begin();";
        $nodeCode .= $this->compileNodes($children);
        $nodeCode .= "$varName.end();";
        if ($node->getLevel() == 0) {
            $nodeCode .= "$varName.applyRenderCache();";
        }

        return $nodeCode;
    }

    private function compileFor(TemplateNode $node): string
    {
        $children = $node->getChildren();
        if (empty($children)) {
            return '';
        }

        $def = $node->toArray();
        $var = $def['var'];
        $from = $def['from'];
        $to = $def['to'];

        $nodeCode = "for (let $var=$from, _lxcount=$to; $var<=_lxcount; $var++) {";
        $nodeCode .= $this->compileNodes($children);
        $nodeCode .= '}';

        return $nodeCode;
    }

    private function getOutString(string $key, string $varName): string
    {
        return "_out('{$key}',$varName);";
    }

    private function registerWidget($widget)
    {
        if (in_array($widget, ['lx.Rect', 'lx.Box', 'lx.TextBox'])
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
