var url_geoserver = "http://localhost:8080/geoserver/wms";

//noms des couches
var name_layer_adm1 = "formation_gs:civ_adm1";
var name_layer_adm2 = "formation_gs:civ_adm2";
var name_layer_adm3 = "formation_gs:civ_adm3";
var name_layer_abidjan = "formation_gs:Abidjan_HR_ext";
var name_layer_lines = "formation_gs:line_shapes";
var name_layer_polygon = "formation_gs:polygon_shapes";
var name_layer_points = "formation_gs:point_shapes";
//déclaration des couches openlayers
var lyr_adm1 = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: url_geoserver,
    params: { LAYERS: name_layer_adm1, TILED: "true" },
  }),
  title: "Adm1",
});

var lyr_adm2 = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: url_geoserver,
    params: { LAYERS: name_layer_adm2, TILED: "true" },
  }),
  title: "Adm2",
});

var lyr_adm3 = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: url_geoserver,
    params: { LAYERS: name_layer_adm3, TILED: "true" },
  }),
  title: "Adm3",
});

var lyr_abidjan = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: url_geoserver,
    params: { LAYERS: name_layer_abidjan, TILED: "true" },
  }),
  title: "Abidjan",
});

var lyr_osm = new ol.layer.Tile({
  title: "OSM",
  type: "base",
  visible: true,
  source: new ol.source.OSM(),
});
var lyr_polygon = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: url_geoserver,
    params: { LAYERS: name_layer_polygon, TILED: "true" },
  }),
  title: "polygon",
});
var lyr_lines = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: url_geoserver,
    params: { LAYERS: name_layer_lines, TILED: "true" },
  }),
  title: "lines",
});
var lyr_points = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: url_geoserver,
    params: { LAYERS: name_layer_points, TILED: "true" },
  }),
  title: "points",
});

//visibilité par défaut des couches au chargement de la carte
lyr_adm1.setVisible(true);
lyr_adm2.setVisible(true);
lyr_adm3.setVisible(true);
lyr_abidjan.setVisible(true);
lyr_polygon.setVisible(true);
lyr_lines.setVisible(true);
lyr_points.setVisible(true);

//déclaration de la liste des couches à afficher dans un ordre précis
var layersList = [lyr_osm, lyr_adm1, lyr_adm2, lyr_adm3, lyr_abidjan,lyr_polygon,lyr_points,lyr_lines];
var mapView = new ol.View({
  projection: "EPSG:3857",
  center: [-5.690183, 7.786829],
  zoom: 7,
});

var container = document.getElementById("popup");
var content = document.getElementById("popup-content");
var closer = document.getElementById("popup-closer");
closer.onclick = function () {
  container.style.display = "none";
  closer.blur();
  return false;
};

var overlayPopup = new ol.Overlay({ element: container });
var map = new ol.Map({
  target: "map",
  overlays: [overlayPopup],
  layers: layersList,
  view: mapView,
});

