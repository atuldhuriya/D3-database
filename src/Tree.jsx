import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function Tree({
  data, // hierarchical data in nested objects
  path, // path identifier for tabular data
  id, // unique identifier for tabular data
  parentId, // parent identifier for tabular data
  children, // children accessor for hierarchical data
  tree = d3.tree, // tree layout algorithm
  sort, // sorting function for nodes
  label, // function to get the display name
  title, // function to get the hover text
  link, // function to get the link
  linkTarget = '_blank', // link target
  width = 640, // width of the svg
  height, // height of the svg
  r = 3, // node radius
  padding = 1, // horizontal padding
  fill = '#999', // fill color for nodes
  stroke = '#555', // stroke color for links
  strokeWidth = 1.5, // stroke width for links
  strokeOpacity = 0.4, // stroke opacity for links
  halo = '#fff', // halo color
  haloWidth = 3, // halo width
  curve = d3.curveBumpX, // curve for links
}) {
  const svgRef = useRef(null); // Create a reference to the svg element

  useEffect(() => {
    const svg = d3.select(svgRef.current); // Select the svg element
    svg.selectAll('*').remove(); // Clear existing elements

    const root = path
      ? d3.stratify().path(path)(data)
      : id && parentId
      ? d3.stratify().id(id).parentId(parentId)(data)
      : d3.hierarchy(data, children);

    if (sort) {
      root.sort(sort);
    }

    const dx = 10;
    const dy = width / (root.height + padding);
    tree().nodeSize([dx, dy])(root);

    // Determine the height if not provided
    let x0 = Infinity;
    let x1 = -Infinity;
    root.each((d) => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });

    if (!height) {
      height = x1 - x0 + dx * 2;
    }

    svg
      .attr('viewBox', [-dy * padding / 2, x0 - dx, width, height])
      .attr('width', width)
      .attr('height', height)
      .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10);

    svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', stroke)
      .attr('stroke-opacity', strokeOpacity)
      .attr('stroke-width', strokeWidth)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr('d', d3.link(curve).x((d) => d.y).y((d) => d.x));

    const node = svg
      .append('g')
      .selectAll('a')
      .data(root.descendants())
      .join('a')
      .attr('xlink:href', link ? (d) => link(d.data, d) : null)
      .attr('target', link ? linkTarget : null)
      .attr('transform', (d) => `translate(${d.y},${d.x})`);

    node.append('circle').attr('fill', (d) => (d.children ? stroke : fill)).attr('r', r);

    if (title) {
      node.append('title').text((d) => title(d.data, d));
    }

    if (label) {
      node.append('text')
        .attr('dy', '0.32em')
        .attr('x', (d) => (d.children ? -6 : 6))
        .attr('text-anchor', (d) => (d.children ? 'end' : 'start'))
        .attr('paint-order', 'stroke')
        .attr('stroke', halo)
        .attr('stroke-width', haloWidth)
        .text((d) => label(d.data, d));
    }
  }, [data, path, id, parentId, children, tree, sort, label, title, link, linkTarget, width, height, r, padding, fill, stroke, strokeWidth, strokeOpacity, halo, haloWidth, curve]);

  return <svg ref={svgRef}></svg>; // Return the svg element
}

export default Tree;


