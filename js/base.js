import ParseConfig from './parser';
import CreateSearch from './search';
import renderLayerList from './renderLayerList';
import CreateBaseLayers from './baselayer';
import {SetupGraphs, BindGraphEvents} from './graph'
import BindTabEvents from './tabs'
import {CreateMap} from './map'

var css = require('../css/sass/landat.scss')

// Does not rely on map object or config file
var Base = function (config) {
    ParseConfig(config, callback);
    SetupGraphs();
    BindTabEvents();
}

// Does rely on map object or config file
var callback = function (data) {
    var map = CreateMap({});
    CreateBaseLayers(map, data.baselayers);
    renderLayerList(map, data.layers, data.layout);
    CreateSearch(map);
    BindGraphEvents(map);
}

window.Base = Base;

export default {Base};
