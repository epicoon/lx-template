<?php

namespace lx\template\tree\parser;

class TagParser extends WidgetParser
{
    public function parse(array $config): array
    {
        $result = parent::parse($config);
        $result['config']['tag'] = '\'' . $result['widget'] . '\'';
        $result['widget'] = 'lx.Box';
        return $result;
    }
}
