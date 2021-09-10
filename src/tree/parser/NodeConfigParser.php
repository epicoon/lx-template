<?php

namespace lx\template\tree\parser;

abstract class NodeConfigParser
{
    abstract public function parse(array $config): array;
}
