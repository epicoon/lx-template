<?php

namespace lx\template\tree\data;

abstract class NodeData
{
    abstract function init(array $data): void;
    abstract function merge(array $data): void;
    abstract function toArray(): array;
}
