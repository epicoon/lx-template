<?php

namespace lx\template\tree\renderer;

use lx\template\tree\TemplateNode;

class BlockRenderer extends NodeRenderer
{
    protected function run(): void
    {
        $node = $this->node;
        $indent = str_repeat(self::INDENT, $node->getLevel());
        $def = $node->toArray();
        $this->code = $indent . $def['name'];
    }
}
