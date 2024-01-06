var url_geoserver = 'http://localhost:8080/geoserver/wms';

//noms des couches
var name_layer_landuse = "formation_gs:gis_osm_landuse_a_free_1";
var name_layer_roads = "formation_gs:gis_osm_roads_free_1";
var name_layer_pois = "formation_gs:gis_osm_pois_free_1";
var name_layer_places = "formation_gs:gis_osm_places_free_1";
var name_layer_adm1 = "formation_gs:civ_adm1"
var name_layer_adm2 = "formation_gs:civ_adm2"
var name_layer_adm3 = "formation_gs:civ_adm3"
var name_layer_abidjan = "formation_gs:Abidjan_HR_ext"
//déclaration des couches openlayers
var lyr_landuse = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: url_geoserver,
    params: { LAYERS: name_layer_landuse, TILED: "true" },
    serverType: 'geoserver'
  }),
  title: "Occupation du sol",
});

var lyr_roads = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: url_geoserver,
    params: { LAYERS: name_layer_roads, TILED: "true" },
    serverType: 'geoserver'
  }),
  title: "Routes",
});

var lyr_pois = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: url_geoserver,
    params: { LAYERS: name_layer_pois, TILED: "true" },
  }),
  title: "POIs",
  serverType: 'geoserver'
});

var lyr_places = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: url_geoserver,
    params: { LAYERS: name_layer_places, TILED: "true" },
  }),
  title: "Lieux",
  serverType: 'geoserver'
});
var lyr_adm1 = new ol.layer.Tile({source: new ol.source.TileWMS(({url: url_geoserver,params: {"LAYERS": name_layer_adm1, "TILED": "true"}})),title: "adm1",serverType: 'geoserver'});
var lyr_adm2 = new ol.layer.Tile({source: new ol.source.TileWMS(({url: url_geoserver,params: {"LAYERS": name_layer_adm2, "TILED": "true"}})),title: "adm2",serverType: 'geoserver'});
var lyr_adm3 = new ol.layer.Tile({source: new ol.source.TileWMS(({url: url_geoserver,params: {"LAYERS": name_layer_adm3, "TILED": "true"}})),title: "adm3",serverType: 'geoserver'});
var lyr_abidjan = new ol.layer.Tile({source: new ol.source.TileWMS(({url: url_geoserver,params: {"LAYERS": name_layer_abidjan, "TILED": "true"}})),title: "abidjan",serverType: 'geoserver'});
//visibilité par défaut des couches au chargement de la carte
lyr_landuse.setVisible(true);
lyr_roads.setVisible(true);
lyr_pois.setVisible(true);
lyr_places.setVisible(true);
lyr_adm1.setVisible(true);
lyr_adm2.setVisible(true);
lyr_adm3.setVisible(true);
lyr_abidjan.setVisible(true);

//déclaration de la liste des couches à afficher dans un ordre précis
var layersList = [lyr_abidjan,lyr_adm1,lyr_adm2,lyr_adm3,lyr_landuse, lyr_roads, lyr_pois, lyr_places];
var mapView = new ol.View({
  projection: "EPSG:4326",
  center: [-5.69013, 7.786829],
  zoom: 7,
});
var map = new ol.Map({ target: "map", layers: layersList, view: mapView });
var layerSwitcher = new ol.control.LayerSwitcher({tipLabel: 'Légende'});
map.addControl(layerSwitcher);
var MousePosition = new ol.control.MousePosition({coordinateFormat: ol.coordinate.createStringXY(4),projection: 'EPSG:4326'});
map.addControl(MousePosition)