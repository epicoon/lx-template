<?php

namespace lx\template\tree\parser;

class ForParser extends NodeParser
{
    public function parse(array $config): array
    {
        $def = $config['widget'] ?? null;
        if ($def === null) {
            throw new \Exception('Wrong "for" definition');
        }

        $def = trim($def, '><');
        $def = preg_split('/\s+/', $def);

        /* for 1 to 10
         * for i = 1 to 10
         * for 4 times
         * for 4 times as i
         */
        $version = $def[2] ?? null;
        if ($version === null) {
            throw new \Exception('Wrong "for" definition');
        }

        $var = null;
        $from = null;
        $to = null;
        if ($version == '=') {
            $var = $def[1] ?? null;
            $from = $def[3] ?? null;
            $to = $def[5] ?? null;
        } elseif ($version == 'to') {
            $var = '_lxi';
            $from = $def[1] ?? null;
            $to = $def[3] ?? null;
        } elseif ($version == 'times') {
            $var = $def[4] ?? '_lxi';
            $from = 0;
            $to = $def[1] ?? null;
            if ($to !== null) {
                $to--;
            }
        }

        if ($var === null || $from === null || $to === null) {
            throw new \Exception('Wrong "for" definition');
        }

        return [
            'def' => $config['widget'],
            'var' => $var,
            'from' => $from,
            'to' => $to,
        ];
    }
}
