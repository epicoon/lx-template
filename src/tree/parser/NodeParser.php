<?php

namespace lx\template\tree\parser;

abstract class NodeParser
{
    abstract public function parse(array $config): array;
}
