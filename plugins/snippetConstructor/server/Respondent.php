<?php

namespace lx\template\plugins\snippetConstructor\server;

use lx;
use lx\File;
use lx\JsCompiler;
use lx\PackageBrowser;
use lx\Plugin;
use lx\ResponseInterface;
use lx\Service;
use lx\template\TemplateParser;
use lx\template\tree\TemplateTree;

class Respondent extends \lx\Respondent
{
    public function test($map): ResponseInterface
    {
        $tree = TemplateTree::createFromArray($map);
        $renderer = new lx\template\TemplateRenderer($tree);
        $code = $renderer->render();


        $e = 1;
        
        
        return $this->prepareResponse('ok');
    }

    public function loadReferences(): ResponseInterface
    {
        $result = [];

        $widgets = [];
        $modules = lx\ModuleDocParser::parseAll();
        foreach ($modules as $moduleName => $classes) {
            foreach ($classes as $className => $classDefinition) {
                if (empty($classDefinition['doc']) || !array_key_exists('widget', $classDefinition['doc'])) {
                    continue;
                }
                $widgets[$className] = $classDefinition;
            }
        }
        $result['widgetsReference'] = $widgets;

        return $this->prepareResponse($result);
    }
    
    public function getPluginsList(): ResponseInterface
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

        return $this->prepareResponse($result);
    }

    public function getPluginData(string $pluginName): ResponseInterface
    {
        $plugin = lx::$app->getPlugin($pluginName);
        if (!$plugin) {
            return $this->prepareWarningResponse("Plugin $pluginName not found");
        }

        $data = $this->getSnippetsList($plugin);
        return $this->prepareResponse($data);
    }

    public function getSnippetData(string $pluginName, string $snippetPath): ResponseInterface
    {
        $plugin = lx::$app->getPlugin($pluginName);
        if (!$plugin) {
            return $this->prepareWarningResponse("Plugin $pluginName not found");
        }

        $file = $plugin->findFile($snippetPath);
        if (!$file) {
            return $this->prepareWarningResponse('Snippet not found');
        }
        
        $text = $file->get();
        $parser = new TemplateParser();
        $tree = $parser->parse($text);
        if ($parser->hasFlightRecords()) {
            return $this->prepareWarningResponse($parser->getFirstFlightRecord());
        }

        $code = "#lx:tpl-begin;$text#lx:tpl-end;";
        $compiler = new JsCompiler();
        $code = $compiler->compileCode($code, $file->getPath());
        $dependencies = $compiler->getDependencies()->toArray();
        
        return $this->prepareResponse([
            'tree' => $tree->toArray(),
            'code' => $code,
            'dependencies' => $dependencies,
            'images' => $plugin->getImagePathes(),
        ]);
    }
    
    public function actualizeSnippet(string $pluginName, string $snippetPath, array $map): ResponseInterface
    {
        return $this->prepareResponse(
            $this->recalculateSnippet($pluginName, $snippetPath, $map, false)
        );
    }

    public function saveSnippet(string $pluginName, string $snippetPath, array $map): ResponseInterface
    {
        return $this->prepareResponse(
            $this->recalculateSnippet($pluginName, $snippetPath, $map, true)
        );
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

    private function recalculateSnippet(string $pluginName, string $snippetPath, array $map, bool $update): array
    {
        $plugin = lx::$app->getPlugin($pluginName);
        if (!$plugin) {
            return $this->prepareWarningResponse("Plugin $pluginName not found");
        }

        $file = $plugin->findFile($snippetPath);
        if (!$file) {
            return $this->prepareWarningResponse('Snippet not found');
        }

        $tree = TemplateTree::createFromArray($map);
        $renderer = new lx\template\TemplateRenderer($tree);
        $tplCode = $renderer->render(true);

        $code = "#lx:tpl-begin;$tplCode#lx:tpl-end;";
        $compiler = new JsCompiler();
        $code = $compiler->compileCode($code, $file->getPath());
        $dependencies = $compiler->getDependencies()->toArray();

        if ($update) {
            $file->put($tplCode);
        }

        return [
            'tree' => $tree->toArray(),
            'code' => $code,
            'dependencies' => $dependencies,
        ];
    }
}
