<?php

namespace lx\template\plugins\snippetConstructor\backend;

use lx\File;
use lx\JsCompiler;
use lx\PackageBrowser;
use lx\Plugin;
use lx\Service;
use lx\template\TemplateParser;
use lx\template\tree\TemplateTree;

class Respondent extends \lx\Respondent
{
    public function getPluginsList(): array
    {
        $services = PackageBrowser::getServicesList();

        $result = [];
        foreach ($services as $serviceName => $service) {
            $category = $service->getCategory();
            if (!array_key_exists($category, $result)) {
                $result[$category] = [];
            }

            $serviceData = $this->getPluginsData($service);
            if (!empty($serviceData)) {
                $result[$category][$serviceName] = $serviceData;
            }
        }

        return $result;
    }

    public function getPluginData(string $pluginName): array
    {
        $plugin = $this->app->getPlugin($pluginName);
        if (!$plugin) {
            return [
                'success' => false,
                'message' => "Plugin $pluginName not found",
            ];
        }

        $data = $this->getSnippetsList($plugin);
        return [
            'success' => true,
            'data' => $data,
        ];
    }

    public function getSnippetData(string $pluginName, string $snippetPath): array
    {
        $plugin = $this->app->getPlugin($pluginName);
        if (!$plugin) {
            return [
                'success' => false,
                'message' => "Plugin $pluginName not found",
            ];
        }

        $file = $plugin->findFile($snippetPath);
        if (!$file) {
            return [
                'success' => false,
                'message' => 'Snippet not found',
            ];
        }
        
        $text = $file->get();
        $parser = new TemplateParser();
        $tree = $parser->parse($text);
        if ($parser->hasErrors()) {
            return [
                'success' => false,
                'message' => $parser->getFirstError(),
            ];
        }

        $code = "#lx:tpl-begin;$text#lx:tpl-end;";
        $compiler = new JsCompiler();
        $code = $compiler->compileCode($code, $file->getPath());
        $dependencies = $compiler->getDependencies()->toArray();
        return [
            'success' => true,
            'data' => [
                'tree' => $tree->toArray(),
                'code' => $code,
                'dependencies' => $dependencies,
            ],
        ];
    }


    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * PRIVATE
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

    private function getPluginsData(Service $service): array
    {
        $plugins = $service->getStaticPlugins();
        $serviceData = [];
        foreach ($plugins as $pluginName => $plugin) {
            if (!empty($plugin->conductor->getSnippetDirectories())) {
                $serviceData[] = $pluginName;
            }
        }
        return $serviceData;
    }

    private function getSnippetsList(Plugin $plugin): array
    {
        $dirs = $plugin->conductor->getSnippetDirectories();
        $pluginData = [];
        foreach ($dirs as $dir) {
            $files = $dir->getAllFiles('*.lxtpl');
            $fileNames = [];
            /** @var File $file */
            foreach ($files as $file) {
                $fileNames[] = $file->getRelativePath($dir);
            }

            $pluginData[$dir->getName()] = $fileNames;
        }
        return $pluginData;
    }
}
