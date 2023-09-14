<?php

namespace lx\template\tree\parser;

class BlockParser extends NodeParser
{
    public function parse(array $config): array
    {
        $name = $config['widget'] ?? null;
        if ($name === null) {
            throw new \Exception('Wrong block definition');
        }
        
        return [
            'name' => $name,
        ];
    }
}
