import React, { useState } from "react";
import {
  Quote as QuoteIcon,
  ExternalLink,
  Copy,
  Search,
  X,
} from "lucide-react";
import type { Quote } from "../types";
import "./KeyQuotes.css";

interface KeyQuotesProps {
  quotes: Quote[];
}

const KeyQuotes: React.FC<KeyQuotesProps> = ({ quotes }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedQuote, setCopiedQuote] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const handleQuoteClick = (quote: Quote) => {
    // Use your custom link for each quote
    if (quote.link) {
      window.open(quote.link, "_blank");
    } else {
      // Fallback if no link is provided
      console.log("No link provided for this quote");
    }
  };

  const handleCopyQuote = async (
    quote: Quote,
    index: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const quoteText = `"${quote.text}" - ${quote.significance}`;

    try {
      await navigator.clipboard.writeText(quoteText);
      setCopiedQuote(index);
      setTimeout(() => setCopiedQuote(null), 2000);
    } catch (err) {
      console.error("Failed to copy quote: ", err);
    }
  };

  const filteredQuotes = quotes.filter(
    (quote) =>
      quote.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.significance.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayQuotes = searchTerm ? filteredQuotes : quotes;

  return (
    <div className="quotes-section">
      <div className="section-header">
        <h3 className="section-title">
          <QuoteIcon size={24} />
          Trích dẫn nổi bật
        </h3>
        <div className="section-stats">
          <span className="quote-count">{displayQuotes.length} trích dẫn</span>
        </div>
      </div>

      <div className="section-actions">
        <button
          className={`search-toggle ${showSearch ? "active" : ""}`}
          onClick={() => setShowSearch(!showSearch)}
          aria-label="Toggle search"
        >
          <Search size={20} />
          Tìm kiếm
        </button>
      </div>

      {showSearch && (
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm trích dẫn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Search quotes"
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="search-results">
              <span>{displayQuotes.length} kết quả tìm kiếm</span>
            </div>
          )}
        </div>
      )}

      <div className="quotes-grid">
        {displayQuotes.map((quote) => {
          const originalIndex = quotes.indexOf(quote);
          const isCopied = copiedQuote === originalIndex;

          return (
            <div
              key={originalIndex}
              className="quote-card clickable"
              onClick={() => handleQuoteClick(quote)}
              role="button"
              tabIndex={0}
              aria-label={`Trích dẫn #${
                originalIndex + 1
              }: ${quote.text.substring(0, 50)}...`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleQuoteClick(quote);
                }
              }}
            >
              {quote.link && (
                <div className="quote-hover-hint">
                  <span>Click để xem chi tiết</span>
                  <ExternalLink size={12} />
                </div>
              )}

              <div className="quote-header">
                <div className="quote-number">#{originalIndex + 1}</div>
                <div className="quote-actions">
                  <button
                    className="copy-btn"
                    onClick={(e) => handleCopyQuote(quote, originalIndex, e)}
                    aria-label="Copy quote"
                  >
                    <Copy size={16} />
                  </button>
                  {quote.link && (
                    <div className="quote-link-indicator">
                      <ExternalLink size={14} />
                    </div>
                  )}
                </div>
              </div>

              {isCopied && (
                <div className="copy-feedback">
                  <span>Đã sao chép!</span>
                </div>
              )}

              <div className="quote-text">
                <QuoteIcon size={32} className="quote-mark" />
                <p>{quote.text}</p>
              </div>

              <div className="quote-significance">
                <div className="significance-header">
                  <strong>Ý nghĩa:</strong>
                </div>
                <p>{quote.significance}</p>
              </div>

              {quote.citation && (
                <div className="quote-citation">
                  <div className="citation-header">
                    <strong>Nguồn:</strong>
                  </div>
                  <p>{quote.citation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {displayQuotes.length === 0 && (
        <div className="no-results">
          <QuoteIcon size={48} className="no-results-icon" />
          <h3>Không tìm thấy kết quả</h3>
          <p>Thử tìm kiếm với từ khóa khác.</p>
        </div>
      )}
    </div>
  );
};

export default KeyQuotes;
