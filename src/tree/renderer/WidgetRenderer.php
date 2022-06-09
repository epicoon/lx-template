<?php

namespace lx\template\tree\renderer;

use lx\template\tree\TemplateNode;

class WidgetRenderer extends NodeRenderer
{
    private $lenLimit = 121;

    protected function run(): void
    {
        $node = $this->node;
        $def = $node->toArray();

        $indent = str_repeat(self::INDENT, $node->getLevel());
        $widget = $this->renderWidget($def);

        $this->code = $indent . $widget;

        $config = $this->renderConfig($def['config']);
        if ($this->prettyMode && $config !== '') {
            if (mb_strlen($this->code) + mb_strlen($config) <= $this->lenLimit) {
                $this->code .= $config;
            } else {
                $this->code .= PHP_EOL . $indent . self::INDENT . $config;
            }
        } else {
            $this->code .= $config;
        }

        list($actions, $positioning) = $this->renderActions($def['actions']);
        if ($actions) {
            if ($this->prettyMode) {
                $this->code .= PHP_EOL;
                $row = $indent . self::INDENT;
                foreach ($actions as $action) {
                    if (mb_strlen($row) + mb_strlen($action) <= $this->lenLimit) {
                        $row .= $action;
                    } else {
                        $this->code .= $row;
                        $row = $indent . self::INDENT . $action;
                    }
                }
                $this->code .= $row;
            } else {
                $this->code .= implode('', $actions);
            }
        }
        if ($positioning) {
            if ($this->prettyMode) {
                $this->code .= PHP_EOL . $indent . self::INDENT . $positioning;
            } else {
                $this->code .= $positioning;
            }
        }
    }

    private function renderWidget(array $def): string
    {
        $widget = '<' . $def['widget'];
        if ($def['field'] || $def['key'] || $def['var'] || $def['volume'] || !empty($def['css'])) {
            $widget .= ':';
        }

        if ($def['field']) {
            $widget .= '{f}' . $def['field'];
        }
        if ($def['key'] && $def['key'] !== $def['field']) {
            $widget .= '@' . $def['key'];
        }
        if ($def['var'] && $def['var'] !== $def['key']) {
            $widget .= '^' . $def['var'];
        }

        if ($def['volume']) {
            $widget .= '._vol';
        }
        if (!empty($def['css'])) {
            foreach ($def['css'] as $css) {
                $widget .= '.' . $css;
            }
        }
        $widget .= '>';
        return $widget;
    }

    private function renderConfig(array $config): string
    {
        if (empty($config)) {
            return '';
        }

        $params = [];
        foreach ($config as $key => $value) {
            $params[] = "$key:$value";
        }
        return '(' . implode(($this->prettyMode?', ':','), $params) . ')';
    }

    private function renderActions(array $actions): array
    {
        if (empty($actions)) {
            return [null, null];
        }

        //TODO размечать методы стратегий позиционирования в доках и брать инфу оттуда
        $posNames = [
            'align',
            'stream',
            'streamProportional',
            'streamAutoSize',
            'grid',
            'gridProportional',
            'gridStream',
            'gridAdaptive',
            'slot'
        ];

        $actionsList = [];
        $positioning = null;
        foreach ($actions as $action) {
            $args = [];
            if ($action['argsType'] == 'list') {
                $args = $action['args'];
            } else {
                foreach ($action['args'] as $key => $value) {
                    $args[] = "$key:$value";
                }
            }
            $method = $action['method'];
            $args = implode(($this->prettyMode?', ':','), $args);
            $str = ".{$method}({$args})";
            in_array($method, $posNames)
                ? $positioning = $str
                : $actionsList[] = $str;
        }

        return [$actionsList, $positioning];
    }
}