var layerSwitcher = new ol.control.LayerSwitcher({ tipLabel: "Légende" });
map.addControl(layerSwitcher);
var MousePosition = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(4),
  projection: "EPSG:3857",
});
map.addControl(MousePosition);
map.on("pointermove", function (event) {
  var coord3857 = event.coordinate;
  var coord4326 = ol.proj.transform(coord3857, "EPSG:3857", "EPSG:4326");
  $("#mouse3857").text(ol.coordinate.toStringXY(coord3857, 2));
  $("#mouse4326").text(ol.coordinate.toStringXY(coord4326, 5));
});
var clicked_coord;
var onSingleClick = function (evt) {
  var coord = evt.coordinate;
  console.log(coord);
  var source1 = name_layer_adm1;
  var source2 = name_layer_adm2;
  var source3 = name_layer_adm3;
  var layers_list = source3 + "," + source2 + "," + source1;
  var wmslyr_adm1 = new ol.source.TileWMS({
    url: url_geoserver,
    params: { LAYERS: name_layer_adm1, TILED: true },
    serverType: "geoserver",
    crossOrigin: "anonymous",
  });
  var view = map.getView();
  var viewResolution = view.getResolution();
  var url = wmslyr_adm1.getFeatureInfoUrl(
    evt.coordinate,
    viewResolution,
    view.getProjection(),
    {
      INFO_FORMAT: "text/javascript",
      FEATURE_COUNT: 20,
      LAYERS: layers_list,
      QUERY_LAYERS: layers_list,
    }
  );
  console.log(url);
  if (url) {
    clicked_coord = coord;
    $.ajax(url, { dataType: "jsonp" }).done(function (data) {});
  }
};
function parseResponse(data) {
  var vectorSource = new ol.source.Vector({
    features: new ol.format.GeoJSON().readFeatures(data),
  });
  console.log(new ol.format.GeoJSON().readFeatures(data));
  var features = vectorSource.getFeatures();
  var str = "";
  var district = "";
  var region = "";
  var departement = "";
  for (x in features) {
    var id = features[x].getId();
    console.log(id);
    var props = features[x].getProperties();
    if (id.indexOf("adm1") > -1) district = props["ADM1_FR"];
    if (id.indexOf("adm2") > -1) region = props["ADM2_FR"];
    if (id.indexOf("adm3") > -1) departement = props["ADM3_FR"];
  }
  str = str + "District: " + district + "<br/>";
  str = str + "Région: " + region + "<br/>";
  str = str + "Département: " + departement + "<br/>";
  if (str) {
    str = "<p>" + str + "</p>";
    overlayPopup.setPosition(clicked_coord);
    content.innerHTML = str;
    container.style.display = "block";
  } else {
    container.style.display = "none";
    closer.blur();
  }
}
map.on("singleclick", function (evt) {
  onSingleClick(evt);
});
var point = new ol.geom.Point(
  ol.proj.transform([-5.690183, 7.786829], "EPSG:4326", "EPSG:3857")
);
var circle = new ol.geom.Circle(
  ol.proj.transform([-5.690183, 7.786829], "EPSG:4326", "EPSG:3857"),
  450000
);
var pointFeature = new ol.Feature(point);
var circleFeature = new ol.Feature(circle);
var circleFeature = new ol.Feature(circle);
var style = new ol.style.Style({
  fill: new ol.style.Fill({ color: "rgba(255, 100, 50, 0.3)" }),
  stroke: new ol.style.Stroke({ width: 2, color: "rgba(255, 100, 50, 0.8)" }),
  image: new ol.style.Circle({
    fill: new ol.style.Fill({ color: "rgba(55, 200, 150, 0.5)" }),
    stroke: new ol.style.Stroke({ width: 1, color: "rgba(55, 200, 150, 0.8)" }),
    radius: 7,
  }),
});
var vectorSource = new ol.source.Vector({ projection: "EPSG:4326" });
var vectorLayer = new ol.layer.Vector({ source: vectorSource, style: style });
vectorSource.addFeatures([pointFeature, circleFeature]);
map.addLayer(vectorLayer);
var vectorSource = new ol.source.Vector({ projection: "EPSG:4326" });
var vectorLayer = new ol.layer.Vector({ source: vectorSource, style: style });
map.addLayer(vectorLayer);
var button = $("#pan").button("toggle");
var interaction;
$("div.btn-group button").on("click", function (event) {
  var id = event.target.id;
  button.button("toggle");
  button = $("#" + id).button("toggle");
  map.removeInteraction(interaction);
  switch (event.target.id) {
    case "select":
      interaction = new ol.interaction.Select();
      map.addInteraction(interaction);
      break;
    case "point":
      interaction = new ol.interaction.Draw({
        type: "Point",
        source: vectorLayer.getSource(),
      });
      interaction.on("drawend", function (evt) {
        var shape = evt.feature.getGeometry().getCoordinates();
        var shape1 = ol.proj.transform(shape, "EPSG:3857", "EPSG:4326");
        let reqObj = { location: [shape1[0], shape1[1]] };
        console.log(JSON.stringify(reqObj));
        $.ajax({
          url: "http://localhost:9200/point/_doc",
          type: "POST",
          data: JSON.stringify(reqObj),
          dataType: "json",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          success: function (data) {
            console.log("Load was performed.");
          },
        });

        console.log(shape);
      });
      map.addInteraction(interaction);
      break;
    case "line":
      interaction = new ol.interaction.Draw({
        type: "LineString",
        source: vectorLayer.getSource(),
      });
      interaction.on("drawend", function (evt) {
        var shape = evt.feature.getGeometry().getCoordinates();
        var shape1 = [];
        for (let i = 0; i < shape.length; i++) {
          var list = ol.proj.transform(shape[i], "EPSG:3857", "EPSG:4326");
          shape1.push(list);
        }

        let reqObj = { location: { type: "linestring", coordinates: shape1 } };
        console.log(JSON.stringify(reqObj));
        $.ajax({
          url: "http://localhost:9200/line/_doc",
          type: "POST",
          data: JSON.stringify(reqObj),
          dataType: "json",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          success: function (data) {
            console.log("Load was performed.");
          },
        });

        console.log(shape);
      });

      map.addInteraction(interaction);
      break;
    case "polygon":
      interaction = new ol.interaction.Draw({
        type: "Polygon",
        source: vectorLayer.getSource(),
      });
      interaction.on("drawend", function (evt) {
        var shape = evt.feature.getGeometry().getCoordinates();
        var shape1 = [];
        for (let i = 0; i < shape[0].length; i++) {
          var list = ol.proj.transform(shape[0][i], "EPSG:3857", "EPSG:4326");
          shape1.push(list);
        }
        console.log(shape1);
        shape1 = [shape1];
        let reqObj = { location: { type: "polygon", coordinates: shape1 } };
        console.log(JSON.stringify(reqObj));
        $.ajax({
          url: "http://localhost:9200/polygon/_doc",
          type: "POST",
          data: JSON.stringify(reqObj),
          dataType: "json",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          success: function (data) {
            console.log("Load was performed.");
          },
        });

        console.log(shape[0]);
      });
      map.addInteraction(interaction);
      break;
    case "modify":
      interaction = new ol.interaction.Modify({
        features: new ol.Collection(vectorLayer.getSource().getFeatures()),
      });
      map.addInteraction(interaction);
      break;

        case "position":
           map.getView().setCenter(geolocation.getPosition());
           map.getView().setZoom(15);
           marker.setPosition(geolocation.getPosition());
           break;
    default:
      break;
  }
});
//Geolocation
var geolocation = new ol.Geolocation({
 projection: map.getView().getProjection(),
 tracking: true
});
var marker = new ol.Overlay({
 element: document.getElementById('location'),
 positioning: 'center-center'
});
map.addOverlay(marker);
geolocation.on("change:position", function () {
  map.getView().setCenter(geolocation.getPosition());
  map.getView().setZoom(15);
  marker.setPosition(geolocation.getPosition());
});
function zoomToMyPosition() {

  geolocation.on("change:position", function () {
    map.getView().setCenter(geolocation.getPosition());
    map.getView().setZoom(15);
    marker.setPosition(geolocation.getPosition());
  });
}
function goToFullExtent() {
  map.getView().fit(map.getView().calculateExtent());
  map.getView().setZoom(0);
}
var elasticSearchLayerList = [];
$.ajax({
  url: "http://localhost:9200/point/_search",
  type: "GET",
  dataType: "json",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  success: function (data) {
    for (let i = 0; i < data.hits.hits.length; i++) {
      var coordinates4326 = data.hits.hits[i]._source.location;
      coordinates = ol.proj.transform(
        coordinates4326,
        "EPSG:4326",
        "EPSG:3857"
      );
      console.log(coordinates);
      var point = new ol.geom.Point(coordinates);

      var pointFeature = new ol.Feature(point);
      var vectorSource = new ol.source.Vector({ projection: "EPSG:4326" });
      var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: style,
      });
      var pointFeature = new ol.Feature(point);
      vectorSource.addFeature(pointFeature);
      map.addLayer(vectorLayer);
      elasticSearchLayerList.push(vectorLayer);
    }
    console.log(data.hits.hits);
  },
});
$.ajax({
  url: "http://localhost:9200/line/_search",
  type: "GET",
  dataType: "json",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  success: function (data) {
    for (let i = 0; i < data.hits.hits.length; i++) {
      var coordinates4326 = data.hits.hits[i]._source.location.coordinates;
      coordinates = [];
      for (let i = 0; i < coordinates4326.length; i++) {
        var list = ol.proj.transform(
          coordinates4326[i],
          "EPSG:4326",
          "EPSG:3857"
        );
        coordinates.push(list);
      }
      console.log(coordinates);
      var line = new ol.geom.LineString(coordinates);

      var lineFeature = new ol.Feature(line);
      var vectorSource = new ol.source.Vector({ projection: "EPSG:4326" });
      var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: style,
      });
      var lineFeature = new ol.Feature(line);
      vectorSource.addFeature(lineFeature);
      map.addLayer(vectorLayer);
      elasticSearchLayerList.push(vectorLayer);
    }
    console.log("ok");
  },
});

