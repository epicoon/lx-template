<?php

namespace lx\template\tree\parser;

use lx\StringHelper;

class WidgetConfigParser extends NodeConfigParser
{
    public function parse(array $config): array
    {
        $type = $config['widget'] ?? null;
        if ($type === null) {
            throw new \Exception('Wrong widget definition');
        }

        $type = trim($type, '<>');

        $initConfig = $this->extractMap('()', $type);
        $metaData = $this->extractMap('{}', $type);

        $preg = '/^(.+?)(?:\:|$)([^\.]+)?(.+|$)/';
        preg_match_all($preg, $type, $matches);

        $widget = $matches[1][0];
        $var = null;
        $field = null;
        $key = null;
        $def = ($matches[2][0] == '')
            ? null
            : $matches[2][0];
        if ($def) {
            $defList = preg_split('/(@|\^|\[[^}]+?\])/', $def, null, PREG_SPLIT_DELIM_CAPTURE);
            for ($i = 1, $l = count($defList); $i < $l; $i+=2) {
                $mark = $defList[$i];
                $value = $defList[$i + 1];
                if ($mark == '[f]' || $mark == '[field]') {
                    $field = $value;
                } elseif ($mark == '@') {
                    $key = $value;
                } elseif ($mark == '^') {
                    $var = $value;
                }
            }
        }

        $isVolume = false;
        if ($matches[3][0] == '') {
            $css = [];
        } else {
            $arr = explode('.', $matches[3][0]);
            array_shift($arr);
            $css = $arr;
            unset($arr);
            $index = array_search('_spread', $css);
            if ($index !== false) {
                $isVolume = true;
                unset($css[$index]);
                $css = array_values($css);
            }
        }
        unset($matches);

        $tail = $config['tail'] ?? '';
        $actions = $this->extractActions($tail);

        return [
            'widget' => $widget,
            'key' => $key,
            'field' => $field,
            'var' => $var,
            'css' => $css,
            'volume' => $isVolume,
            'config' => $initConfig,
            'metaData' => $metaData,
            'actions' => $actions,
            'inner' => $tail,
        ];
    }

    private function extractMap(string $parentheses, string &$type): array
    {
        $regexp = '/(?P<re>\\' . $parentheses[0] . '((?>[^\\' . $parentheses[0]
            . '\\' . $parentheses[1] . ']+)|(?P>re))*\\' . $parentheses[1] . ')(.*)/';
        preg_match($regexp, $type, $match);
        if (empty($match)) {
            return [];
        }

        $map = $match['re'];
        $type = str_replace($map, '', $type);

        $map = preg_replace('/^\\' . $parentheses[0] . '/', '', $map);
        $map = preg_replace('/\\' . $parentheses[1] . '$/', '', $map);
        $map = StringHelper::smartSplit($map, [
            'delimiter' => ',',
            'save' => ['()', '"', '[]', '{}'],
        ]);
        $temp = [];
        foreach ($map as $item) {
            if (strpos($item, ':') === false) {
                $temp[$item] = $item;
            } else {
                preg_match_all('/([^:]+?):(.+)/', $item, $matches);
                $temp[$matches[1][0]] = $matches[2][0];
                unset($matches);
            }
        }

        return $temp;
    }

    private function extractActions(string &$actions): array
    {
        if ($actions == '') {
            return [];
        }

        preg_match_all('/\.([\w_][\w\d_]*?)(?P<re>\(((?>[^\(\)]+)|(?P>re))*\))/', $actions, $matches);
        $actionsList = [];
        for ($i=0,$l=count($matches[1]); $i<$l; $i++) {
            $method = $matches[1][$i];
            $args = $matches['re'][$i];
            $actions = str_replace($matches[0][$i], '', $actions);
            if ($args == '()') {
                $actionsList[] = [
                    'method' => $method,
                    'argsType' => null,
                    'args' => [],
                ];
                continue;
            }

            $args = preg_replace('/^\(/', '', $args);
            $args = preg_replace('/\)$/', '', $args);
            $args = StringHelper::smartSplit($args, [
                'delimiter' => ',',
                'save' => ['()', '"', '[]', '{}'],
            ]);

            $argsType = 'list';
            foreach ($args as $arg) {
                if (preg_match('/^[\w_][\w\d_]*:/', $arg)) {
                    $argsType = 'object';
                }
            }
            if ($argsType == 'object') {
                $temp = [];
                foreach ($args as $arg) {
                    preg_match_all('/([^:]+?):(.+)/', $arg, $arr);
                    $temp[$arr[1][0]] = $arr[2][0];
                }
                $args = $temp;
            }

            $actionsList[] = [
                'method' => $method,
                'argsType' => $argsType,
                'args' => $args,
            ];
        }

        return $actionsList;
    }
}
