<?php

namespace lx\template\tree\renderer;

class ForRenderer extends NodeRenderer
{
    protected function run(): string
    {
        $indent = str_repeat(self::INDENT, $this->node->getLevel());
        $def = $this->node->toArray();
        return $indent . $def['def'];
    }
}
