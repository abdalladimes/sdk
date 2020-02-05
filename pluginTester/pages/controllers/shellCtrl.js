/**
 * Created by Daniel on 7/10/2015.
 */


$app.controller('shellCtrl', ['$rootScope', '$scope', '$routeParams', '$sce', '$http', function ($rootScope, $scope, $routeParams, $sce, $http) {
        window.$http = $http;
        var config = null;
        $scope.link = {
            deeplinkData: ""
        };
        $scope.currentUser = window.currentUser;

        $scope.loadWebpackFrames = function(config) {
            var root =  window.location.protocol + '//' + window.location.hostname + ':' + config.webpack;
            $scope.widgetSrc = root + '/widget/index.html?fid=widget';

            if ($scope.isWidgetShell && config.widget && config.widget.service) {
                serviceFrame = document.createElement('iframe');
                serviceFrame.sandbox="allow-scripts allow-forms allow-same-origin";
                serviceFrame.id='service';
                serviceFrame.style.display='none';
                serviceFrame.src = root + '/widget/' + config.widget.service + "?fid=service";
                document.body.appendChild(serviceFrame);
            }

            if (config.control.settings.enabled) {
                $scope.currentControl = $scope.settingsSrc = root + '/control/settings/index.html?fid=controlSettings';
            }

            if (config.control.design.enabled) {
                $scope.currentControl = $scope.designSrc = root + '/control/design/index.html?fid=controlDesign';
            }

            if (config.control.content.enabled) {
                $scope.currentControl = $scope.contentSrc = root + '/control/content/index.html?fid=controlContent';
            }

            $scope.pluginControlIframeVisible = true;

            if(config.control.customTabs && config.control.customTabs.length) {
                for(var i = 0 ; i < config.control.customTabs.length; i++) {
                    var tab = config.control.customTabs[i];
                    if(tab && tab.url) {
                        if(tab.url.indexOf('//') != 0 && tab.url.indexOf('http://') != 0 && tab.url.indexOf('https://') != 0) {
                            var root =  window.location.protocol + '//' + window.location.hostname + ':' + config.webpack + '/control/';
                            // strip leading '/' if any
                            var customTabUrl = tab.url.indexOf("/") == 0 ? tab.url.substr(1) : tab.url;
                            tab.controlUrl = $sce.trustAsResourceUrl(root + customTabUrl);
                        } else {
                            tab.secureUrl = $sce.trustAsResourceUrl(tab.url);
                        }
                    }
                }
                $scope.customTabs = config.control.customTabs;
            }

            if (!$scope.$$phase)
                $scope.$apply();
        }

        window.serviceFrame;
        $scope.loadFrames = function (pluginFolder, config) {
            var root =  '../plugins/';

            if (config.control.settings.enabled) {
                $scope.currentControl = $scope.settingsSrc = root + pluginFolder + '/control/settings/index.html?fid=controlSettings';
                $sce.trustAsResourceUrl($scope.currentControl);
            }

            if (config.control.design.enabled) {
                $scope.currentControl = $scope.designSrc = root + pluginFolder + '/control/design/index.html?fid=controlDesign';
                $sce.trustAsResourceUrl($scope.currentControl);
            }

            if (config.control.content.enabled) {
                $scope.currentControl = $scope.contentSrc = root + pluginFolder + '/control/content/index.html?fid=controlContent';
                $sce.trustAsResourceUrl($scope.currentControl);
            }

            $scope.pluginControlIframeVisible = true;

            if(config.control.customTabs && config.control.customTabs.length) {
                var pluginFolder = $routeParams.pluginFolder;
                if (!pluginFolder) pluginFolder = window.appContext.currentPlugin.pluginPath;
                for(var i = 0 ; i < config.control.customTabs.length; i++) {
                    var tab = config.control.customTabs[i];
                    if(tab && tab.url) {
                        if(tab.url.indexOf('//') != 0 && tab.url.indexOf('http://') != 0 && tab.url.indexOf('https://') != 0) {
                            var root = '../plugins/' + pluginFolder + '/control/';
                            // strip leading '/' if any
                            var customTabUrl = tab.url.indexOf("/") == 0 ? tab.url.substr(1) : tab.url;
                            tab.controlUrl = $sce.trustAsResourceUrl(root + customTabUrl);
                        } else {
                            tab.secureUrl = $sce.trustAsResourceUrl(tab.url);
                        }
                    }
                }
                $scope.customTabs = config.control.customTabs;
            }

            if (!$scope.$$phase)
                $scope.$apply();
        };

        $scope.loadIFrame = function (section, e) {
            $scope.pluginControlIframeVisible = true;
            var pluginFolder = $routeParams.pluginFolder;
            if (!pluginFolder) pluginFolder = window.appContext.currentPlugin.pluginPath;

            $scope.currentControl = $scope.pluginConfig.webpack
                ?  window.location.protocol + '//' + window.location.hostname + ':' + config.webpack + '/control/' + section + '/index.html?fid=control'
                : '../plugins/' + pluginFolder + '/control/' + section + '/index.html?fid=control';

            var element = document.querySelector('.active');
            if (element)element.className = '';
            e.target.className = 'active';
        };

        $scope.loadCustomTab = function (tab, e) {
            if(tab.controlUrl) {
                $scope.pluginControlIframeVisible = true;
                $scope.currentControl = tab.controlUrl;
            } else {
                $scope.pluginControlIframeVisible = false;
                $scope.currentNonControl = tab.secureUrl;
            }

            var element = document.querySelector('.active');
            if (element)element.className = '';
            e.target.className = 'active';

            if (!$scope.$$phase)
                $scope.$apply();
        };

        /****************keep track of recent plugins *****/
        function keepTrackOfRecentPlugins(pluginFolder) {

            window.localStorage.setItem('lastPlugin', pluginFolder);
            var recentPlugins = localStorage.getItem('__recentPlugins');
            if (recentPlugins) {
                try {
                    recentPlugins = JSON.parse(recentPlugins);
                }
                catch (e) {
                }
            }
            if (!(recentPlugins && recentPlugins.length))
                recentPlugins = [];
            if (pluginFolder) {
                var index = recentPlugins.indexOf(pluginFolder);
                if (index > 0)
                    recentPlugins.splice(index, 1);

                if (index != 0)
                    recentPlugins.unshift(pluginFolder);

                if (recentPlugins.length > 5) // lust keep the last 5
                    recentPlugins.pop();
            }
            $scope.recentPlugins = recentPlugins;
            localStorage.setItem('__recentPlugins', JSON.stringify(recentPlugins));
        }

        $scope.init = function () {
            var pluginFolder = $routeParams.pluginFolder;
            if (!pluginFolder) pluginFolder = window.appContext.currentPlugin.pluginPath;

            var xmlhttp = new XMLHttpRequest();
            var url = '../plugins/' + pluginFolder + "/plugin.json";

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    config = JSON.parse(xmlhttp.responseText);
                    $scope.pluginConfig = config;
                    $scope.$apply();

                    if (config.webpack) {
                        $scope.loadWebpackFrames(config);
                    } else {
                        $scope.loadFrames(pluginFolder, config);
                    }

                    $scope.navToValue = $scope.pluginFolder = pluginFolder;
                    keepTrackOfRecentPlugins(pluginFolder);
                }
                else if (xmlhttp.status >= 300)
                    $scope.errorMessage = 'Error loading plugin';

                if (!$scope.$$phase)    $scope.$apply();
            };

            xmlhttp.open("GET", url, true);
            xmlhttp.send();


        };


        $scope.init();

        $scope.navTo = function ($event) {

            if ($event.keyCode == 13)
                window.location.hash = '/plugin/' + $scope.navToValue;
        };

        if (postMaster.controlPluginAPI) {
            postMaster.controlPluginAPI.spinner.show = function () {
                $scope.showSpinner = true;
                $scope.$apply();
            };

            postMaster.controlPluginAPI.spinner.hide = function () {
                $scope.showSpinner = false;
                $scope.$apply();
            };
        }
    }]
);

