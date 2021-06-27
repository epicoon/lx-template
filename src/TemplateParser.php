<?php

namespace lx\template;

use lx\template\tree\TemplateTree;
use lx\Vector;
use lx\StringHelper;
use lx\ErrorCollectorTrait;
use lx\template\tree\TemplateNode;

class TemplateParser
{
    use ErrorCollectorTrait;

    private TemplateNode $rootNode;
    private array $blocks = [];
    private array $named = [];
    private array $elements = [];

    public function parse(string $text): ?TemplateTree
    {
        $this->rootNode = TemplateNode::create();
        $this->blocks = [];
        $this->named = [];
        $this->elements = [];

        preg_match('/^(?:\r|\n|\r\n)(( |\t)*?)</', $text, $shift);
        $shift = $shift[1];
        if ($shift != '') {
            $text = preg_replace('/(^|\r|\n|\r\n)' . $shift . '/', '$1', $text);
        }

        $text .= PHP_EOL;
        $preg = '/(^|\r|\n|\r\n)(<[\w\W]+?)(?=(\r|\n|\r\n)(\S|\s*$))/';
        preg_match_all($preg, $text, $matches);
        $sections = $matches[2];
        foreach ($sections as $section) {
            switch ($section[1]) {
                case '#': $this->blocks[] = $section; break;
                case '^': $this->named[] = $section; break;
                case '@': $this->named[] = $section; break;
                default: $this->elements[] = $section; break;
            }
        }

        try {
            $this->processBlocks();
            $this->processNamed();
            $this->processElements();
        } catch (\Exception $exception) {
            $this->addError($exception->getMessage());
            return null;
        }

        return new TemplateTree($this->rootNode, $this->blocks);
    }

    private function processBlocks(): void
    {
        $blocks = [];
        foreach ($this->blocks as $block) {
            $list = $this->splitText($block);
            $first = array_shift($list['list']);
            $key = $first['widget'];
            $blocks[$key] = [
                'key' => $key,
                'block' => $list,
            ];
        }

        $blocks = $this->sortBlocks($blocks);
        $processedBlocks = [];
        foreach ($blocks as $block) {
            $list = $block['block'];
            $rootNode = TemplateNode::create(0);
            $this->processElement($list, $rootNode, 0);
            $processedBlocks[$block['key']] = $rootNode;
        }

        $this->blocks = $processedBlocks;
    }

    private function sortBlocks(array $blocks): array
    {
        $dependencies = [];
        foreach ($blocks as $block) {
            $level = [];
            foreach ($block['block']['list'] as $item) {
                if (preg_match('/^<#/', $item['widget']) && array_search($item['widget'], $level) === false) {
                    if (!in_array($item['widget'], array_keys($blocks))) {
                        throw new \Exception("Undefined block: {$item['widget']}");
                    }

                    $level[] = $item['widget'];
                }
            }
            $dependencies[$block['key']] = $level;
        }

        $map = [];
        foreach ($dependencies as $blockName => $dependenciesList) {
            foreach ($dependenciesList as $depBlockName) {
                if ($blockName == $depBlockName) {
                    throw new \Exception("Unavailable recursion in the blocks: $blockName");
                }
            }

            if (!array_key_exists($blockName, $map)) {
                $map[$blockName] = [
                    'name' => $blockName,
                    'all' => false,
                    'dependencies' => $dependenciesList
                ];
            }
        }

        $findAllDependencies = function (&$block, &$inProcess) use ($map, &$findAllDependencies) {
            if (in_array($block['name'], $inProcess)) {
                throw new \Exception("Unavailable recursion in the blocks: {$block['name']}");
            }

            if ($block['all']) {
                return $block['dependencies'];
            }

            $inProcess[] = $block['name'];

            $all = $block['dependencies'];
            foreach ($block['dependencies'] as $name) {
                $all = array_merge($all, $findAllDependencies($map[$name], $inProcess));
            }

            $block['dependencies'] = $all;
            $block['all'] = true;
            return $block['dependencies'];
        };

        foreach ($map as &$block) {
            $inProcess = [];
            $findAllDependencies($block, $inProcess);
        }
        unset($block);

        $map = array_values($map);

        $sortedBlocks = [];
        $count = count($map);
        $maxAttempts = ceil($count * ($count + 1) * 0.5);
        for ($i=0; $i<$count; $i++) {
            $block = $map[$i];
            $convenient = true;
            foreach ($block['dependencies'] as $depName) {
                if (!in_array($depName, array_keys($sortedBlocks))) {
                    $convenient = false;
                    break;
                }
            }

            if ($convenient) {
                $name = $block['name'];
                $sortedBlocks[$name] = $blocks[$name];
                continue;
            }

            $map[] = $block;
            $count++;
            if ($count > $maxAttempts) {
                throw new \Exception('Wrong block dependencies');
            }
        }

        return $sortedBlocks;
    }

