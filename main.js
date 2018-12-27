"use strict"

// register the application module
b4w.register("ring-builder_main", function(exports, require) {

// import modules used by the app
var m_app       = require("app");
var m_cfg       = require("config");
var m_data      = require("data");
var m_preloader = require("preloader");
var m_ver       = require("version");
var m_util      = require("util");
var m_scene     = require("scenes");
var m_trans     = require("transform");

window.scene = m_scene;

// detect application mode
var DEBUG = (m_ver.type() == "DEBUG");

// automatically detect assets path
var APP_ASSETS_PATH = m_cfg.get_assets_path("ring-builder");

/**
 * export the method to initialize the app (called at the bottom of this file)
 */
exports.init = function() {
    m_app.init({
        canvas_container_id: "blend4web-container",
        callback: init_cb,
        show_fps: DEBUG,
        console_verbose: DEBUG,
        autoresize: true
    });
}

/**
 * callback executed when the app is initialized 
 */
function init_cb(canvas_elem, success) {

    if (!success) {
        console.log("b4w init failure");
        return;
    }

    m_preloader.create_preloader();

    // ignore right-click on the canvas element
    canvas_elem.oncontextmenu = function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    load();
}

/**
 * load the scene data
 */
function load() {
    m_data.load(APP_ASSETS_PATH + "main.json", load_cb, preloader_cb);
}

/**
 * update the app's preloader
 */
function preloader_cb(percentage) {
    m_preloader.update_preloader(percentage);
}

/**
 * callback executed when the scene data is loaded
 */

var IS_INITIAL_LOAD = true;

var current = { band: { id: null, name: null }, diamond: { id: null, name: null } };

var LAST_LOADED_TYPE = "";

function load_cb(data_id, success) {
    if (!success) {
        console.log("b4w load failure");
        return;
    }

    if(LAST_LOADED_TYPE){ current[LAST_LOADED_TYPE].id = data_id; }

    if(current.diamond.id){
        var diamond = m_scene.get_object_by_name("Diamond", current.diamond.id);
        var diamondLocation = m_scene.get_object_by_name("DiamondLocation", current.band.id);
        var pos = new Float32Array(3);
        m_trans.get_translation(diamondLocation, pos);
        m_trans.set_translation_v(diamond, pos);
    }

    m_app.enable_camera_controls();

    console.log(m_scene.get_all_objects());
}


$(function(){

    $('[data-load]').click(function(){
        var data = $(this).data('load');
        console.log(data);

        if(data.name !== current[data.type].name){
            LAST_LOADED_TYPE = data.type;
            if(current[data.type].id){ m_data.unload(current[data.type].id); }
            current[data.type].name = data.name;
            m_data.load(APP_ASSETS_PATH+data.name+".json", load_cb, null, true);
        }
    });

    $('#rotate-btn').click(function(){
        var angle_deg = 45;
        var angle_rad = m_util.deg_to_rad(angle_deg);
        var obj = m_scene.get_object_by_name("Geometry", current.band.id);

        m_trans.rotate_y_local(obj, angle_rad); 
    });
});


});

// import the app module and start the app by calling the init method
b4w.require("ring-builder_main").init();
