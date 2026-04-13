import React from "react";

export default function ReviewResults({ result }) {
  if (!result) {
    return null;
  }

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: "#e74c3c",
      High: "#e67e22",
      Medium: "#f39c12",
      Low: "#3498db",
      Safe: "#27ae60",
    };
    return colors[severity] || "#95a5a6";
  };

  return (
    <div className="review-results">
      <div className="results-header">
        <div className="results-title">
          <h3>{result.title || result.fileName || "Code Review"}</h3>
          <span
            className="severity-badge"
            style={{ backgroundColor: getSeverityColor(result.severityLevel) }}
          >
            {result.severityLevel || "Medium"}
          </span>
        </div>
        <div className="results-meta">
          <span className="language-tag">{result.language}</span>
          <span className="timestamp">
            {new Date(result.timestamp).toLocaleString()}
          </span>
        </div>
      </div>

      {result.code && (
        <details className="code-details">
          <summary>📄 View Original Code</summary>
          <pre className="code-preview">
            <code>{result.code}</code>
          </pre>
        </details>
      )}

      <div className="review-content">
        <div className="markdown-content">
          {formatReviewContent(result.review)}
        </div>
      </div>
    </div>
  );
}

// Helper function to format markdown-style review with better styling
function formatReviewContent(text) {
  const lines = text.split("\n");
  const elements = [];
  let inCodeBlock = false;
  let codeContent = "";
  let listItems = [];

  lines.forEach((line, i) => {
    // Handle code blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="review-code-block">
            <code>{codeContent}</code>
          </pre>,
        );
        codeContent = "";
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeContent += line + "\n";
      return;
    }

    // Flush any pending list items
    if (listItems.length > 0 && !line.startsWith("- ")) {
      elements.push(
        <ul key={`list-${i}`} className="review-list">
          {listItems.map((item, idx) => (
            <li key={idx} className="review-list-item">
              {item}
            </li>
          ))}
        </ul>,
      );
      listItems = [];
    }

    // Headers
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="review-heading">
          {line.replace("## ", "").trim()}
        </h2>,
      );
      return;
    }
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="review-subheading">
          {line.replace("### ", "").trim()}
        </h3>,
      );
      return;
    }

    // List items
    if (line.startsWith("- ")) {
      listItems.push(line.replace("- ", "").trim());
      return;
    }

    // Bold and italic formatting within paragraphs
    if (line.trim()) {
      const formatted = formatInlineMarkdown(line.trim());
      elements.push(
        <p key={i} className="review-text">
          {formatted}
        </p>,
      );
    }
  });

  // Flush remaining list items
  if (listItems.length > 0) {
    elements.push(
      <ul key="final-list" className="review-list">
        {listItems.map((item, idx) => (
          <li key={idx} className="review-list-item">
            {item}
          </li>
        ))}
      </ul>,
    );
  }

  return <>{elements}</>;
}

// Helper to format inline markdown elements
function formatInlineMarkdown(text) {
  const parts = [];
  let lastIndex = 0;

  // Match **bold** and ***bold italic*** and `code`
  const regex = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|_(.+?)_|`(.+?)`/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[1]) {
      // ***bold italic***
      parts.push(
        <strong key={match.index} style={{ fontStyle: "italic" }}>
          {match[1]}
        </strong>,
      );
    } else if (match[2]) {
      // **bold**
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3]) {
      // _italic_
      parts.push(<em key={match.index}>{match[3]}</em>);
    } else if (match[4]) {
      // `code`
      parts.push(
        <code key={match.index} className="inline-code">
          {match[4]}
        </code>,
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
