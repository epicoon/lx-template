<?php

namespace lx\template\plugins\snippetConstructor\server;

use lx;
use lx\Directory;
use lx\File;
use lx\JsCompiler;
use lx\ServiceBrowser;
use lx\Plugin;
use lx\HttpResponseInterface;
use lx\Service;
use lx\template\TemplateRenderer;
use lx\template\TemplateParser;
use lx\template\tree\TemplateTree;

class Respondent extends \lx\Respondent
{
    public function loadReferences(): HttpResponseInterface
    {
        $widgets = [];
        $positioningStategies = [];
        $modulesInfo = lx::$app->jsModules->getModulesInfo();
        /** @var lx\JsModuleInfo $info */
        foreach ($modulesInfo as $info) {
            $classes = $info->getDocumentation();
            /** @var lx\JsClassDocumentation $classDoc */
            foreach ($classes as $classDoc) {
                if ($classDoc->hasMarker('widget')) {
                    $widgets[$classDoc->getClassName()] = $classDoc->toArray();
                    continue;
                }
                if ($classDoc->hasMarker('positioningStrategy')) {
                    $positioningStategies[$classDoc->getClassName()] = $classDoc->toArray();
                }
            }
        }

        return $this->prepareResponse([
            'widgetsReference' => $widgets,
            'positioningStrategies' => $positioningStategies,
        ]);
    }
    
    public function getPluginsList(): HttpResponseInterface
    {
        $services = ServiceBrowser::getServicesList();

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

    public function getPluginData(string $pluginName): HttpResponseInterface
    {
        $plugin = lx::$app->getPlugin($pluginName);
        if (!$plugin) {
            return $this->prepareWarningResponse("Plugin $pluginName not found");
        }

        $data = $this->getSnippetsList($plugin);
        return $this->prepareResponse($data);
    }

    public function getSnippetData(string $pluginName, string $snippetPath): HttpResponseInterface
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
        $compiler->setBuildModules(false);
        $code = $compiler->compileCode($code, $file->getPath());
        $dependencies = $compiler->getDependencies()->toArray();
        
        return $this->prepareResponse([
            'tree' => $tree->toArray(),
            'code' => $code,
            'dependencies' => $dependencies,
            'images' => (new lx\PluginAssetProvider($plugin))->getImagePaths(),
        ]);
    }
    
    public function actualizeSnippet(string $pluginName, string $snippetPath, array $map): HttpResponseInterface
    {
        return $this->prepareResponse(
            $this->recalculateSnippet($pluginName, $snippetPath, $map, false)
        );
    }

    public function saveSnippet(string $pluginName, string $snippetPath, array $map): HttpResponseInterface
    {
        return $this->prepareResponse(
            $this->recalculateSnippet($pluginName, $snippetPath, $map, true)
        );
    }

    public function createSnippetFile(string $pluginName, string $snippetPath, bool $isFolder): HttpResponseInterface
    {
        $plugin = lx::$app->getPlugin($pluginName);
        if (!$plugin) {
            return $this->prepareErrorResponse("Plugin $pluginName not found");
        }

        $file = $plugin->findFile($snippetPath);
        if ($file) {
            return $this->prepareErrorResponse($isFolder ? 'Folder already exists' : 'Snippet already exists');
        }

        if ($isFolder) {
            $plugin->directory->makeDirectory($snippetPath);
        } else {
            $file = $plugin->directory->makeFile($snippetPath);
            $file->getParentDir()->make();
            $file->put('');
        }

        return $this->prepareResponse('ok');
    }

    public function deleteSnippetFile(string $pluginName, string $snippetPath): HttpResponseInterface
    {
        $plugin = lx::$app->getPlugin($pluginName);
        if (!$plugin) {
            return $this->prepareErrorResponse("Plugin $pluginName not found");
        }

        $file = $plugin->findFile($snippetPath);
        if (!$file) {
            return $this->prepareErrorResponse('Snippet does not exist');
        }

        $file->remove();
        return $this->prepareResponse('ok');
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
            $fileNames = $dir->getContentTree([
                'fileMask' => '*.lxtpl',
                'findType' => Directory::FIND_NAME,
            ]);

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
        $renderer = new TemplateRenderer($tree);
        $tplCode = $renderer->render(true);

        $code = ($tplCode === '') ? '' : "#lx:tpl-begin;$tplCode#lx:tpl-end;";
        $compiler = new JsCompiler();
        $compiler->setBuildModules(false);
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
