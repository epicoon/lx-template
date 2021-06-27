<?php

namespace lx\template\tree\parser;

class BlockConfigParser extends NodeConfigParser
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
