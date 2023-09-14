<?php

namespace lx\template\tree;

use lx;
use lx\template\TemplateCompiler;
use lx\template\tree\compiler\ForCompiler;
use lx\template\tree\compiler\BlockCompiler;
use lx\template\tree\compiler\NodeCompiler;
use lx\template\tree\compiler\WidgetCompiler;
use lx\template\tree\data\DefaultData;
use lx\template\tree\data\NodeData;
use lx\template\tree\data\WidgetNodeData;
use lx\template\tree\data\BlockNodeData;
use lx\template\tree\parser\NodeParser;
use lx\template\tree\parser\ForParser;
use lx\template\tree\parser\WidgetParser;
use lx\template\tree\parser\BlockParser;
use lx\template\tree\parser\TagParser;
use lx\template\tree\renderer\ForRenderer;
use lx\template\tree\renderer\BlockRenderer;
use lx\template\tree\renderer\NodeRenderer;
use lx\template\tree\renderer\WidgetRenderer;
use lx\template\tree\renderer\TagRenderer;

class Factory
{
    private static array $widgetNames = [];
    
    public static function defineTypeByConfig(array $config): ?string
    {
        $widget = $config['widget'] ?? null;
        if ($widget === null) {
            return null;
        }

        if (preg_match('/^<for /', $widget)) {
            return TemplateNode::TYPE_FOR;
        }

        if (preg_match('/^<#/', $widget)) {
            return TemplateNode::TYPE_BLOCK;
        }

        // Prototype
        if (preg_match('/^<_/', $widget)) {
            return TemplateNode::TYPE_WIDGET;
        }

        $widgetNames = self::getWidgetNames();
        foreach ($widgetNames as $widgetName) {
            if (preg_match('/^<' . addcslashes($widgetName, '.') . '/', $widget)) {
                return TemplateNode::TYPE_WIDGET;
            }
        }
        
        return TemplateNode::TYPE_TAG;
    }
    
    public static function createParser(string $type): ?NodeParser
    {
        switch ($type) {
            case TemplateNode::TYPE_FOR: return new ForParser();
            case TemplateNode::TYPE_WIDGET: return new WidgetParser();
            case TemplateNode::TYPE_TAG: return new TagParser();
            case TemplateNode::TYPE_BLOCK: return new BlockParser();
        }
        return null;
    }
    
    public static function createData(string $type): NodeData
    {
        switch ($type) {
            case TemplateNode::TYPE_WIDGET:
            case TemplateNode::TYPE_TAG:
                return new WidgetNodeData();
            case TemplateNode::TYPE_BLOCK:
                return new BlockNodeData();
        }
        return new DefaultData();
    }

    public static function createRenderer(string $type): ?NodeRenderer
    {
        switch ($type) {
            case TemplateNode::TYPE_FOR: return new ForRenderer();
            case TemplateNode::TYPE_WIDGET: return new WidgetRenderer();
            case TemplateNode::TYPE_TAG: return new TagRenderer();
            case TemplateNode::TYPE_BLOCK: return new BlockRenderer();
        }
        return null;
    }

    public static function createCompiler(TemplateCompiler $compiler, string $type): ?NodeCompiler
    {
        switch ($type) {
            case TemplateNode::TYPE_FOR:
                return new ForCompiler($compiler);
            case TemplateNode::TYPE_WIDGET:
            case TemplateNode::TYPE_TAG:
                return new WidgetCompiler($compiler);
            case TemplateNode::TYPE_BLOCK:
                return new BlockCompiler($compiler);
        }
        return null;
    }
    
    private static function getWidgetNames(): array
    {
        if (empty(self::$widgetNames)) {
            $modulesInfo = lx::$app->jsModules->getModulesInfo();
            /** @var lx\JsModuleInfo $info */
            foreach ($modulesInfo as $info) {
                $classes = $info->getDocumentation();
                /** @var lx\JsClassDocumentation $classDoc */
                foreach ($classes as $classDoc) {
                    if ($classDoc->hasMarker('widget')) {
                        self::$widgetNames[] = $classDoc->getClassName();
                    }
                }
            }
        }

        return self::$widgetNames;
    }
}
