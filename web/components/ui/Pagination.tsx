'use client';

import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  itemLabel?: string;
  className?: string;
}

/**
 * Industry-standard sliding window pagination.
 *
 * Behaviour:
 * - Always shows First (1) and Last (totalPages) page buttons
 * - Sliding window of up to 3 consecutive pages centred on currentPage
 * - Ellipsis (...) appears when there is a gap, never consecutively
 * - Maximum 7 nodes rendered (1 + ... + 3 middle + ... + last)
 * - Previous disabled when on page 1 or loading
 * - Next disabled when on last page or loading
 * - Hides itself completely only when there is truly 0 data (totalRecords === 0)
 * - When totalPages === 1, renders as a single disabled page-1 button with
 *   both Prev/Next disabled — no layout shift
 */
function buildPageWindow(current: number, total: number): (number | '...')[] {
  if (total <= 1) return [1];

  // For small totals, just render every page number
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];

  // Always include first page
  pages.push(1);

  // Sliding window centred on current, 3 wide
  const winStart = Math.max(2, current - 1);
  const winEnd = Math.min(total - 1, current + 1);

  if (winStart > 2) pages.push('...');

  for (let i = winStart; i <= winEnd; i++) {
    pages.push(i);
  }

  if (winEnd < total - 1) pages.push('...');

  // Always include last page
  pages.push(total);

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [8, 16, 24],
  isLoading = false,
  itemLabel = 'records',
  className = '',
}: PaginationProps) {
  // Don't render at all if there is genuinely nothing
  if (typeof totalRecords === 'number' && totalRecords === 0) return null;

  const safePage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const safeTotal = Math.max(1, totalPages || 1);

  const isPrevDisabled = safePage <= 1 || isLoading;
  const isNextDisabled = safePage >= safeTotal || isLoading;

  const pageNodes = buildPageWindow(safePage, safeTotal);

  // Range text: "Showing 1 - 8 of 64 activities"
  const rangeStart = totalRecords === 0 ? 0 : (safePage - 1) * (pageSize || 8) + 1;
  const rangeEnd = Math.min(safePage * (pageSize || 8), totalRecords ?? 0);

  return (
    <div
      className={`p-3.5 border-t border-[#3c4a42] bg-[#1a1b21]/70 flex flex-wrap items-center justify-between gap-3 text-xs font-mono select-none ${className}`}
    >
      {/* Left: record range summary + page-size selector */}
      <div className="flex flex-wrap items-center gap-3 text-[#86948a]">
        {typeof totalRecords === 'number' && typeof pageSize === 'number' && (
          <span>
            Showing{' '}
            <span className="text-[#e3e1e9] font-medium">{rangeStart}</span>
            {' – '}
            <span className="text-[#e3e1e9] font-medium">{rangeEnd}</span>
            {' of '}
            <span className="text-[#e3e1e9] font-medium">{totalRecords}</span>
            {' '}
            {itemLabel}
          </span>
        )}

        {onPageSizeChange && typeof pageSize === 'number' && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#3c4a42]/60">
            <span className="text-[11px] text-[#86948a]">Per page:</span>
            {pageSizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                disabled={isLoading}
                onClick={() => onPageSizeChange(size)}
                className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                  pageSize === size
                    ? 'bg-[#10b981]/20 border-[#10b981]/40 text-[#4edea3] font-semibold'
                    : 'bg-[#0d0e13] border-[#3c4a42] text-[#86948a] hover:text-[#e3e1e9] hover:border-[#5c6a62]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Previous / Page numbers / Next */}
      <div className="flex items-center gap-1 ml-auto">
        {/* ← Previous */}
        <button
          type="button"
          disabled={isPrevDisabled}
          onClick={() => !isPrevDisabled && onPageChange(safePage - 1)}
          className={`inline-flex items-center gap-1 h-7 px-2.5 rounded border text-[11px] font-medium transition-colors ${
            isPrevDisabled
              ? 'bg-[#0d0e13] border-[#2a3230] text-[#4a5a52] cursor-not-allowed'
              : 'bg-[#1e1f25] border-[#3c4a42] text-[#bbcabf] hover:text-[#e3e1e9] hover:border-[#5c6a62] cursor-pointer'
          }`}
          aria-disabled={isPrevDisabled}
          aria-label="Previous page"
        >
          <span className="material-symbols-outlined text-[15px]">chevron_left</span>
          <span>Prev</span>
        </button>

        {/* Page number buttons with sliding window */}
        <div className="flex items-center gap-1">
          {pageNodes.map((node, idx) => {
            if (node === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 h-7 flex items-center justify-center text-[#4a5a52] select-none"
                  aria-hidden="true"
                >
                  ···
                </span>
              );
            }

            const pageNum = node as number;
            const isActive = pageNum === safePage;

            return (
              <button
                key={pageNum}
                type="button"
                disabled={isLoading}
                onClick={() => !isActive && !isLoading && onPageChange(pageNum)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Page ${pageNum}`}
                className={`min-w-[28px] h-7 px-1.5 rounded text-[11px] font-mono font-semibold border transition-colors ${
                  isActive
                    ? 'bg-[#10b981] text-[#002a1a] border-[#4edea3]/30 shadow-sm cursor-default'
                    : isLoading
                    ? 'bg-[#0d0e13] border-[#2a3230] text-[#4a5a52] cursor-not-allowed'
                    : 'bg-[#0d0e13] border-[#3c4a42] text-[#bbcabf] hover:text-[#e3e1e9] hover:border-[#5c6a62] hover:bg-[#1e1f25] cursor-pointer'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next → */}
        <button
          type="button"
          disabled={isNextDisabled}
          onClick={() => !isNextDisabled && onPageChange(safePage + 1)}
          className={`inline-flex items-center gap-1 h-7 px-2.5 rounded border text-[11px] font-medium transition-colors ${
            isNextDisabled
              ? 'bg-[#0d0e13] border-[#2a3230] text-[#4a5a52] cursor-not-allowed'
              : 'bg-[#1e1f25] border-[#3c4a42] text-[#bbcabf] hover:text-[#e3e1e9] hover:border-[#5c6a62] cursor-pointer'
          }`}
          aria-disabled={isNextDisabled}
          aria-label="Next page"
        >
          <span>Next</span>
          <span className="material-symbols-outlined text-[15px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
