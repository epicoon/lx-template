<?php

namespace lx\template\tree;

use lx\template\TemplateCompiler;
use lx\template\tree\compiler\ContentCompiler;
use lx\template\tree\compiler\NodeCompiler;
use lx\template\tree\compiler\WidgetCompiler;
use lx\template\tree\data\NodeData;
use lx\template\tree\data\WidgetNodeData;
use lx\template\tree\data\ContentNodeData;
use lx\template\tree\parser\NodeConfigParser;
use lx\template\tree\parser\WidgetConfigParser;
use lx\template\tree\parser\ContentConfigParser;
use lx\template\tree\renderer\ContentRenderer;
use lx\template\tree\renderer\NodeRenderer;
use lx\template\tree\renderer\WidgetRenderer;

class Factory
{
    public static function definyTypeByConfig(array $config): ?string
    {
        $widget = $config['widget'] ?? null;
        if ($widget === null) {
            return null;
        }
        
        if (preg_match('/^<#/', $widget)) {
            return TemplateNode::TYPE_CONTENT;
        }
        
        return TemplateNode::TYPE_WIDGET;
    }
    
    public static function createParser(string $type): ?NodeConfigParser
    {
        switch ($type) {
            case TemplateNode::TYPE_WIDGET: return new WidgetConfigParser();
            case TemplateNode::TYPE_CONTENT: return new ContentConfigParser();
        }
        return null;
    }
    
    public static function createData(string $type): ?NodeData
    {
        switch ($type) {
            case TemplateNode::TYPE_WIDGET: return new WidgetNodeData();
            case TemplateNode::TYPE_CONTENT: return new ContentNodeData();
        }
        return null;
    }

    public static function createRenderer(string $type): ?NodeRenderer
    {
        switch ($type) {
            case TemplateNode::TYPE_WIDGET: return new WidgetRenderer();
            case TemplateNode::TYPE_CONTENT: return new ContentRenderer();
        }
        return null;
    }

    public static function createCompiler(TemplateCompiler $compiler, string $type): ?NodeCompiler
    {
        switch ($type) {
            case TemplateNode::TYPE_WIDGET: return new WidgetCompiler($compiler);
            case TemplateNode::TYPE_CONTENT: return new ContentCompiler($compiler);
        }
        return null;
    }
}
