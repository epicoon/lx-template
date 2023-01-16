<?php

namespace lx\template\tree\data;

use lx\ArrayHelper;

class WidgetNodeData extends NodeData
{
    private string $widget = '';
    private ?string $id = null;
    private ?string $name = null;
    private ?string $key = null;
    private ?string $var = null;
    private ?string $field = null;
    private array $css = [];
    private bool $isVolume = false;
    private array $config = [];
    private array $metaData = [];
    private array $actions = [];
    private string $inner = '';

    function init(array $data): void
    {
        $this->widget = $data['widget'];
        $this->id = $data['id'];
        $this->name = $data['name'];
        $this->key = $data['key'];
        $this->var = $data['var'];
        $this->field = $data['field'];
        $this->css = $data['css'];
        $this->isVolume = $data['volume'];
        $this->config = $data['config'];
        $this->metaData = $data['metaData'] ?? [];
        $this->actions = $data['actions'];
        $this->inner = $data['inner'] ?? '';
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

        $this->metaData = ArrayHelper::mergeRecursiveDistinct(
            $this->metaData,
            $data['metaData'] ?? [],
            true
        );

        $this->actions = ArrayHelper::mergeRecursiveDistinct(
            $this->actions,
            $data['actions'] ?? [],
            true
        );

        $this->inner .= $data['inner'] ?? '';
    }

    function toArray(): array
    {
        return [
            'widget' => $this->widget,
            'id' => $this->id,
            'name' => $this->name,
            'key' => $this->key,
            'var' => $this->var,
            'field' => $this->field,
            'css' => $this->css,
            'volume' => $this->isVolume,
            'config' => $this->config,
            'metaData' => $this->metaData,
            'actions' => $this->actions,
            'inner' => $this->inner,
        ];
    }
}
