"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Sparkles, Calendar, TrendingUp } from 'lucide-react';

export interface DailyChartItem {
  date: Date;
  name: string;
  dayAbbr: string;
  fullDate: string;
  shortDate: string;
  relativeLabel: string;
  daysAgo: number;
  mg: number;
  trend: number;
  drinksCount: number;
  drinksDetail?: string[];
  isToday: boolean;
  isBeforeStatsStart: boolean;
}

export interface WeeklyChartItem {
  name: string;
  fullDate: string;
  mg: number;
  avgDaily: number;
  trend: number;
  drinksCount: number;
  cleanDays: number;
  isCurrentWeek: boolean;
}

interface D3CaffeineChartProps {
  viewMode: 'daily' | 'weekly';
  dailyData: DailyChartItem[];
  weeklyData: WeeklyChartItem[];
  accentColor: string;
  accentGlow: string;
  badgeBg: string;
  badgeBorder: string;
  theme: 'dark' | 'gray' | 'light';
  isDeclining: boolean;
  isIncreasing: boolean;
  totalMg: number;
  modalBgClass?: string;
  subTextClass?: string;
  muteTextClass?: string;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export const D3CaffeineChart: React.FC<D3CaffeineChartProps> = ({
  viewMode,
  dailyData,
  weeklyData,
  accentColor,
  accentGlow,
  badgeBg,
  badgeBorder,
  theme,
  isDeclining,
  isIncreasing,
  totalMg,
  modalBgClass = 'bg-zinc-900/95 border-zinc-800 text-zinc-100',
  subTextClass = 'text-zinc-400',
  muteTextClass = 'text-zinc-500',
  scrollContainerRef
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(360);

  // Active hovered / selected point for tooltip
  const [activeTooltip, setActiveTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    data: (DailyChartItem & { type: 'daily' }) | (WeeklyChartItem & { type: 'weekly' }) | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    data: null
  });

  const hideTooltipTimeout = useRef<NodeJS.Timeout | null>(null);

  // Colors based on theme & accent
  const gridColor = theme === 'light' ? 'rgba(226, 232, 240, 0.8)' : 'rgba(255, 255, 255, 0.07)';
  const tickColor = theme === 'light' ? '#64748b' : '#94a3b8';
  const zeroMgBarColor = theme === 'light' ? '#e2e8f0' : '#27272a';
  const dangerBarColor = '#ef4444';
  const trendColor = totalMg === 0 ? '#10b981' : isDeclining ? '#10b981' : isIncreasing ? '#f43f5e' : accentColor;

  const renderChart = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;

    // Dimensions
    const height = 230;
    const margin = { top: 18, right: viewMode === 'daily' ? 30 : 16, bottom: 36, left: 34 };

    // Calculate width: for daily 60 days view we use a comfortable scrollable width (~1900px), for weekly we use full container width
    const containerWidth = container.clientWidth || 360;
    const width = viewMode === 'daily' ? Math.max(1860, dailyData.length * 31) : Math.max(containerWidth, 320);

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Defs for gradients & clip-paths
    let defs = svg.select<SVGDefsElement>('defs');
    if (defs.empty()) {
      defs = svg.append('defs');
    }

    // Dynamic bar gradient
    defs.selectAll('#d3-bar-gradient').remove();
    const barGrad = defs.append('linearGradient')
      .attr('id', 'd3-bar-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    barGrad.append('stop').attr('offset', '0%').attr('stop-color', accentColor).attr('stop-opacity', 1);
    barGrad.append('stop').attr('offset', '100%').attr('stop-color', accentColor).attr('stop-opacity', 0.75);

    // Glow filter
    defs.selectAll('#d3-glow-filter').remove();
    const filter = defs.append('filter')
      .attr('id', 'd3-glow-filter')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Main Chart Group
    let mainGroup = svg.select<SVGGElement>('.chart-content');
    if (mainGroup.empty()) {
      mainGroup = svg.append('g').attr('class', 'chart-content');
    }
    mainGroup.attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare scales
    let maxMg = 100;
    if (viewMode === 'daily') {
      const dataMax = d3.max(dailyData, d => Math.max(d.mg, d.trend)) || 0;
      maxMg = Math.max(120, Math.ceil((dataMax * 1.15) / 50) * 50);
    } else {
      const dataMax = d3.max(weeklyData, d => Math.max(d.mg, d.trend)) || 0;
      maxMg = Math.max(200, Math.ceil((dataMax * 1.15) / 100) * 100);
    }

    const yScale = d3.scaleLinear()
      .domain([0, maxMg])
      .range([innerHeight, 0])
      .nice();

    // Setup X Scale & Data Mapping
    const currentData = viewMode === 'daily' ? dailyData : weeklyData;
    const xScale = d3.scaleBand()
      .domain(currentData.map((_, i) => i.toString()))
      .range([0, innerWidth])
      .padding(viewMode === 'daily' ? 0.32 : 0.28);

    // Grid lines (horizontal)
    let gridGroup = mainGroup.select<SVGGElement>('.grid-lines');
    if (gridGroup.empty()) {
      gridGroup = mainGroup.append('g').attr('class', 'grid-lines');
    }
    const yTicks = yScale.ticks(4);
    const gridLines = gridGroup.selectAll<SVGLineElement, number>('line.grid-line')
      .data(yTicks, d => d);

    gridLines.enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', gridColor)
      .attr('stroke-dasharray', '3 4')
      .attr('opacity', 0)
      .transition()
      .duration(400)
      .attr('opacity', 1);

    gridLines
      .transition()
      .duration(500)
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', gridColor);

    gridLines.exit()
      .transition()
      .duration(300)
      .attr('opacity', 0)
      .remove();

    // Y Axis Ticks / Labels
    let yAxisGroup = mainGroup.select<SVGGElement>('.y-axis');
    if (yAxisGroup.empty()) {
      yAxisGroup = mainGroup.append('g').attr('class', 'y-axis');
    }
    const yLabels = yAxisGroup.selectAll<SVGTextElement, number>('text.y-tick-label')
      .data(yTicks, d => d);

    yLabels.enter()
      .append('text')
      .attr('class', 'y-tick-label')
      .attr('x', -8)
      .attr('y', d => yScale(d))
      .attr('dy', '0.32em')
      .attr('text-anchor', 'end')
      .attr('fill', tickColor)
      .attr('font-size', '9.5px')
      .attr('font-weight', '500')
      .text(d => d.toString())
      .attr('opacity', 0)
      .transition()
      .duration(400)
      .attr('opacity', 0.85);

    yLabels
      .transition()
      .duration(500)
      .attr('y', d => yScale(d))
      .attr('fill', tickColor)
      .text(d => d.toString());

    yLabels.exit()
      .transition()
      .duration(300)
      .attr('opacity', 0)
      .remove();

    // ==========================================
    // BARS RENDERING WITH FLUID ENTRANCE & HOVER
    // ==========================================
    let barsGroup = mainGroup.select<SVGGElement>('.bars-layer');
    if (barsGroup.empty()) {
      barsGroup = mainGroup.append('g').attr('class', 'bars-layer');
    }

    const barWidth = Math.min(xScale.bandwidth(), viewMode === 'daily' ? 18 : 34);

    // Bind Bar Data
    interface BarDataItem {
      id: string;
      index: number;
      mg: number;
      trend: number;
      isTodayOrCurrent: boolean;
      rawItem: DailyChartItem | WeeklyChartItem;
    }

    const barData: BarDataItem[] = currentData.map((d, i) => ({
      id: `${viewMode}-${i}-${d.name}`,
      index: i,
      mg: d.mg,
      trend: d.trend,
      isTodayOrCurrent: viewMode === 'daily' ? (d as DailyChartItem).isToday : (d as WeeklyChartItem).isCurrentWeek,
      rawItem: d
    }));

    const bars = barsGroup.selectAll<SVGGElement, BarDataItem>('g.bar-item')
      .data(barData, d => d.id);

    // Exit old bars
    bars.exit()
      .transition()
      .duration(350)
      .attr('opacity', 0)
      .remove();

    // Enter new bars
    const barsEnter = bars.enter()
      .append('g')
      .attr('class', 'bar-item')
      .attr('transform', d => {
        const xPos = (xScale(d.index.toString()) || 0) + (xScale.bandwidth() - barWidth) / 2;
        return `translate(${xPos}, 0)`;
      });

    // Background hover target area for easy touch/mouse trigger
    barsEnter.append('rect')
      .attr('class', 'hover-capture')
      .attr('x', -4)
      .attr('y', 0)
      .attr('width', barWidth + 8)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'pointer');

    // Clean Day / Zero Bar Baseline Pill Indicator (for 0 mg days)
    barsEnter.append('rect')
      .attr('class', 'zero-bar-pill')
      .attr('x', 0)
      .attr('y', innerHeight - 4)
      .attr('width', barWidth)
      .attr('height', 4)
      .attr('rx', 2)
      .attr('fill', zeroMgBarColor)
      .attr('opacity', 0);

    // Visible Bar
    barsEnter.append('rect')
      .attr('class', 'data-bar')
      .attr('x', 0)
      .attr('y', innerHeight)
      .attr('width', barWidth)
      .attr('height', 0)
      .attr('rx', viewMode === 'daily' ? 4 : 6)
      .attr('fill', d => {
        if (d.mg === 0) return zeroMgBarColor;
        if (d.mg > 400) return dangerBarColor;
        return 'url(#d3-bar-gradient)';
      })
      .attr('cursor', 'pointer');

    // Merge & Animate Bars
    const barsMerged = barsEnter.merge(bars);

    barsMerged
      .transition()
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr('transform', d => {
        const xPos = (xScale(d.index.toString()) || 0) + (xScale.bandwidth() - barWidth) / 2;
        return `translate(${xPos}, 0)`;
      });

    // Update zero pill
    barsMerged.select('.zero-bar-pill')
      .attr('width', barWidth)
      .attr('y', innerHeight - 4)
      .attr('fill', d => (d as BarDataItem).isTodayOrCurrent ? accentColor : zeroMgBarColor)
      .transition()
      .duration(400)
      .attr('opacity', d => (d as BarDataItem).mg === 0 ? 0.7 : 0);

    // Animate data bars height and y
    barsMerged.select<SVGRectElement>('.data-bar')
      .attr('width', barWidth)
      .attr('rx', viewMode === 'daily' ? 4 : 6)
      .attr('fill', d => {
        const item = d as BarDataItem;
        if (item.mg === 0) return zeroMgBarColor;
        if (item.mg > 400) return dangerBarColor;
        return 'url(#d3-bar-gradient)';
      })
      .transition()
      .duration(700)
      .delay((_, i) => Math.min(250, i * 8))
      .ease(d3.easeCubicOut)
      .attr('y', d => {
        const item = d as BarDataItem;
        return item.mg === 0 ? innerHeight : yScale(item.mg);
      })
      .attr('height', d => {
        const item = d as BarDataItem;
        return item.mg === 0 ? 0 : Math.max(3, innerHeight - yScale(item.mg));
      });

    // Event Handlers for Bars and Hover Target
    barsMerged
      .on('mouseenter touchstart', function (event, d) {
        if (hideTooltipTimeout.current) clearTimeout(hideTooltipTimeout.current);

        // Highlight this bar
        d3.select(this).select('.data-bar')
          .transition()
          .duration(150)
          .attr('filter', 'url(#d3-glow-filter)')
          .attr('transform', 'scale(1.06)')
          .attr('transform-origin', `${barWidth / 2}px ${innerHeight}px`);

        // Compute tooltip coordinates relative to container
        const barNode = this as SVGGElement;
        const rect = barNode.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const xPos = (rect.left + rect.width / 2) - containerRect.left;
        const yPos = Math.max(10, (rect.top + (d.mg > 0 ? yScale(d.mg) - innerHeight : 0)) - containerRect.top);

        setActiveTooltip({
          visible: true,
          x: xPos,
          y: yPos,
          data: viewMode === 'daily' 
            ? { ...(d.rawItem as DailyChartItem), type: 'daily' }
            : { ...(d.rawItem as WeeklyChartItem), type: 'weekly' }
        });

        // Highlight trend dot if exists
        mainGroup.selectAll(`.trend-dot-${d.index}`)
          .transition()
          .duration(200)
          .attr('r', 6)
          .attr('stroke-width', 3);
      })
      .on('mouseleave touchend', function (_event, d) {
        d3.select(this).select('.data-bar')
          .transition()
          .duration(200)
          .attr('filter', null)
          .attr('transform', null);

        mainGroup.selectAll(`.trend-dot-${d.index}`)
          .transition()
          .duration(200)
          .attr('r', viewMode === 'daily' ? 3 : 4)
          .attr('stroke-width', 2);

        hideTooltipTimeout.current = setTimeout(() => {
          setActiveTooltip(prev => ({ ...prev, visible: false }));
        }, 300);
      });

    // ==========================================
    // TRENDLINE & CURVE RENDERING (D3 LINE GENERATOR)
    // ==========================================
    let trendGroup = mainGroup.select<SVGGElement>('.trend-layer');
    if (trendGroup.empty()) {
      trendGroup = mainGroup.append('g').attr('class', 'trend-layer');
    }

    const lineGenerator = d3.line<BarDataItem>()
      .x(d => (xScale(d.index.toString()) || 0) + xScale.bandwidth() / 2)
      .y(d => yScale(d.trend))
      .curve(d3.curveMonotoneX);

    // Trendline path
    let trendPath = trendGroup.select<SVGPathElement>('path.trend-line');
    if (trendPath.empty()) {
      trendPath = trendGroup.append('path')
        .attr('class', 'trend-line')
        .attr('fill', 'none')
        .attr('stroke-width', 2.2)
        .attr('stroke-dasharray', '4 4')
        .attr('opacity', 0);
    }

    trendPath
      .attr('stroke', trendColor)
      .transition()
      .duration(700)
      .ease(d3.easeCubicOut)
      .attr('opacity', 0.9)
      .attr('d', lineGenerator(barData));

    // Interactive Trend Data Points (Circles)
    const trendDots = trendGroup.selectAll<SVGCircleElement, BarDataItem>('circle.trend-dot')
      .data(barData, d => d.id);

    trendDots.exit()
      .transition()
      .duration(300)
      .attr('r', 0)
      .remove();

    const dotRadius = viewMode === 'daily' ? 3 : 4;

    const trendDotsEnter = trendDots.enter()
      .append('circle')
      .attr('class', (d) => `trend-dot trend-dot-${d.index}`)
      .attr('cx', d => (xScale(d.index.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('cy', innerHeight)
      .attr('r', 0)
      .attr('fill', theme === 'light' ? '#ffffff' : '#090a0f')
      .attr('stroke', trendColor)
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer');

    const trendDotsMerged = trendDotsEnter.merge(trendDots);

    trendDotsMerged
      .attr('class', d => `trend-dot trend-dot-${d.index}`)
      .attr('fill', theme === 'light' ? '#ffffff' : '#090a0f')
      .attr('stroke', trendColor)
      .transition()
      .duration(700)
      .delay((_, i) => Math.min(250, i * 6))
      .ease(d3.easeCubicOut)
      .attr('cx', d => (xScale(d.index.toString()) || 0) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d.trend))
      .attr('r', dotRadius);

    // ==========================================
    // X AXIS LABELS (SMART & HIGH-CONTRAST)
    // ==========================================
    let xAxisGroup = mainGroup.select<SVGGElement>('.x-axis');
    if (xAxisGroup.empty()) {
      xAxisGroup = mainGroup.append('g').attr('class', 'x-axis');
    }
    xAxisGroup.attr('transform', `translate(0, ${innerHeight})`);

    const xLabels = xAxisGroup.selectAll<SVGGElement, BarDataItem>('g.x-tick-group')
      .data(barData, d => d.id);

    xLabels.exit()
      .transition()
      .duration(300)
      .attr('opacity', 0)
      .remove();

    const xLabelsEnter = xLabels.enter()
      .append('g')
      .attr('class', 'x-tick-group')
      .attr('transform', d => `translate(${(xScale(d.index.toString()) || 0) + xScale.bandwidth() / 2}, 0)`);

    // Primary Date Label
    xLabelsEnter.append('text')
      .attr('class', 'tick-primary')
      .attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9.5px')
      .attr('font-weight', '500');

    // Subtitle / Day of Week Label
    xLabelsEnter.append('text')
      .attr('class', 'tick-sub')
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .attr('font-weight', '400');

    const xLabelsMerged = xLabelsEnter.merge(xLabels);

    xLabelsMerged
      .transition()
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr('transform', d => `translate(${(xScale(d.index.toString()) || 0) + xScale.bandwidth() / 2}, 0)`);

    xLabelsMerged.select('.tick-primary')
      .attr('fill', d => {
        const item = d as BarDataItem;
        if (item.isTodayOrCurrent) return accentColor;
        return tickColor;
      })
      .attr('font-weight', d => (d as BarDataItem).isTodayOrCurrent ? '700' : '500')
      .attr('font-size', d => (d as BarDataItem).isTodayOrCurrent ? '11px' : viewMode === 'daily' ? '9.5px' : '10px')
      .text(d => {
        const item = d as BarDataItem;
        if (viewMode === 'daily') {
          return (item.rawItem as DailyChartItem).shortDate || item.rawItem.name;
        }
        return item.rawItem.name;
      });

    xLabelsMerged.select('.tick-sub')
      .attr('fill', d => {
        const item = d as BarDataItem;
        if (item.isTodayOrCurrent) return accentColor;
        return theme === 'light' ? '#94a3b8' : '#64748b';
      })
      .attr('font-weight', d => (d as BarDataItem).isTodayOrCurrent ? '700' : '400')
      .text(d => {
        const item = d as BarDataItem;
        if (viewMode === 'daily') {
          return item.isTodayOrCurrent ? 'Dziś' : (item.rawItem as DailyChartItem).dayAbbr;
        }
        return (item.rawItem as WeeklyChartItem).cleanDays > 0 ? `${(item.rawItem as WeeklyChartItem).cleanDays}d czyste` : '';
      });

  }, [
    viewMode,
    dailyData,
    weeklyData,
    accentColor,
    theme,
    gridColor,
    tickColor,
    zeroMgBarColor,
    dangerBarColor,
    trendColor
  ]);

  // ResizeObserver & initial render
  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth || 360);
    }
    renderChart();

    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth || 360);
      }
      renderChart();
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
      handleResize();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      if (hideTooltipTimeout.current) clearTimeout(hideTooltipTimeout.current);
    };
  }, [renderChart]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full select-none"
    >
      <svg 
        ref={svgRef} 
        className="overflow-visible block"
      />

      {/* Interactive Tooltip Overlay */}
      {activeTooltip.visible && activeTooltip.data && (
        <div
          className={`absolute z-30 pointer-events-none transition-all duration-150 ease-out py-2.5 px-3.5 rounded-2xl shadow-2xl border ${modalBgClass}`}
          style={{
            left: `${Math.min(Math.max(10, activeTooltip.x - 95), containerWidth - 210)}px`,
            top: `${Math.max(4, activeTooltip.y - 120)}px`,
            minWidth: '190px',
            maxWidth: '240px',
            boxShadow: `0 8px 24px -4px rgba(0,0,0,0.6), 0 0 12px ${accentGlow}`
          }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-zinc-500/20 pb-1.5 mb-1.5">
            <span className="font-bold text-xs" style={{ color: accentColor }}>
              {activeTooltip.data.fullDate}
            </span>
            {activeTooltip.data.type === 'daily' && activeTooltip.data.isToday && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-md font-bold text-white uppercase tracking-wider shrink-0"
                style={{ backgroundColor: accentColor }}
              >
                Dzisiaj
              </span>
            )}
            {activeTooltip.data.type === 'weekly' && activeTooltip.data.isCurrentWeek && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-md font-bold text-white uppercase tracking-wider shrink-0"
                style={{ backgroundColor: accentColor }}
              >
                Ten tydzień
              </span>
            )}
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between font-semibold">
              <span>{activeTooltip.data.type === 'daily' ? 'Spożycie:' : 'Suma tygodnia:'}</span>
              <span className={activeTooltip.data.mg === 0 ? 'text-emerald-500 font-bold' : activeTooltip.data.mg > 400 ? 'text-rose-500 font-bold' : 'font-bold'}>
                {activeTooltip.data.mg} mg
              </span>
            </div>

            {activeTooltip.data.type === 'weekly' && (
              <>
                <div className={`flex items-center justify-between text-[11px] ${muteTextClass}`}>
                  <span>Średnia dzienna:</span>
                  <span>~{(activeTooltip.data as WeeklyChartItem).avgDaily} mg/dzień</span>
                </div>
                <div className={`flex items-center justify-between text-[11px] ${muteTextClass}`}>
                  <span>Czyste dni:</span>
                  <span className="text-emerald-400 font-medium">{(activeTooltip.data as WeeklyChartItem).cleanDays}/7 dni</span>
                </div>
              </>
            )}

            <div className={`flex items-center justify-between text-[11px] font-medium ${muteTextClass}`}>
              <span>Wartość trendu:</span>
              <span>~{activeTooltip.data.trend} mg</span>
            </div>
          </div>

          {activeTooltip.data.type === 'daily' && activeTooltip.data.drinksDetail && activeTooltip.data.drinksDetail.length > 0 && (
            <div className="mt-2 pt-1.5 border-t border-zinc-500/20 text-[10px] space-y-0.5">
              <span className={`font-semibold ${subTextClass}`}>Wypite napoje:</span>
              {activeTooltip.data.drinksDetail.map((d: string, idx: number) => (
                <p key={idx} className={muteTextClass}>• {d}</p>
              ))}
            </div>
          )}

          {activeTooltip.data.mg === 0 && (
            <div className="mt-1.5 pt-1.5 border-t border-emerald-500/20 text-[10px] font-bold text-emerald-500 flex items-center gap-1">
              <Sparkles size={11} /> 100% Czystości (0 mg)
            </div>
          )}
        </div>
      )}
    </div>
  );
};
