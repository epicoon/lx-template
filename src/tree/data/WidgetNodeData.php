<?php

namespace lx\template\tree\data;

use lx\ArrayHelper;

class WidgetNodeData extends NodeData
{
    private string $widget = '';
    private ?string $key = null;
    private ?string $var = null;
    private ?string $field = null;
    private array $css = [];
    private bool $isVolume = false;
    private array $config = [];
    private array $actions = [];

    function init(array $data): void
    {
        $this->widget = $data['widget'];
        $this->key = $data['key'];
        $this->var = $data['var'];
        $this->field = $data['field'];
        $this->css = $data['css'];
        $this->isVolume = $data['volume'];
        $this->config = $data['config'];
        $this->actions = $data['actions'];
    }

    function merge(array $data): void
    {
        $this->isVolume = $data['volume'];

        $this->css = ArrayHelper::mergeRecursiveDistinct(
            $this->css,
            $data['css'] ?? [],
            true
        );

        $this->config = ArrayHelper::mergeRecursiveDistinct(
            $this->config,
            $data['config'] ?? [],
            true
        );

        $this->actions = ArrayHelper::mergeRecursiveDistinct(
            $this->actions,
            $data['actions'] ?? [],
            true
        );
    }

    function toArray(): array
    {
        return [
            'widget' => $this->widget,
            'key' => $this->key,
            'var' => $this->var,
            'field' => $this->field,
            'css' => $this->css,
            'volume' => $this->isVolume,
            'config' => $this->config,
            'actions' => $this->actions,
        ];
    }
}
