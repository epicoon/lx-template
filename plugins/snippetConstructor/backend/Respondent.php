<?php

namespace lx\template\plugins\snippetConstructor\backend;

use lx\File;
use lx\PackageBrowser;
use lx\Plugin;
use lx\Service;
use lx\template\TemplateParser;

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

    public function getPluginData($pluginName): array
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

        return [
            'success' => true,
            'data' => [], //TODO $tree->toArray(),
        ];
    }


    /*******************************************************************************************************************
     * PRIVATE
     ******************************************************************************************************************/

    /**
     * @param Service $service
     * @return array
     */
    private function getPluginsData($service)
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

    /**
     * @param Plugin $plugin
     * @return array
     */
    private function getSnippetsList($plugin)
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
