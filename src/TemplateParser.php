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
    private array $contents = [];
    private array $named = [];
    private array $elements = [];

    public function parse(string $text): ?TemplateTree
    {
        $this->rootNode = TemplateNode::create();
        $this->contents = [];
        $this->named = [];
        $this->elements = [];

        preg_match('/^(?:\r|\n|\r\n)(( |\t)*?)</', $text, $shift);
        $shift = $shift[1];

        $preg = '/(^|\r|\n|\r\n)' . $shift . '(<[\w\W]+?)(?=(\r|\n|\r\n)(\S|\s*$))/';
        preg_match_all($preg, $text, $matches);
        $blocks = $matches[2];
        foreach ($blocks as $block) {
            switch ($block[1]) {
                case '#': $this->contents[] = $block; break;
                case '^': $this->named[] = $block; break;
                case '@': $this->named[] = $block; break;
                default: $this->elements[] = $block; break;
            }
        }

        try {
            $this->processContents();
            $this->processNamed();
            $this->processElements();
        } catch (\Exception $exception) {
            $this->addError($exception->getMessage());
            return null;
        }

        return new TemplateTree($this->rootNode, $this->contents);
    }

    private function processContents(): void
    {
        $contents = [];
        foreach ($this->contents as $content) {
            $list = $this->splitText($content);
            $first = array_shift($list['list']);
            $key = $first['widget'];
            $contents[$key] = [
                'key' => $key,
                'content' => $list,
            ];
        }

        $contents = $this->sortContents($contents);
        $processedContents = [];
        foreach ($contents as $content) {
            $list = $content['content'];
            $rootNode = TemplateNode::create(0);
            $this->processElement($list, $rootNode, 0);
            $processedContents[$content['key']] = $rootNode;
        }

        $this->contents = $processedContents;
    }

    private function sortContents(array $contents): array
    {
        $dependencies = [];
        foreach ($contents as $content) {
            $level = [];
            foreach ($content['content']['list'] as $item) {
                if (preg_match('/^<#/', $item['widget']) && array_search($item['widget'], $level) === false) {
                    if (!in_array($item['widget'], array_keys($contents))) {
                        throw new \Exception("Undefined content block: {$item['widget']}");
                    }

                    $level[] = $item['widget'];
                }
            }
            $dependencies[$content['key']] = $level;
        }

        $map = [];
        foreach ($dependencies as $contentName => $dependenciesList) {
            foreach ($dependenciesList as $depContentName) {
                if ($contentName == $depContentName) {
                    throw new \Exception("Unavailable recursion in the content blocks: $contentName");
                }
            }

            if (!array_key_exists($contentName, $map)) {
                $map[$contentName] = [
                    'name' => $contentName,
                    'all' => false,
                    'dependencies' => $dependenciesList
                ];
            }
        }

        $findAllDependencies = function (&$content, &$inProcess) use ($map, &$findAllDependencies) {
            if (in_array($content['name'], $inProcess)) {
                throw new \Exception("Unavailable recursion in the content blocks: {$content['name']}");
            }

            if ($content['all']) {
                return $content['dependencies'];
            }

            $inProcess[] = $content['name'];

            $all = $content['dependencies'];
            foreach ($content['dependencies'] as $name) {
                $all = array_merge($all, $findAllDependencies($map[$name], $inProcess));
            }

            $content['dependencies'] = $all;
            $content['all'] = true;
            return $content['dependencies'];
        };

        foreach ($map as &$content) {
            $inProcess = [];
            $findAllDependencies($content, $inProcess);
        }
        unset($content);

        $map = array_values($map);

        $sortedContents = [];
        $count = count($map);
        $maxAttempts = ceil($count * ($count + 1) * 0.5);
        for ($i=0; $i<$count; $i++) {
            $content = $map[$i];
            $convenient = true;
            foreach ($content['dependencies'] as $depName) {
                if (!in_array($depName, array_keys($sortedContents))) {
                    $convenient = false;
                    break;
                }
            }

            if ($convenient) {
                $name = $content['name'];
                $sortedContents[$name] = $contents[$name];
                continue;
            }

            $map[] = $content;
            $count++;
            if ($count > $maxAttempts) {
                throw new \Exception('Wrong contents block dependencies');
            }
        }

        return $sortedContents;
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
            if ($indent < $currentIndent - 1 || $indent > $currentIndent + 1) {
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
