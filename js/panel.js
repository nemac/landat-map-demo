import {toggleLayer} from "./toggleLayer";

export default function setupPanel (layers, layout) {
    var layerGroups = makeLayerGroups(layout['layer-groups-order']);
    makeLayerElems(layerGroups, layers);
    makePanelDraggable()
}

function makePanelDraggable() {
  var overlay = d3.select('#right-panel-drag-overlay')

  overlay.call(d3.drag()
    .on('drag', function () {
      handleDragEvent.call(this)
    }));

  function handleDragEvent() {
    var panel = document.getElementById('right-panel')
    var wrapper = document.getElementById('wrapper')
    var panelWidth = panel.clientWidth
    var wrapperWidth = wrapper.clientWidth
    var mouseX = d3.event.sourceEvent.x
    var xDelta = (wrapperWidth - mouseX) - panelWidth
    var newWidth = panelWidth + xDelta
    d3.select(panel).style('width', '' + newWidth + 'px')
  }
}

function makeLayerGroups (layout) {
    return d3.select('.layer-list')
        .selectAll('.layer-group-wrapper')
        .data(layout)
        .enter()
            .append('div')
            .attr('class', 'layer-group-wrapper')
            .attr('id', layerGroup => layerGroup.id)
            .classed('active', layerGroup => layerGroup.active)
            .each(function (layerGroup) {
                d3.select(this).append('div')
                    .attr('class', 'layer-group-btn btn')
                    .on('click', function (layerGroup) {
                        layerGroup.active = !layerGroup.active;
                        d3.select(this.parentNode).classed('active', () => layerGroup.active);
                    })
                    .text(layerGroup.name)
            })
            .append('div').attr('class', 'layer-group');
}

function makeLayerElems (layerGroups, layers) {
    layerGroups.selectAll('.layer-select')
        .data(layerGroup => layers[layerGroup.id])
        .enter().append('div')
        .attr('class', 'layer-select')
        .each(function (layer) {
            var groupName = this.parentNode.parentNode.id;
            var layerDiv = d3.select(this);

            makeCheckbox(layer, layerDiv);
            makeLabel(layer, layerDiv);
            makeDescription(layer, layerDiv);
            makeLegend(layer, layerDiv);
            makeOpacitySlider(layer, layerDiv);
        });
}

function makeCheckbox (layer, layerDiv) {
    layerDiv.append('input')
        .attr('type', 'checkbox')
        .attr('id', layer => layer.id)
        .attr('checked', (layer) => {
            return layer.active ? 'checked' : null;
        })
        .on('click', layer => {
            toggleLayer(layer);
            layerDiv.selectAll('.legend-wrapper, .opacity-slider-wrapper')
                .classed('active', layer.active);
        });
}

function makeLabel(layer, layerDiv) {
    layerDiv.append('label')
        .attr('for', layer => layer.id)
        .attr('class', 'layer-label')
        .html(layer => layer.name);
}

function makeDescription (layer, layerDiv) {
    if (layer.info && layer.info !== '') {
        layerDiv.append('div')
            .attr('class', 'layer-info-btn')
            .text('(?)')
            .on('click', function () {
                d3.select(this.parentNode)
                    .select('.layer-info-wrapper')
                    .classed('active', function () {
                        return !d3.select(this).classed('active');
                    })
            });

        layerDiv.append('div')
            .attr('class', 'layer-info-wrapper')
            .text(layer => layer.info);
    }
}

function makeLegend (layer, layerDiv) {
    layerDiv.append('div')
        .attr('class', 'legend-wrapper')
        .classed('active', layer.active)
        .append('img')
        .attr('src', layer.legend || 'mean_ndvi_legend.jpg');
}

function makeOpacitySlider (layer, layerDiv) {
    const MAX_OPACITY_LOC = 300;

    var opacityScale = d3.scaleLinear()
        .domain([0, MAX_OPACITY_LOC])
        .range([0, 1])
        .clamp(true);

    var layerOpacity = layer.opacity ? layer.opacity : 1
    var opacityStartingLocation = 300 * (layerOpacity);

    var opacitySliderWrapper = layerDiv.append('div')
        .attr('class', 'opacity-slider-wrapper')
        .classed('active', layer.active);

    var opacitySliderSvg = opacitySliderWrapper
        .append('svg').append('g')
        .attr('class', 'opacity-slider')
        .attr('transform', 'translate(20, 20)');

    opacitySliderSvg.append('circle')
        .attr('r', 6)
        .attr('cx', opacityStartingLocation)
        .attr('class', 'opacity-slider-circle');

    opacitySliderSvg.append('line')
        .attr('class', 'opacity-slider-track-overlay')
        .attr('x1', 0)
        .attr('x2', MAX_OPACITY_LOC + 15)
        .attr('stroke', '#000000')
        .attr('stroke-width', '20px')
        .attr('stroke-opacity', '0.0')
        .call(d3.drag()
              .on('start drag', function () {
                  updateOpacity(layer, this.parentNode, opacityScale, d3.event.x);
              }));

    opacitySliderSvg.append('line')
        .attr('class', 'opacity-slider-track')
        .attr('x1', 0).attr('x2', MAX_OPACITY_LOC)
        .attr('stroke-width', '20px')
        .attr('stroke', '#666')
        .attr('stroke-width', '2px');

    opacitySliderSvg.append('text')
        .attr('class', 'opacity-indicator')
        .attr('x', MAX_OPACITY_LOC + 15).attr('y', 5)
        .text(parseInt(layerOpacity * 100, 10) + '%');
}

function updateOpacity(layer, slider, scale, xPos) {
  // clamp the x position to be within the scale's domain
  var xPos = scale.invert(scale(xPos))
  slider = d3.select(slider)

  slider.select('circle').attr('cx', xPos)
  slider.select('text').text(parseInt(scale(xPos)*100, 10) + '%')
  layer.mapLayer.setOpacity(scale(d3.event.x))
}
