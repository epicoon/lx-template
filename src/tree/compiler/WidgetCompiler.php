<?php

namespace lx\template\tree\compiler;

class WidgetCompiler extends NodeCompiler
{
    protected function run(): void
    {
        $node = $this->node;
        $def = $node->toArray();

        $code = $this->getInitCode($def);
        if (!empty($def['actions'])) {
            $code .= $this->getActionsCode($def);
        }
        
        $this->code = $code;
    }

    private function getInitCode(array $def): string
    {
        $init = "new {$def['widget']}(";
        if ($def['key'] || $def['volume'] || !empty($def['css']) || !empty($def['config'])) {
            $init .= '{';
            $config = [];
            if ($def['key']) {
                $config[] = "key:'{$def['key']}'";
            }
            if ($def['volume'] && !array_key_exists('geom', $def['config'])) {
                $config[] = 'geom:true';
            }
            if (!empty($def['css'])) {
                foreach ($def['css'] as &$item) {
                    $item = "'$item'";
                }
                unset($item);
                $config[] = 'css:[' . implode(',', $def['css']) . ']';
            }
            if (!empty($def['config'])) {
                foreach ($def['config'] as $key => $value) {
                    $config[] = "$key:$value";
                }
            }
            $init .= implode(',', $config) . '}';
        }
        $init .= ');';

        if ($def['var'] || !empty($def['actions']) || !empty($this->node->getChildren())) {
            $init = "var {$this->var}=" . $init;
        }

        return $init;
    }

    private function getActionsCode(array $def): string
    {
        $code = '';
        foreach ($def['actions'] as $action) {
            $code .= "{$this->var}." . $action['method'] . '(';
            if (!empty($action['args'])) {
                if ($action['argsType'] == 'list') {
                    $code .= implode(',', $action['args']);
                } else {
                    $args = [];
                    foreach ($action['args'] as $key => $value) {
                        $args[] = "$key:$value";
                    }
                    $code .= '{' . implode(',', $args) . '}';
                }
            }

            $code .= ');';
        }

        return $code;
    }
}
