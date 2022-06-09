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
            ? "const $outputName=(()=>{let __out__={};"
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
            if ($node->isType(TemplateNode::TYPE_BLOCK)) {
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

            if ($node->getLevel() == 0) {
                $code .= "$varName.useRenderCache();";
            }
            $code .= "$varName.begin();";
            $code .= $this->compileNodes($node->getChildren());
            $code .= "$varName.end();";
            if ($node->getLevel() == 0) {
                $code .= "$varName.applyRenderCache();";
            }
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

        return $nodeCode;
    }
    
    private function getOutString(string $key, string $varName): string
    {
        return "if(!('{$key}' in __out__)){__out__['{$key}']=$varName;}else{"
            ."if(!lx.isArray(__out__['{$key}']))__out__['{$key}']=[__out__['{$key}']];"
            ."__out__['{$key}'].push($varName)}";
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
