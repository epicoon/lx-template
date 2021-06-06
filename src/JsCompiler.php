<?php

namespace lx\template;

use lx\DataFileInterface;
use lx\JsCompilerExtension;
use lx\template\TemplateCompiler;
use lx\template\TemplateParser;

class JsCompiler extends JsCompilerExtension
{
    public function afterCutComments(string $code, ?string $filePath = null): string
    {
        $reg = '/#lx:tpl-begin(?: as (\b.+?\b))?;([\w\W]+?)#lx:tpl-end;/';
        $code = preg_replace_callback($reg, function ($matches) {
            $out = $matches[1];
            $text = $matches[2];
            return $this->compile($text, $out);
        }, $code);

        $reg = '/#lx:tpl-function\s+?[^{]+?(?P<re>{((?>[^{}]+)|(?P>re))*})/';
        $code = preg_replace_callback($reg, function ($matches) {
            $tpl = trim($matches['re'], '{}');
            $result = $this->compile($tpl, 'result') . 'return result;';

            $code = $matches[0];
            $code = preg_replace('/^#lx:tpl-/', '', $code);
            $code = str_replace($tpl, $result, $code);
            return $code;
        }, $code);

        $reg = '/#lx:tpl-import ([^ ;]+?)(?: as (\b.+?\b))?;/';
        $parentDir = $filePath === null ? null : dirname($filePath) . '/';
        $code = preg_replace_callback($reg, function ($matches) use ($parentDir) {
            $fileName = $matches[1];
            if (!preg_match('/\.lxtpl$/', $fileName)) {
                $fileName .= '.lxtpl';
            }
            $fullPath = $this->getConductor()->getFullPath($fileName, $parentDir);
            if (!file_exists($fullPath)) {
                \lx::devLog(['_'=>[__FILE__,__CLASS__,__METHOD__,__LINE__],
                    '__trace__' => debug_backtrace(DEBUG_BACKTRACE_PROVIDE_OBJECT&DEBUG_BACKTRACE_IGNORE_ARGS),
                    'msg' => "File $filePath not found",
                    'origin_class' => static::class,
                ]);
                return '';
            }

            $text = file_get_contents($fullPath);
            $out = $matches[2];
            return $this->compile($text, $out);
        }, $code);

        return $code;
    }
    
    private function compile(string $text, string $out): string
    {
        $parser = new TemplateParser();
        $tree = $parser->parse($text);
        if ($parser->hasErrors()) {
            \lx::devLog(['_'=>[__FILE__,__CLASS__,__METHOD__,__LINE__],
                '__trace__' => debug_backtrace(DEBUG_BACKTRACE_PROVIDE_OBJECT&DEBUG_BACKTRACE_IGNORE_ARGS),
                'msg' => $parser->getFirstError(),
                'origin_class' => static::class,
            ]);
            return '';
        }

        $compiler = new TemplateCompiler($tree);
        return $compiler->compile($out);
    }
}
