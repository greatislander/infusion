/*
Copyright 2017 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/* global fluid, jqUnit */


(function ($) {
    "use strict";

    fluid.registerNamespace("fluid.tests");

    /*******************************************************************************
     * PrefsEditor separatedPanel responsive tests
     *******************************************************************************/

    fluid.defaults("fluid.tests.separatedPanel", {
        gradeNames: ["fluid.prefs.transformDefaultPanelsOptions", "fluid.prefs.initialModel.starter", "fluid.prefs.separatedPanel"],
        terms: {
            templatePrefix: "../../../../src/framework/preferences/html/",
            messagePrefix: "../../../../src/framework/preferences/messages/"
        },
        iframeRenderer: {
            markupProps: {
                src: "./SeparatedPanelPrefsEditorFrame.html"
            }
        },
        templateLoader: {
            gradeNames: ["fluid.prefs.starterSeparatedPanelTemplateLoader"]
        },
        messageLoader: {
            gradeNames: ["fluid.prefs.starterMessageLoader"]
        },
        prefsEditor: {
            gradeNames: ["fluid.prefs.starterPanels", "fluid.prefs.uiEnhancerRelay"]
        }
    });

    fluid.tests.separatedPanel.assignSeparatedPanelContainer = function () {
        return $(".flc-prefsEditor-separatedPanel", $("iframe")[0].contentWindow.document);
    };

    fluid.defaults("fluid.tests.separatedPanelResponsive", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            separatedPanel: {
                type: "fluid.tests.separatedPanel",
                container: {
                    expander: {
                        funcName: "fluid.tests.separatedPanel.assignSeparatedPanelContainer"
                    }
                },
                createOnEvent: "{separatedPanelResponsiveTester}.events.onTestCaseStart"
            },
            separatedPanelResponsiveTester: {
                type: "fluid.tests.separatedPanelResponsiveTester"
            }
        }
    });

    fluid.tests.assertAriaForButton = function (button, buttonName, controlsId) {
        jqUnit.assertEquals(buttonName + " button has the button role", "button", button.attr("role"));
        jqUnit.assertEquals(buttonName + " button has correct aria-controls", controlsId, button.attr("aria-controls"));
    };

    fluid.tests.assertAriaForToggleButton = function (button, buttonName, controlsId, state) {
        var attrState = state ? "true" : "false";
        fluid.tests.assertAriaForButton(button, buttonName, controlsId);
        jqUnit.assertEquals(buttonName + " button has correct aria-pressed", attrState, button.attr("aria-pressed"));
    };

    fluid.tests.assertAria = function (that, state) {
        var toggleButton = that.locate("toggleButton");
        var panel = that.locate("panel");
        var panelId = panel.attr("id");
        var attrState = state ? "true" : "false";

        fluid.tests.assertAriaForToggleButton(toggleButton, "Hide/show", panelId, state);
        jqUnit.assertEquals("Panel has the group role", "group", panel.attr("role"));
        jqUnit.assertEquals("Panel has the correct aria-label", that.options.strings.panelLabel, panel.attr("aria-label"));
        jqUnit.assertEquals("Panel has correct aria-expanded", attrState, panel.attr("aria-expanded"));
    };

    fluid.tests.assertResetButton = function (separatedPanel, state) {
        separatedPanel.locate("reset").each(function (idx, elm) {
            elm = $(elm);
            var smallScreenContainer = elm.parents(".fl-panelBar-smallScreen");

            if (smallScreenContainer.length > 0) {
                jqUnit.assertEquals("The small screen Reset button visibility should be " + state, state, elm.is(":visible"));
                fluid.tests.assertAriaForButton(elm, "The small screen Reset", separatedPanel.slidingPanel.panelId);
            } else {
                jqUnit.assertEquals("The wide screen Reset button visibility should be false", false, elm.is(":visible"));
                fluid.tests.assertAriaForButton(elm, "The wide screen Reset", separatedPanel.slidingPanel.panelId);
            }
        });
    };

    fluid.tests.assertSeparatedPanelState = function (separatedPanel, state) {
        jqUnit.assertEquals("The iframe visibilith should be" + state, state, separatedPanel.iframeRenderer.iframe.is(":visible"));
        fluid.tests.assertResetButton(separatedPanel, state);
        fluid.tests.assertAria(separatedPanel.slidingPanel, state);
    };

    fluid.tests.assertSeparatedPanelInit = function (separatedPanel) {
        fluid.tests.assertSeparatedPanelState(separatedPanel, false);
        fluid.tests.prefs.assertPresent(separatedPanel, fluid.tests.prefs.expectedSeparatedPanel);
        fluid.tests.prefs.assertPresent(separatedPanel.prefsEditor, fluid.tests.prefs.expectedComponents["fluid.prefs.separatedPanel"]);
    };

    fluid.tests.assertPanelVisibility = function (prefsEditor, panelIndex) {
        var panels = prefsEditor.locate("panels");

        panels.each(function (idx, elm) {
            var panelOffset = $(elm).offset().left;
            if (idx === panelIndex) {
                jqUnit.assertEquals("The panel at index " + idx + " should be scrolled into view", 0, panelOffset);
            } else {
                jqUnit.assertNotEquals("The panel at index " + idx + " should not be scrolled into view", 0, panelOffset);
            }
        });
    };

    fluid.defaults("fluid.tests.separatedPanelResponsiveTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [{
            name: "Separated panel integration tests",
            tests: [{
                expect: 37,
                name: "Separated panel integration tests",
                sequence: [{
                    listener: "fluid.tests.assertSeparatedPanelInit",
                    event: "{separatedPanelResponsive separatedPanel}.events.onReady"
                }, {
                    func: "{separatedPanel}.slidingPanel.showPanel"
                }, {
                    listener: "fluid.tests.assertSeparatedPanelState",
                    event: "{separatedPanel}.slidingPanel.events.afterPanelShow",
                    args: ["{separatedPanel}", true]
                }, {
                    func: "fluid.tests.assertPanelVisibility",
                    args: ["{separatedPanel}.prefsEditor", 0]
                }]
            }]
        }]
    });

    $(document).ready(function () {
        var iframe = $("iframe");

        iframe.on("load", function () {
            // the global settings store and pageEnhancer are added
            // as they are required by the prefs editor.
            fluid.tests.prefs.globalSettingsStore();
            fluid.pageEnhancer(fluid.tests.prefs.enhancerOptions);

            fluid.test.runTests([
                "fluid.tests.separatedPanelResponsive"
            ]);

        });

        iframe.css({width: "400px", height: "400px"}); // set to a small screen size
        // injecting the iframe source so that we can ensure the iframe on load event
        // is fired after the listener is bound.
        iframe.attr("src", "SeparatedPanelPrefsEditorResponsiveTestPage.html");
    });

})(jQuery);
