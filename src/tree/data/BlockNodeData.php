<?php

namespace lx\template\tree\data;

class BlockNodeData extends NodeData
{
    private string $name;

    function init(array $data): void
    {
        $this->name = $data['name'];
    }

    function merge(array $data): void
    {
        // pass
    }

    function toArray(): array
    {
        return [
            'name' => $this->name,
        ];
    }
}
