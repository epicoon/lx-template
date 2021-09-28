<?php

namespace lx\template\tree\renderer;

use lx\template\tree\TemplateNode;

class WidgetRenderer extends NodeRenderer
{
    protected function run(): void
    {
        $node = $this->node;
        $indent = str_repeat(self::INDENT, $node->getLevel());
        $def = $node->toArray();
        $widget = '<' . $def['widget'];
        if ($def['key'] || $def['volume'] || !empty($def['css'])) {
            $widget .= ':';
        }
        if ($def['key']) {
            $widget .= '@' . $def['key'];
        } elseif ($def['var']) {
            $widget .= '^' . $def['var'];
        } elseif ($def['field']) {
            $widget .= '{f}' . $def['field'];
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

        $this->code .= $indent . $widget
            . $this->renderConfig($node->getLevel(), $def['config'])
            . $this->renderActions($node->getLevel(), $def['actions']);
    }

    private function renderConfig(int $level, array $config): string
    {
        if (empty($config)) {
            return '';
        }

        $indent = $this->prettyMode
            ? PHP_EOL . str_repeat(self::INDENT, $level + 1)
            : '';

        $params = [];
        foreach ($config as $key => $value) {
            $params[] = "$key:$value";
        }
        $params = implode(($this->prettyMode?', ':','), $params);

        return "$indent($params)";
    }

    private function renderActions(int $level, array $actions): string
    {
        if (empty($actions)) {
            return '';
        }

        $indent = $this->prettyMode
            ? PHP_EOL . str_repeat(self::INDENT, $level + 1)
            : '';

        $actionsList = [];
        foreach ($actions as $action) {
            $args = [];
            if ($action['argsType'] == 'list') {
                $args = $action['args'];
            } else {
                foreach ($action['args'] as $key => $value) {
                    $args[] = "$key:$value";
                }
            }
            $args = implode(($this->prettyMode?', ':','), $args);
            $actionsList[] = ".{$action['method']}($args)";
        }

        $actionsCode = implode($indent, $actionsList);
        return "$indent$actionsCode";
    }
}
