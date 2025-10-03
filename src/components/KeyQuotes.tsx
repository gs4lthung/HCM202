import React from "react";
import { Quote as QuoteIcon, ExternalLink } from "lucide-react";
import type { Quote } from "../types";
import "./KeyQuotes.css";

interface KeyQuotesProps {
  quotes: Quote[];
}

const KeyQuotes: React.FC<KeyQuotesProps> = ({ quotes }) => {
  const handleQuoteClick = (quote: Quote) => {
    // Use your custom link for each quote
    if (quote.link) {
      window.open(quote.link, "_blank");
    } else {
      // Fallback if no link is provided
      console.log("No link provided for this quote");
    }
  };

  return (
    <div className="quotes-section">
      <div className="section-header">
        <h3 className="section-title">
          <QuoteIcon size={24} />
          Trích dẫn nổi bật
        </h3>
        <div className="section-stats">
          <span className="quote-count">{quotes.length} trích dẫn</span>
        </div>
      </div>

      <div className="quotes-grid">
        {quotes.map((quote, index) => (
          <div
            key={index}
            className="quote-card clickable"
            onClick={() => handleQuoteClick(quote)}
          >
            <div className="quote-header">
              <div className="quote-number">#{index + 1}</div>
              <div className="quote-link-indicator">
                <ExternalLink size={14} />
              </div>
            </div>

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

            <div className="quote-hover-hint">
              <span>Click để xem chi tiết</span>
              <ExternalLink size={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyQuotes;