$.ajax({
  url: "http://localhost:9200/polygon/_search",
  type: "GET",
  dataType: "json",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  success: function (data) {
    for (let i = 0; i < data.hits.hits.length; i++) {
      var coordinates4326 = data.hits.hits[i]._source.location.coordinates[0];
      coordinates = [];
      for (let i = 0; i < coordinates4326.length; i++) {
        var list = ol.proj.transform(
          coordinates4326[i],
          "EPSG:4326",
          "EPSG:3857"
        );
        coordinates.push(list);
      }
      console.log(coordinates);
      coordinates = [coordinates];
      var polygon = new ol.geom.Polygon(coordinates);

      var polygoneFeature = new ol.Feature(polygon);
      var vectorSource = new ol.source.Vector({ projection: "EPSG:4326" });
      var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: style,
      });
      var polygonFeature = new ol.Feature(polygon);
      vectorSource.addFeature(polygonFeature);
      map.addLayer(vectorLayer);
      elasticSearchLayerList.push(vectorLayer);
    }
    console.log("ok");
  },
});
function deleteall() {
  for (i = 0; i < elasticSearchLayerList.length; i++) {
    map.removeLayer(elasticSearchLayerList[i]);
  }
  elasticsearchLayerList = [];
  var features = vectorSource.getFeatures();
  for (i = 0; i < features.length; i++) {
    vectorSource.removeFeature(features[i]);
  }

  var reqObj = {
    query: {
      match_all: {},
    },
  };
  $.ajax({
    url: "http://localhost:9200/point/_delete_by_query?conflicts=proceed",
    type: "POST",
    data: JSON.stringify(reqObj),
    dataType: "json",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    success: function (data) {
      console.log("delete was  performed.");
    },
  });
  $.ajax({
    url: "http://localhost:9200/line/_delete_by_query?conflicts=proceed",
    type: "POST",
    data: JSON.stringify(reqObj),
    dataType: "json",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    success: function (data) {
      console.log("delete was  performed.");
    },
  });
  $.ajax({
    url: "http://localhost:9200/polygon/_delete_by_query?conflicts=proceed",
    type: "POST",
    data: JSON.stringify(reqObj),
    dataType: "json",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    success: function (data) {
      console.log("delete was  performed.");
    },
  });
}
