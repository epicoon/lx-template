<?php

namespace lx\template\tree\renderer;

use lx\template\tree\TemplateNode;

abstract class NodeRenderer
{
    const INDENT = '    ';

    protected TemplateNode $node;
    protected bool $prettyMode;
    protected string $code;
    
    public function render(TemplateNode $node, bool $pretty): string
    {
        $this->node = $node;
        $this->prettyMode = $pretty;
        $this->code = '';
        $this->run();
        return $this->code;
    }
    
    abstract protected function run(): void;
}
