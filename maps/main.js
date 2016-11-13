/*jslint browser: true*/
/*global Tangram, gui */

map = (function () {
    'use strict';

    var map_start_location = [37.7749, -122.4194, 13];

    /*** URL parsing ***/

    // leaflet-style URL hash pattern:
    // #[zoom],[lat],[lng]
    // var url_hash = window.location.hash.slice(1, window.location.hash.length).split('/');

    // if (url_hash.length == 3) {
        // map_start_location = [url_hash[1],url_hash[2], url_hash[0]];
        // convert from strings
        // map_start_location = map_start_location.map(Number);
    // }

    /*** Map ***/

    var map = L.map('map',
        {"keyboardZoomOffset" : .05}
    );

    var layer = Tangram.leafletLayer({
        scene: 'scene.yaml',
        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
    });

    window.layer = layer;
    var scene = layer.scene;
    window.scene = scene;
    // setView expects format ([lat, long], zoom)
    map.setView(map_start_location.slice(0, 3), map_start_location[2]);

    var hash = new L.Hash(map);

    // GUI options for rendering modes/effects
    var style_controls = {
        'Default' : function() {
            this.setstyle(Object.keys(scene.config.layers), undefined);
        },
        'Elevator' : function() {
            this.setstyle(['buildings'], 'elevator');
        },
        'Popup' : function() {
            this.setstyle(['buildings'], 'popup');
        },
        'radius': 300,
        'height': 3,
        'Rainbow' : function() {
            this.setstyle(['buildings','landuse'], 'rainbow');
        },
        'Dots' : function() {
            this.setstyle(['buildings','landuse'], 'dots');
        },
        'Halftone' : function() {
            this.setstyle(Object.keys(scene.config.layers), 'halftone');
        },
        'dot_frequency' : 100,
        'dot_scale' : 1.5,
        'Colorhalftone' : function() {
            this.setstyle(Object.keys(scene.config.layers), 'colorhalftone');
        },
        'color_dot_frequency' : 50,
        'color_dot_scale' : 1.5,
        'Windows' : function() {
            this.setstyle(['buildings'], 'windows', 'isometric');
        },
        setstyle: function (layers, newstyle, camera) {
            // Restore initial state
            for (var i in scene.config.layers) {
                try {
                    scene.config.layers[i].draw.polygons.style = undefined;
                }
                catch(e) {
                    scene.config.layers[i].draw.lines.style = undefined;
                }
            };
            // Apply new style
            for (var j=0; j < layers.length; j++) {
                try {
                    scene.config.layers[layers[j]].draw.polygons.style = newstyle;
                }
                catch(e) {
                    scene.config.layers[layers[j]].draw.lines.style = newstyle;
                }
            }
            // Set camera
            if (camera) {
                scene.setActiveCamera(camera);
            } else {
                scene.setActiveCamera("perspective");
            }
            // Recompile/rebuild
            scene.rebuild();
        }
    };

    // Create dat GUI
    var gui = new dat.GUI({ autoPlace: true });
    function addGUI () {
        gui.domElement.parentNode.style.zIndex = 500;
        window.gui = gui;
        var folder = gui.addFolder("Click a style:");
        folder.open(); // this just points the arrow downward
        // Styles
        gui.add(style_controls, 'Default');
        gui.add(style_controls, 'Elevator');
        gui.add(style_controls, 'Popup');
        gui.add(style_controls, 'radius', 0, 500).name("&nbsp;&nbsp;radius").onChange(function(value) {
            scene.styles.popup.shaders.uniforms.u_popup_radius = value;
            scene.requestRedraw();
        });
        gui.add(style_controls, 'height', 0, 5).name("&nbsp;&nbsp;amount").onChange(function(value) {
            scene.styles.popup.shaders.uniforms.u_popup_height = value;
            scene.requestRedraw();
        });
        gui.add(style_controls, 'Rainbow');
        
        gui.add(style_controls, 'Halftone');
        gui.add(style_controls, 'dot_frequency', 1, 200).name("&nbsp;&nbsp;frequency").onChange(function(value) {
            scene.styles.halftone.shaders.uniforms.dot_frequency = value;
            scene.requestRedraw();
        });
        gui.add(style_controls, 'dot_scale', 0, 10).name("&nbsp;&nbsp;scale").onChange(function(value) {
            scene.styles.halftone.shaders.uniforms.dot_scale = value;
            scene.requestRedraw();
        });

        gui.add(style_controls, 'Colorhalftone');
        gui.add(style_controls, 'color_dot_frequency', 0, 100).name("&nbsp;&nbsp;frequency").onChange(function(value) {
            scene.styles.colorhalftone.shaders.uniforms.dot_frequency = value;
            scene.requestRedraw();
        });
        gui.add(style_controls, 'color_dot_scale', 0, 3).name("&nbsp;&nbsp;scale").onChange(function(value) {
            scene.styles.colorhalftone.shaders.uniforms.dot_scale = value;
            scene.requestRedraw();
        });
        
        gui.add(style_controls, 'Windows');
    }



    /***** Render loop *****/
    window.addEventListener('load', function () {
        // Scene initialized
        layer.on('init', function() {
            // addGUI();
            // scene.setActiveCamera('isometric');
        });
        layer.addTo(map);

    });

    return map;


}());
