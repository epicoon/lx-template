<?php

namespace lx\template\tree\renderer;

class TagRenderer extends WidgetRenderer
{
    protected function toArray(): array
    {
        $result = parent::toArray();
        $result['widget'] = trim($result['config']['tag'], '\'');
        unset($result['config']['tag']);
        return $result;
    }
}
