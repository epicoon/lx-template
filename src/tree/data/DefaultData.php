<?php

namespace lx\template\tree\data;

class DefaultData extends NodeData
{
    private array $data = [];

    function init(array $data): void
    {
        $this->data = $data;
    }

    function merge(array $data): void
    {
        // pass
    }

    function toArray(): array
    {
        return $this->data;
    }
}
