<?php

namespace lx\template\tree\compiler;

use lx\template\TemplateCompiler;
use lx\template\tree\TemplateNode;

abstract class NodeCompiler
{
    protected TemplateCompiler $templateCompiler;
    protected TemplateNode $node;
    protected string $var;
    protected string $code;
    
    public function __construct(TemplateCompiler $templateCompiler)
    {
        $this->templateCompiler = $templateCompiler;
    }

    public function compile(TemplateNode $node, string $var): string
    {
        $this->node = $node;
        $this->var = $var;
        $this->code = '';
        $this->run();
        return $this->code;
    }

    abstract protected function run(): void;
}
