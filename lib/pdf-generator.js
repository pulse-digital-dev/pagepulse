// PagePulse PDF Report Generator (Pro only)
// Uses jsPDF to generate a branded analysis report

(function() {
  'use strict';

  var STATUS_LABELS = {
    fail: 'FAIL',
    warn: 'WARN',
    pass: 'PASS',
    info: 'INFO'
  };

  var CATEGORY_NAMES = {
    seo: 'SEO',
    performance: 'Performance',
    accessibility: 'Accessibility',
    structure: 'Structure',
    llmo: 'AI Optimization (LLMO)'
  };

  var CATEGORY_WEIGHTS = {
    seo: 0.20,
    performance: 0.20,
    accessibility: 0.15,
    structure: 0.15,
    llmo: 0.30
  };

  function generate(analysisData, pageUrl, calcCategoryScore) {
    if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
      console.error('jsPDF library not loaded');
      return;
    }

    var jsPDF = (window.jspdf && window.jspdf.jsPDF) || jspdf.jsPDF;
    var doc = new jsPDF('p', 'mm', 'a4');
    var pageWidth = doc.internal.pageSize.getWidth();
    var pageHeight = doc.internal.pageSize.getHeight();
    var margin = 20;
    var contentWidth = pageWidth - margin * 2;
    var y = margin;

    // ---- Header ----
    doc.setFillColor(15, 15, 26);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(240, 240, 245);
    doc.text('PagePulse', margin, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(155, 155, 180);
    doc.text('Website Analysis Report', margin, 30);

    doc.setFontSize(8);
    doc.setTextColor(94, 94, 120);
    var urlDisplay = pageUrl.length > 80 ? pageUrl.substring(0, 80) + '...' : pageUrl;
    doc.text(urlDisplay, margin, 38);

    var now = new Date();
    var dateStr = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0');
    doc.text(dateStr, pageWidth - margin, 38, { align: 'right' });

    y = 55;

    // ---- Overall Score ----
    var scores = {};
    var totalScore = 0;
    var catKeys = Object.keys(CATEGORY_NAMES);
    catKeys.forEach(function(cat) {
      if (analysisData[cat]) {
        scores[cat] = calcCategoryScore(analysisData[cat]);
      }
    });
    catKeys.forEach(function(cat) {
      if (scores[cat] !== undefined) {
        totalScore += scores[cat] * (CATEGORY_WEIGHTS[cat] || 0);
      }
    });
    totalScore = Math.round(totalScore);

    // Score circle area
    var scoreColor = totalScore >= 80 ? [0, 214, 143] : totalScore >= 50 ? [255, 217, 61] : [255, 107, 107];
    doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.setLineWidth(1.5);
    doc.circle(margin + 18, y + 12, 14);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(String(totalScore), margin + 18, y + 15, { align: 'center' });

    doc.setFontSize(7);
    doc.setTextColor(155, 155, 180);
    doc.text('/ 100', margin + 18, y + 20, { align: 'center' });

    // Category score badges
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    var badgeX = margin + 42;
    catKeys.forEach(function(cat) {
      if (scores[cat] === undefined) return;
      var s = scores[cat];
      var c = s >= 80 ? [0, 214, 143] : s >= 50 ? [255, 217, 61] : [255, 107, 107];
      doc.setTextColor(c[0], c[1], c[2]);
      doc.text(CATEGORY_NAMES[cat] + ': ' + s, badgeX, y + 10);
      badgeX += doc.getTextWidth(CATEGORY_NAMES[cat] + ': ' + s) + 8;
      if (badgeX > pageWidth - margin) {
        badgeX = margin + 42;
        y += 6;
      }
    });

    y += 30;

    // ---- Divider ----
    doc.setDrawColor(230, 230, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // ---- Category Details ----
    catKeys.forEach(function(cat) {
      var items = analysisData[cat];
      if (!items || items.length === 0) return;

      // Check page space
      if (y > pageHeight - 40) {
        doc.addPage();
        y = margin;
      }

      // Category header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(108, 92, 231);
      doc.text(CATEGORY_NAMES[cat] || cat, margin, y);

      var catScore = scores[cat] || 0;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      var csc = catScore >= 80 ? [0, 214, 143] : catScore >= 50 ? [255, 217, 61] : [255, 107, 107];
      doc.setTextColor(csc[0], csc[1], csc[2]);
      doc.text(catScore + ' / 100', pageWidth - margin, y, { align: 'right' });

      y += 3;
      doc.setDrawColor(108, 92, 231);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;

      // Sort items by status
      var order = { fail: 0, warn: 1, pass: 2, info: 3 };
      var sorted = items.slice().sort(function(a, b) {
        return (order[a.status] || 3) - (order[b.status] || 3);
      });

      sorted.forEach(function(item) {
        if (y > pageHeight - 25) {
          doc.addPage();
          y = margin;
        }

        // Status indicator
        var statusColors = {
          fail: [255, 107, 107],
          warn: [255, 217, 61],
          pass: [0, 214, 143],
          info: [0, 180, 216]
        };
        var sc = statusColors[item.status] || [155, 155, 180];
        doc.setFillColor(sc[0], sc[1], sc[2]);
        doc.circle(margin + 2, y - 1.5, 2, 'F');

        // Status label
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(sc[0], sc[1], sc[2]);
        doc.text(STATUS_LABELS[item.status] || 'INFO', margin + 6, y);

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 60);
        var titleText = item.title || '';
        if (titleText.length > 70) titleText = titleText.substring(0, 70) + '...';
        doc.text(titleText, margin + 18, y);
        y += 4;

        // Body
        if (item.body) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(120, 120, 140);
          var bodyLines = doc.splitTextToSize(item.body, contentWidth - 18);
          if (bodyLines.length > 3) bodyLines = bodyLines.slice(0, 3);
          doc.text(bodyLines, margin + 18, y);
          y += bodyLines.length * 3.5;
        }

        // Action
        if (item.action) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(7.5);
          doc.setTextColor(108, 92, 231);
          var actionClean = item.action.replace(/\n\ud83d\udcdd.*$/s, '');
          var actionLines = doc.splitTextToSize(actionClean, contentWidth - 18);
          if (actionLines.length > 2) actionLines = actionLines.slice(0, 2);
          doc.text(actionLines, margin + 18, y);
          y += actionLines.length * 3.5;
        }

        y += 3;
      });

      y += 4;
    });

    // ---- Footer ----
    var totalPages = doc.internal.getNumberOfPages();
    for (var i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(155, 155, 180);
      doc.text('Generated by PagePulse v1.4.0 | pulse-digital.dev', margin, pageHeight - 10);
      doc.text('Page ' + i + ' / ' + totalPages, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }

    // Save
    var timestamp = now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0');
    doc.save('pagepulse-report-' + timestamp + '.pdf');
  }

  // Expose globally
  window.PagePulsePDF = {
    generate: generate
  };
})();
