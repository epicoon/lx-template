<?php

namespace lx\template\tree\parser;

class ContentConfigParser extends NodeConfigParser
{
    public function parse(array $config): array
    {
        $name = $config['widget'] ?? null;
        if ($name === null) {
            throw new \Exception('Wrong content definition');
        }
        
        return [
            'name' => $name,
        ];
    }
}
