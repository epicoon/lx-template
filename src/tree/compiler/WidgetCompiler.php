<?php

namespace lx\template\tree\compiler;

class WidgetCompiler extends NodeCompiler
{
    protected function run(): string
    {
        $def = $this->node->toArray();
        return $this->getInitCode($def)
            . $this->getMetaDataCode($def)
            . $this->getActionsCode($def);
    }

    private function getInitCode(array $def): string
    {
        $init = "new {$def['widget']}(";
        if ($def['id'] || $def['name'] || $def['key'] || $def['field']
            || $def['volume'] || !empty($def['css']) || !empty($def['config'])
        ) {
            $config = [];

            $fields = ['id', 'name', 'key', 'field'];
            foreach ($fields as $field) {
                if ($def[$field]) {
                    $val = $def[$field];
                    $val = preg_match('/^\{\{.+\}\}$/', $val)
                        ? trim($val, '}{')
                        : "'$val'";
                    $config[] = "$field:$val";
                }
            }

            if ($def['volume'] && !array_key_exists('geom', $def['config'])) {
                $config[] = 'geom:true';
            }

            if (!empty($def['css'])) {
                foreach ($def['css'] as &$item) {
                    $item = preg_match('/^\{\{.+\}\}$/', $item)
                        ? trim($item, '}{')
                        : "'$item'";
                }
                unset($item);
                $config[] = 'css:[' . implode(',', $def['css']) . ']';
            }

            $defConfig = $def['config'] ?? [];
            if ($def['inner'] != '') {
                $html = trim($def['inner'], '"');
                $html = preg_replace('/\{\{(.+?)\}\}/', '\'+$1+\'', $html);
                $defConfig['html'] = "'$html'";
            }
            if (!empty($defConfig)) {
                foreach ($defConfig as $key => $value) {
                    $config[] = "$key:$value";
                }
            }

            $init .= '{' . implode(',', $config) . '}';
        }
        $init .= ');';

        if ($def['var'] || $def['field'] || $def['key']
            || !empty($def['metaData'])
            || !empty($def['actions'])
            || !empty($this->node->getChildren())
        ) {
            $init = "var {$this->var}=" . $init;
        }

        return $init;
    }

    private function getMetaDataCode(array $def): string
    {
        if (empty($def['metaData'])) {
            return '';
        }

        $code = "{$this->var}.data={};";
        foreach ($def['metaData'] as $key => $value) {
            $code .= "{$this->var}.data['$key']=$value;";
        }

        return $code;
    }

    private function getActionsCode(array $def): string
    {
        if (empty($def['actions'])) {
            return '';
        }

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
