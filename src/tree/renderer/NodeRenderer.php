<?php

namespace lx\template\tree\renderer;

use lx\template\tree\TemplateNode;

abstract class NodeRenderer
{
    const INDENT = '    ';

    protected TemplateNode $node;
    protected bool $prettyMode;

    public function render(TemplateNode $node, bool $pretty): string
    {
        $this->node = $node;
        $this->prettyMode = $pretty;
        $this->code = '';
        return $this->run();
    }
    
    abstract protected function run(): string;
}