    private function processNamed(): void
    {
        $named = [];
        foreach ($this->named as $item) {
            $arr = $this->splitText($item);

            $nameString = $arr['list'][0]['widget'];
            preg_match('/^<(?:@|\^)(\b.+?\b)/', $nameString, $matches);
            $name = $matches[1];
            $nameString = preg_replace('/^</', '<_:', $nameString);
            $arr['list'][0]['widget'] = $nameString;

            $node = TemplateNode::create();
            $this->processElement($arr, $node, 0);
            $named[$name] = $node;
        }

        $this->named = $named;
    }

    private function processElements(): void
    {
        foreach ($this->elements as $element) {
            $list = $this->splitText($element);
            $this->processElement($list, $this->rootNode, 0);
        }
    }

    private function processElement(array $list, TemplateNode $rootNode, int $indentShift): void
    {
        if (empty($list['list'])) {
            return;
        }

        $minIndent = $list['minIndent'];
        foreach ($list['list'] as &$item) {
            if ($item['indent'] == '') {
                $item['indent'] = 0;
            } else {
                $item['indent'] = substr_count($item['indent'], $minIndent) - $indentShift;
            }
        }
        unset($item);

        $nodeStack = new Vector();
        $nodeStack->push($rootNode);
        $currentIndent = $rootNode->getLevel();
        foreach ($list['list'] as $nodeConfig) {
            $indent = $nodeConfig['indent'];
            if ($indent > $currentIndent + 1) {
                throw new \Exception('Wrong template syntax: sequence error');
            }

            $node = TemplateNode::createByParsed($nodeConfig);
            if ($node->isType(TemplateNode::TYPE_WIDGET)) {
                $arr = $node->toArray();
                if ($arr['widget'] != '_' && $arr['var'] && array_key_exists($arr['var'], $this->named)) {
                    $ext = $this->named[$arr['var']]->getChild(0)->clone();
                    $node->merge($ext);
                }
            }

            while ($nodeStack->getLast()->getLevel() >= $indent) {
                $nodeStack->pop();
            }
            $nodeStack->getLast()->add($node);
            $nodeStack->push($node);
            $currentIndent = $indent;
        }
    }

    private function splitText(string $text)
    {
        $preg = '/(^|\s+)(<[^>]+?>)/';
        $arr = preg_split($preg, $text, null, PREG_SPLIT_DELIM_CAPTURE);

        $stepBlank = '';

        $stringData = [];
        $minIndent = null;
        $list = ['list' => []];
        foreach ($arr as $i => $item) {
            if (!$i) {
                continue;
            }

            $index = $i % 3;
            if ($index == 1) {
                $item = preg_replace('/^(\r|\n|\r\n)/', '', $item);
                $stringData = ['indent' => $item];
                if ($item != '' && ($minIndent === null || strlen($item) < strlen($minIndent))) {
                    $minIndent = $item;
                }
            } elseif ($index == 2) {
                $stringData['widget'] = StringHelper::smartReplace($item, [
                    'search' => '\s+',
                    'replacement' => '',
                    'save' => '"',
                ]);
            } else {
                $stringData['modif'] = StringHelper::smartReplace($item, [
                    'search' => '\s+',
                    'replacement' => '',
                    'save' => '"',
                ]);
                $list['list'][] = $stringData;
            }
        }

        $list['minIndent'] = $minIndent ?? '';

        return $list;
    }
}
