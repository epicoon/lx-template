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
        $modif = $config['modif'] ?? [];

        $type = trim($type, '<>');
        $preg = '/^(.+?)(?:\:|$)((?:@|\^)[^\.]+)?(.+|$)/';
        preg_match_all($preg, $type, $matches);

        $widget = $matches[1][0];
        $var = null;
        $key = ($matches[2][0] == '')
            ? null
            : $matches[2][0];
        if ($key) {
            if ($key[0] == '@') {
                $key = trim($key, '@');
                $var = $key;
            } elseif ($key[0] == '^') {
                $var = trim($key, '^');
                $key = null;
            } else {
                $key = null;
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
            $index = array_search('_vol', $css);
            if ($index !== false) {
                $isVolume = true;
                unset($css[$index]);
                $css = array_values($css);
            }
        }
        unset($matches);

        $result = [
            'widget' => $widget,
            'key' => $key,
            'var' => $var,
            'css' => $css,
            'volume' => $isVolume,
            'config' => [],
            'actions' => [],
        ];

        if ($modif == '') {
            return $result;
        }

        if ($modif[0] == '(') {
            $regexp = '/(?P<re>\(((?>[^\(\)]+)|(?P>re))*\))(.*)/';
            preg_match_all($regexp, $modif, $matches);
            $config = $matches['re'][0];
            unset($matches);
            $actions = str_replace($config, '', $modif);

            $config = preg_replace('/^\(/', '', $config);
            $config = preg_replace('/\)$/', '', $config);
            $config = StringHelper::smartSplit($config, [
                'delimiter' => ',',
                'save' => ['()', '"', '[]', '{}'],
            ]);
            $temp = [];
            foreach ($config as $item) {
                preg_match_all('/([^:]+?):(.+)/', $item, $matches);
                $temp[$matches[1][0]] = $matches[2][0];
                unset($matches);
            }
            $config = $temp;
        } else {
            $config = [];
            $actions = $modif;
        }

        preg_match_all('/\.([\w_][\w\d_]*?)(?P<re>\(((?>[^\(\)]+)|(?P>re))*\))/', $actions, $matches);
        $actions = [];
        for ($i=0,$l=count($matches[1]); $i<$l; $i++) {
            $method = $matches[1][$i];
            $args = $matches['re'][$i];
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

            $actions[] = [
                'method' => $method,
                'argsType' => $argsType,
                'args' => $args,
            ];
        }

        $result['config'] = $config;
        $result['actions'] = $actions;
        return $result;
    }
}
