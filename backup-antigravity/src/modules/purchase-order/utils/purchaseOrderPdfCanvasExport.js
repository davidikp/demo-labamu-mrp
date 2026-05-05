import { formatCurrency, formatNumberWithCommas, parseNumberFromCommas } from "../../../utils/format/formatUtils.js";
const GENERIC_LOGO_SRC = "https://placehold.co/400x120/f3f4f6/1f2937?text=LOGO";

const CSS_DPI = 96;
const PDF_DPI = 180;
const SCALE = PDF_DPI / CSS_DPI;

const cssToPx = (value) => value * SCALE;
const px = (value) => Math.round(cssToPx(value));

const A4_CSS_WIDTH = 794;
const A4_CSS_HEIGHT = 1123;
const PAGE_WIDTH = px(A4_CSS_WIDTH);
const PAGE_HEIGHT = px(A4_CSS_HEIGHT);

const COLORS = {
  text: "#1F1F1F",
  muted: "#676767",
  light: "#888888",
  line: "#2A2A2A",
  softLine: "#B6B6B6",
  headerFill: "#F2F2F2",
  footerLine: "#4A4A4A",
  white: "#FFFFFF",
  totalFill: "#F5F5F5",
};

const DIMENSIONS = {
  marginX: px(44),
  marginTop: px(30),
  marginBottom: px(34),
  footerHeight: px(20), // Reduced since footer is removed
  sectionGap: px(14),
  pageGap: px(12),
  headerLogoWidth: px(184),
  continuationLogoWidth: px(156),
  topMetaWidth: px(260),
  tableHeaderHeight: px(24),
  footerGap: px(14),
};

const TABLE = {
  colNo: px(28),
  colImage: px(62),
  colPrice: px(118),
  colQty: px(82),
  colAmount: px(124),
  cellPaddingX: px(7),
  cellPaddingY: px(6),
  imageBox: px(44),
  rowGap: px(4),
};

const FONTS = {
  title: { size: px(18), weight: 700 },
  section: { size: px(12), weight: 700 },
  body: { size: px(11), weight: 400 },
  bodyBold: { size: px(11), weight: 700 },
  tiny: { size: px(10), weight: 400 },
  tinyBold: { size: px(10), weight: 700 },
  tableHead: { size: px(10), weight: 700 },
  tableBody: { size: px(11), weight: 400 },
  tableBodyBold: { size: px(11), weight: 700 },
  footerHeading: { size: px(11), weight: 700 },
  footerBody: { size: px(10), weight: 400 },
  disclaimer: { size: px(8), weight: 400 },
};

const HEADER_META_LABEL_WIDTH = px(108);
const HEADER_META_ROW_GAP = px(5);
const HEADER_META_LINE_HEIGHT = Math.round(FONTS.body.size * 1.42);
const ASSIGNMENT_LINE_HEIGHT = Math.round(FONTS.body.size * 1.42);
const ASSIGNMENT_BLOCK_WIDTH = px(174);
const ASSIGNMENT_BLOCK_HEIGHT = px(78);
const ASSIGNMENT_BLOCK_GAP = px(30);

const encodeText = (value) => new TextEncoder().encode(String(value));

const concatBytes = (chunks) => {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });
  return result;
};

const bytesFromDataUrl = (dataUrl) => {
  const base64 = String(dataUrl || "").split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const createCanvas = () => {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH;
  canvas.height = PAGE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to initialize PDF canvas.");
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx };
};

const loadImage = (src) =>
  new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });

const isRenderablePdfImageSource = (value) =>
  typeof value === "string" &&
  /^(https?:|data:|blob:|\/)/i.test(value.trim());

const resolveImageSource = (image) => {
  if (!image) return "";

  if (typeof image === "string") {
    return isRenderablePdfImageSource(image) ? image : "";
  }

  if (typeof image === "object") {
    return image.previewUrl || image.url || image.src || "";
  }

  return "";
};

const splitParagraphs = (value) => {
  if (value === null || value === undefined) return [];
  return String(value)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const fontString = ({ size, weight }) => `${weight} ${size}px Arial, Helvetica, sans-serif`;

const setFont = (ctx, font) => {
  ctx.font = fontString(font);
};

const measureLines = (ctx, text, maxWidth, font) => {
  setFont(ctx, font);
  const words = String(text || "")
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return [""];
  }

  const lines = [];
  let current = "";

  words.forEach((word) => {
    const testLine = current ? `${current} ${word}` : word;
    if (ctx.measureText(testLine).width <= maxWidth || !current) {
      current = testLine;
    } else {
      lines.push(current);
      current = word;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [""];
};

const measureParagraphsHeight = (ctx, paragraphs, maxWidth, font, lineHeight) => {
  const rows = paragraphs.length ? paragraphs : ["-"];
  let height = 0;

  rows.forEach((paragraph, index) => {
    const lines = measureLines(ctx, paragraph, maxWidth, font);
    height += lines.length * lineHeight;
    if (index < rows.length - 1) {
      height += lineHeight * 0.3;
    }
  });

  return height;
};

const drawRoundedRect = (ctx, x, y, width, height, radius, fillStyle, strokeStyle, lineWidth = 1) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  }
};

const drawLine = (ctx, x1, y1, x2, y2, color = COLORS.line, width = 1) => {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

const drawText = (ctx, text, x, y, font, color = COLORS.text, options = {}) => {
  setFont(ctx, font);
  ctx.fillStyle = color;
  ctx.textAlign = options.align || "left";
  ctx.textBaseline = options.baseline || "alphabetic";
  ctx.fillText(String(text), x, y);
};

const drawWrappedText = (ctx, text, x, y, maxWidth, font, color, options = {}) => {
  const paragraphs = Array.isArray(text) ? text : splitParagraphs(text);
  const lineHeight = options.lineHeight || Math.round(font.size * 1.42);
  const gap = options.paragraphGap || Math.round(lineHeight * 0.35);
  let cursorY = y;

  if (!paragraphs.length) {
    drawText(ctx, "-", x, cursorY, font, color);
    return lineHeight;
  }

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const lines = measureLines(ctx, paragraph, maxWidth, font);
    lines.forEach((line, lineIndex) => {
      drawText(ctx, line, x, cursorY, font, color, options);
      cursorY += lineHeight;
      if (lineIndex < lines.length - 1) {
        // keep compact line spacing
      }
    });
    if (paragraphIndex < paragraphs.length - 1) {
      cursorY += gap;
    }
  });

  return cursorY - y;
};

const drawImageCover = (ctx, image, x, y, width, height, align = "center") => {
  if (!image) return false;
  const sourceWidth = image.naturalWidth || image.width || 0;
  const sourceHeight = image.naturalHeight || image.height || 0;
  if (!sourceWidth || !sourceHeight) return false;

  const ratio = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * ratio;
  const drawHeight = sourceHeight * ratio;
  
  let offsetX = x;
  if (align === "center") {
    offsetX = x + (width - drawWidth) / 2;
  }
  
  const offsetY = y + (height - drawHeight) / 2;
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  return true;
};

const formatPdfQuantity = (line) => {
  const qty = Number(line?.quantity || 0);
  const uom = line?.uom ? String(line.uom).trim() : "";
  const qtyLabel = formatNumberWithCommas(qty);
  if (!uom) return qtyLabel || "0";
  return `${qtyLabel || "0"} ${uom}`;
};

const buildPdfImageDescriptor = (image) => {
  const src = resolveImageSource(image);
  return {
    src,
    label:
      typeof image === "object"
        ? image.label || image.name || image.fileName || ""
        : typeof image === "string" && !isRenderablePdfImageSource(image)
          ? image
          : "",
  };
};

const buildDescriptionBlocks = (line) => {
  const blocks = [
    {
      label: null,
      value: line?.item || "-",
      isTitle: true,
    },
  ];

  if (line?.code) {
    blocks.push({ label: "SKU / Code", value: line.code });
  }

  if (line?.desc) {
    blocks.push({ label: "Description", value: line.desc });
  }

  if (line?.woRef && line.woRef !== "-") {
    blocks.push({ label: "WO Ref", value: line.woRef });
  }

  return blocks;
};

const getHeaderMetaRows = (data) => [
  ["PO Number", data.poNumber || "-"],
  ["PO Date", data.createdDate || "-"],
  ["Expected Delivery Date", data.expectedDeliveryDate || "-"],
  ["Created By", data.createdBy || "-"],
];

const measureMetaBlockHeight = (ctx, data, width) => {
  let height = 0;
  const labelWidth = Math.min(HEADER_META_LABEL_WIDTH, Math.max(width * 0.54, px(88)));
  const valueWidth = Math.max(width - labelWidth, px(64));

  getHeaderMetaRows(data).forEach(([label, value], index, rows) => {
    const labelLines = measureLines(ctx, label, labelWidth, FONTS.tinyBold);
    const valueLines = measureLines(ctx, value || "-", valueWidth, FONTS.body);
    height += Math.max(labelLines.length, valueLines.length) * HEADER_META_LINE_HEIGHT;
    if (index < rows.length - 1) {
      height += HEADER_META_ROW_GAP;
    }
  });

  return height;
};

const COMPANY_INFO_LINE_HEIGHT = Math.round(FONTS.body.size * 1.3);

const measureCompanyInfoHeaderHeight = (ctx, data, width) => {
  let height = px(22); // Start with name height
  height += measureLines(ctx, data.company?.address || "-", width, FONTS.tiny).length * COMPANY_INFO_LINE_HEIGHT;
  height += COMPANY_INFO_LINE_HEIGHT; // Contact line
  return height + px(10);
};

const measureAssignmentFieldHeight = () => ASSIGNMENT_BLOCK_HEIGHT;

const measureHeaderHeight = (ctx, data, pageType) => {
  const isFirst = pageType === "first";
  const logoY = DIMENSIONS.marginTop;
  const logoHeight = Math.round((isFirst ? DIMENSIONS.headerLogoWidth : DIMENSIONS.continuationLogoWidth) * 0.35);
  
  let headerContentHeight = logoHeight;
  if (isFirst) {
    headerContentHeight += measureCompanyInfoHeaderHeight(ctx, data, DIMENSIONS.headerLogoWidth * 1.8);
  }

  const metaY = logoY + px(4); // Align top with logo or slightly below title
  const metaHeight = measureMetaBlockHeight(ctx, data, DIMENSIONS.topMetaWidth);
  
  const totalHeaderHeight = Math.max(logoY + headerContentHeight, metaY + metaHeight + px(12));
  return totalHeaderHeight + px(20);
};

export const buildPurchaseOrderPdfExportData = ({
  poNumber,
  createdDate,
  currency,
  vendorInfo,
  shipToInfo,
  lines = [],
  subtotal = 0,
  taxRate = 0,
  summaryFeeRows = [],
  total = 0,
  notes = "",
  terms = "",
  requestedBy = "",
  approvedBy = "",
  approvalEnabled = false,
  currentStatus = "",
  company = null,
}) => {
  const normalizedTaxRate = Number(parseNumberFromCommas(taxRate)) || 0;
  const normalizedSubtotal = Number(parseNumberFromCommas(subtotal)) || 0;
  const normalizedTotal = Number(parseNumberFromCommas(total)) || 0;
  const normalizedFeeRows = (summaryFeeRows || []).map((fee, index) => ({
    id: fee?.id || `fee-${index}`,
    name: fee?.name || `Fee ${index + 1}`,
    amount: Number(parseNumberFromCommas(fee?.amount)) || 0,
  }));

  return {
    poNumber: poNumber || "-",
    createdDate: createdDate || "-",
    currency: currency || "IDR",
    vendorInfo: vendorInfo || {},
    shipToInfo: shipToInfo || {},
    currentStatus: currentStatus || "",
    lineItems: (lines || []).map((line, index) => {
      const quantity = Number(parseNumberFromCommas(line?.qty || line?.quantity || 0)) || 0;
      const unitPrice = Number(parseNumberFromCommas(line?.price || 0)) || 0;
      const amount = quantity * unitPrice;
      return {
        id: line?.id || `po-line-${index}`,
        no: index + 1,
        quantity,
        quantityLabel: formatPdfQuantity({ ...line, quantity }),
        unitPrice,
        amount,
        image: buildPdfImageDescriptor(line?.image),
        descriptionBlocks: buildDescriptionBlocks(line),
      };
    }),
    summary: {
      subtotal: normalizedSubtotal,
      taxRate: normalizedTaxRate,
      taxAmount:
        normalizedSubtotal * (normalizedTaxRate > 0 ? normalizedTaxRate / 100 : 0),
      feeRows: normalizedFeeRows,
      total: normalizedTotal,
    },
    notesParagraphs: splitParagraphs(notes),
    termsParagraphs: splitParagraphs(terms),
    requestedBy: requestedBy || "-",
    approvedBy: approvedBy || "-",
    approvalEnabled: !!approvalEnabled,
    company:
      company || {
        name: "Labamu Manufacturing",
        phone: "+62 21 555 1234",
        email: "procurement@labamu.com",
        address:
          "Jl. Industri Utama Kav 9, South Tangerang, Banten, Indonesia 15320",
      },
  };
};

const measureDescriptionBlockHeight = (ctx, blocks, width) => {
  const titleFont = FONTS.tableBodyBold;
  const metaLabelFont = FONTS.tinyBold;
  const metaValueFont = FONTS.tiny;
  const titleLineHeight = Math.round(titleFont.size * 1.3);
  const metaLineHeight = Math.round(metaValueFont.size * 1.38);
  const metaLabelWidth = px(58);
  const innerWidth = width;

  let height = 0;
  const titleBlock = blocks[0];
  const titleLines = measureLines(ctx, titleBlock?.value || "-", innerWidth, titleFont);
  height += titleLines.length * titleLineHeight;
  height += px(2);

  blocks.slice(1).forEach((block, index) => {
    const label = block.label || "";
    const valueLines = measureLines(
      ctx,
      block.value || "-",
      Math.max(innerWidth - metaLabelWidth - px(8), px(12)),
      metaValueFont
    );
    const labelLines = measureLines(ctx, label, metaLabelWidth, metaLabelFont);
    const rowHeight = Math.max(
      labelLines.length * metaLineHeight,
      valueLines.length * metaLineHeight
    );
    height += rowHeight;
    if (index < blocks.slice(1).length - 1) {
      height += px(1.5);
    }
  });

  return height;
};

const measureLineHeight = (ctx, line, tableWidth) => {
  const descriptionWidth =
    tableWidth -
    TABLE.colNo -
    TABLE.colImage -
    TABLE.colPrice -
    TABLE.colQty -
    TABLE.colAmount -
    TABLE.cellPaddingX * 10;

  const descHeight = measureDescriptionBlockHeight(
    ctx,
    line.descriptionBlocks || [],
    descriptionWidth
  );
  const numericHeight = Math.max(FONTS.tableBody.size * 1.5, descHeight);
  return (
    numericHeight +
    TABLE.cellPaddingY * 2 +
    px(3)
  );
};

const measureSummaryHeight = (ctx, summary, currency, maxWidth) => {
  const rows = [
    { label: "Subtotal", value: formatCurrency(summary?.subtotal || 0, currency) },
    { label: `PPN ${Number(summary?.taxRate || 0)}%`, value: formatCurrency(summary?.taxAmount || 0, currency) },
    ...(summary?.feeRows || []).map((fee) => ({
      label: fee.name,
      value: formatCurrency(fee.amount || 0, currency),
    })),
    { label: "Total", value: formatCurrency(summary?.total || 0, currency), isTotal: true },
  ];

  const labelFont = FONTS.body;
  const valueFont = FONTS.bodyBold;
  const rowLineHeight = Math.round(FONTS.body.size * 1.55);
  let height = 0;

  rows.forEach((row, index) => {
    const labelLines = measureLines(ctx, row.label, maxWidth - px(120), labelFont);
    const valueLines = measureLines(ctx, row.value, px(110), valueFont);
    const rowHeight = Math.max(labelLines.length, valueLines.length) * rowLineHeight + px(2);
    height += rowHeight;
    if (index < rows.length - 1) {
      height += px(2);
    }
  });

  height += px(10);
  return height;
};

const measureTextBlockHeight = (ctx, paragraphs, width) => {
  const bodyFont = FONTS.body;
  const lineHeight = Math.round(bodyFont.size * 1.48);
  let height = 0;

  const rows = paragraphs.length ? paragraphs : ["-"];
  rows.forEach((paragraph, index) => {
    const lines = measureLines(ctx, paragraph, width, bodyFont);
    height += lines.length * lineHeight;
    if (index < rows.length - 1) {
      height += px(4);
    }
  });

  return height;
};

const drawSectionHeading = (ctx, title, x, y, width) => {
  drawText(ctx, title, x, y, FONTS.section, COLORS.text);
  drawLine(ctx, x, y + px(5), x + width, y + px(5), COLORS.softLine, px(0.8));
  return y + px(16);
};

const drawMetaBlock = (ctx, data, x, y, width) => {
  const labelFont = FONTS.tinyBold;
  const valueFont = FONTS.body;
  const rowGap = HEADER_META_ROW_GAP;
  const labelWidth = Math.min(HEADER_META_LABEL_WIDTH, Math.max(width * 0.54, px(88)));
  const valueWidth = Math.max(width - labelWidth, px(64));
  const rows = getHeaderMetaRows(data);

  let cursorY = y;
  rows.forEach(([label, value], index) => {
    const labelLines = measureLines(ctx, label, labelWidth, labelFont);
    const valueLines = measureLines(ctx, value || "-", valueWidth, valueFont);
    const rowHeight = Math.max(labelLines.length, valueLines.length) * HEADER_META_LINE_HEIGHT;
    drawWrappedText(
      ctx,
      label,
      x,
      cursorY,
      labelWidth,
      labelFont,
      COLORS.muted,
      { lineHeight: HEADER_META_LINE_HEIGHT, baseline: "top" }
    );
    drawWrappedText(
      ctx,
      value || "-",
      x + labelWidth,
      cursorY,
      valueWidth,
      valueFont,
      COLORS.text,
      { lineHeight: HEADER_META_LINE_HEIGHT, baseline: "top" }
    );

    cursorY += rowHeight;
    if (index < rows.length - 1) {
      cursorY += rowGap;
    }
  });

  return cursorY - y;
};

const drawHeader = async (ctx, pageType, data, assets) => {
  const isFirst = pageType === "first";
  const logoWidth = isFirst ? DIMENSIONS.headerLogoWidth : DIMENSIONS.continuationLogoWidth;
  const logoHeight = Math.round(logoWidth * 0.35);
  const logoX = DIMENSIONS.marginX;
  const logoY = DIMENSIONS.marginTop;

  if (assets.logo) {
    drawImageCover(ctx, assets.logo, logoX, logoY, logoWidth, logoHeight, "left");
  } else {
    drawText(ctx, data.company?.name || "Labamu Manufacturing", logoX, logoY + px(22), FONTS.title, COLORS.text);
  }

  let cursorY = logoY + logoHeight + px(8);

  if (isFirst) {
    // Draw company info below logo
    drawText(ctx, data.company?.name || "Labamu Manufacturing", logoX, cursorY, FONTS.bodyBold, COLORS.text, { baseline: "top" });
    cursorY += px(18);
    
    const addressWidth = logoWidth * 2.2;
    const addressHeight = drawWrappedText(ctx, data.company?.address || "-", logoX, cursorY, addressWidth, FONTS.tiny, COLORS.muted, { baseline: "top", lineHeight: COMPANY_INFO_LINE_HEIGHT });
    cursorY += addressHeight + px(2);

    const contactLine = [data.company?.phone, data.company?.email].filter(Boolean).join(" | ");
    drawText(ctx, contactLine || "-", logoX, cursorY, FONTS.tiny, COLORS.muted, { baseline: "top" });
    cursorY += COMPANY_INFO_LINE_HEIGHT;
  }

  const titleX = PAGE_WIDTH - DIMENSIONS.marginX - DIMENSIONS.topMetaWidth;
  if (isFirst) {
    drawText(ctx, "Purchase Order", titleX, logoY + px(12), FONTS.title, COLORS.text);
  }

  const metaY = logoY + (isFirst ? px(34) : px(4));
  const metaHeight = drawMetaBlock(ctx, data, titleX, metaY, DIMENSIONS.topMetaWidth);
  
  const headerBottom = Math.max(cursorY + px(10), metaY + metaHeight + px(14));
  drawLine(ctx, DIMENSIONS.marginX, headerBottom, PAGE_WIDTH - DIMENSIONS.marginX, headerBottom, COLORS.line, px(0.8));
  
  return headerBottom + px(14);
};

const drawInfoColumns = (ctx, data, y) => {
  const columnGap = px(22);
  const columnWidth = (PAGE_WIDTH - DIMENSIONS.marginX * 2 - columnGap) / 2;
  const labelWidth = px(84);
  const blockTop = y;

  const drawBlock = (x, title, fields) => {
    drawText(ctx, title, x, blockTop, FONTS.section, COLORS.text);
    let cursorY = blockTop + px(18);
    fields.forEach(([label, value], index) => {
      drawText(ctx, label, x, cursorY, FONTS.tinyBold, COLORS.muted);
      drawWrappedText(
        ctx,
        value || "-",
        x + labelWidth,
        cursorY,
        columnWidth - labelWidth,
        FONTS.body,
        COLORS.text,
        { lineHeight: Math.round(FONTS.body.size * 1.42) }
      );
      cursorY += Math.max(
        Math.round(FONTS.body.size * 1.42),
        measureLines(ctx, value || "-", columnWidth - labelWidth, FONTS.body).length *
          Math.round(FONTS.body.size * 1.42)
      );
      if (index < fields.length - 1) {
        cursorY += px(4);
      }
    });
  };

  drawBlock(DIMENSIONS.marginX, "Vendor Information", [
    ["Vendor Name", data.vendorInfo?.name || "-"],
    [
      "Contact",
      [data.vendorInfo?.phone, data.vendorInfo?.email].filter(Boolean).join(" | ") || "-",
    ],
    ["Address", data.vendorInfo?.address || "-"],
  ]);

  drawBlock(DIMENSIONS.marginX + columnWidth + columnGap, "Recipient Information", [
    ["Recipient Name", data.shipToInfo?.name || "-"],
    [
      "Contact",
      [data.shipToInfo?.phone, data.shipToInfo?.email].filter(Boolean).join(" | ") || "-",
    ],
    ["Address", data.shipToInfo?.address || "-"],
  ]);

  const approxHeight = px(106);
  return blockTop + approxHeight;
};

const drawTableHeader = (ctx, x, y, widths) => {
  const headerHeight = DIMENSIONS.tableHeaderHeight;
  ctx.fillStyle = COLORS.headerFill;
  ctx.fillRect(x, y, widths.reduce((sum, width) => sum + width, 0), headerHeight);

  const labels = ["No", "Image", "Description", "Price", "Qty", "Amount"];
  let cursorX = x;
  labels.forEach((label, index) => {
    const width = widths[index];
    drawText(
      ctx,
      label,
      cursorX + width / 2,
      y + headerHeight / 2 + px(3),
      FONTS.tableHead,
      COLORS.text,
      { align: "center", baseline: "middle" }
    );
    cursorX += width;
  });

  const tableWidth = widths.reduce((sum, width) => sum + width, 0);
  drawLine(ctx, x, y, x + tableWidth, y, COLORS.line, px(0.8));
  drawLine(ctx, x, y + headerHeight, x + tableWidth, y + headerHeight, COLORS.line, px(0.8));
};

const drawTableRow = async (ctx, row, x, y, widths, assets, currency) => {
  const rowHeight = measureLineHeight(ctx, row, widths.reduce((sum, width) => sum + width, 0));
  const imageX = x + widths[0];
  const descX = imageX + widths[1];
  const priceX = descX + widths[2];
  const qtyX = priceX + widths[3];
  const amountX = qtyX + widths[4];
  const contentTop = y + TABLE.cellPaddingY;
  const contentLineHeight = Math.round(FONTS.tableBody.size * 1.34);

  drawText(
    ctx,
    row.no,
    x + widths[0] / 2,
    y + TABLE.cellPaddingY + contentLineHeight,
    FONTS.tableBody,
    COLORS.text,
    { align: "center" }
  );

  const imageBox = TABLE.imageBox;
  const imageCenterX = imageX + widths[1] / 2;
  const imageLeft = imageCenterX - imageBox / 2;
  const imageTop = y + (rowHeight - imageBox) / 2;

  if (row.image?.src && assets.images[row.id]) {
    drawRoundedRect(
      ctx,
      imageLeft,
      imageTop,
      imageBox,
      imageBox,
      px(4),
      COLORS.white,
      COLORS.softLine,
      px(0.8)
    );
    drawImageCover(ctx, assets.images[row.id], imageLeft, imageTop, imageBox, imageBox);
  } else {
    const placeholderFill = "#F3F3F3";
    const placeholderStroke = "#D8D8D8";
    const iconStroke = "#A2A2A2";
    drawRoundedRect(
      ctx,
      imageLeft,
      imageTop,
      imageBox,
      imageBox,
      px(7),
      placeholderFill,
      placeholderStroke,
      px(0.8)
    );

    const iconSize = Math.min(imageBox * 0.5, px(24));
    const iconX = imageCenterX - iconSize / 2;
    const iconY = imageTop + imageBox / 2 - iconSize / 2;
    const iconStrokeWidth = Math.max(px(0.8), 1);
    ctx.strokeStyle = iconStroke;
    ctx.fillStyle = iconStroke;
    ctx.lineWidth = iconStrokeWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // simple photo-style icon centered in the placeholder
    drawRoundedRect(ctx, iconX, iconY, iconSize, iconSize * 0.72, px(2), null, iconStroke, iconStrokeWidth);
    const framePadding = iconSize * 0.14;
    const innerLeft = iconX + framePadding;
    const innerRight = iconX + iconSize - framePadding;
    const innerBottom = iconY + iconSize * 0.72 - framePadding;
    const sunRadius = Math.max(iconSize * 0.08, px(1.2));
    ctx.beginPath();
    ctx.arc(iconX + iconSize * 0.72, iconY + iconSize * 0.22, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(innerLeft, innerBottom);
    ctx.lineTo(iconX + iconSize * 0.42, iconY + iconSize * 0.38);
    ctx.lineTo(iconX + iconSize * 0.58, innerBottom);
    ctx.lineTo(innerRight, innerBottom);
    ctx.stroke();
  }

  const descWidth = widths[2] - TABLE.cellPaddingX * 2;
  const descXText = descX + TABLE.cellPaddingX;
  const titleBlock = row.descriptionBlocks?.[0];
  let cursorY = contentTop + contentLineHeight;
  const titleLines = measureLines(
    ctx,
    titleBlock?.value || "-",
    descWidth,
    FONTS.tableBodyBold
  );
  titleLines.forEach((line, index) => {
    drawText(
      ctx,
      line,
      descXText,
      cursorY,
      FONTS.tableBodyBold,
      COLORS.text
    );
    cursorY += Math.round(FONTS.tableBodyBold.size * 1.28);
    if (index < titleLines.length - 1) {
      cursorY += px(1);
    }
  });
  cursorY += px(2);

  (row.descriptionBlocks || []).slice(1).forEach((block, index) => {
    const labelWidth = px(62);
    drawText(ctx, block.label || "", descXText, cursorY, FONTS.tinyBold, COLORS.muted);
    const valueX = descXText + labelWidth;
    const valueWidth = descWidth - labelWidth;
    const valueLines = measureLines(ctx, block.value || "-", valueWidth, FONTS.tiny);
    valueLines.forEach((line, lineIndex) => {
      drawText(ctx, line, valueX, cursorY, FONTS.tiny, COLORS.text);
      cursorY += Math.round(FONTS.tiny.size * 1.28);
      if (lineIndex < valueLines.length - 1) {
        cursorY += px(1);
      }
    });
    if (index < (row.descriptionBlocks || []).slice(1).length - 1) {
      cursorY += px(1);
    }
  });

  const numericCenterY = y + rowHeight / 2 + px(3);
  drawText(
    ctx,
    formatCurrency(row.unitPrice, currency),
    priceX + widths[3] - TABLE.cellPaddingX,
    numericCenterY,
    FONTS.tableBody,
    COLORS.text,
    { align: "right", baseline: "middle" }
  );
  drawText(
    ctx,
    row.quantityLabel,
    qtyX + widths[4] - TABLE.cellPaddingX,
    numericCenterY,
    FONTS.tableBody,
    COLORS.text,
    { align: "right", baseline: "middle" }
  );
  drawText(
    ctx,
    formatCurrency(row.amount, currency),
    amountX + widths[5] - TABLE.cellPaddingX,
    numericCenterY,
    FONTS.tableBodyBold,
    COLORS.text,
    { align: "right", baseline: "middle" }
  );

  return rowHeight;
};

const drawSummary = (ctx, summary, currency, x, y, width) => {
  const rows = [
    { label: "Subtotal", value: formatCurrency(summary?.subtotal || 0, currency) },
    { label: `PPN ${Number(summary?.taxRate || 0)}%`, value: formatCurrency(summary?.taxAmount || 0, currency) },
    ...(summary?.feeRows || []).map((fee) => ({
      label: fee.name,
      value: formatCurrency(fee.amount || 0, currency),
    })),
  ];

  let cursorY = y;
  const rowLineHeight = Math.round(FONTS.body.size * 1.42);
  const labelWidth = width - px(96);
  rows.forEach((row) => {
    const labelLines = measureLines(ctx, row.label, labelWidth, FONTS.body);
    const valueLines = measureLines(ctx, row.value, px(90), FONTS.bodyBold);
    const rowHeight = Math.max(labelLines.length, valueLines.length) * rowLineHeight;
    drawText(ctx, row.label, x, cursorY + rowLineHeight, FONTS.body, COLORS.muted);
    drawText(
      ctx,
      row.value,
      x + width,
      cursorY + rowLineHeight,
      FONTS.bodyBold,
      COLORS.text,
      { align: "right" }
    );
    cursorY += rowHeight + px(1);
  });

  drawLine(ctx, x, cursorY + px(2), x + width, cursorY + px(2), COLORS.line, px(0.8));
  drawText(ctx, "Total", x, cursorY + px(18), FONTS.section, COLORS.text);
  drawText(
    ctx,
    formatCurrency(summary?.total || 0, currency),
    x + width,
    cursorY + px(18),
    FONTS.section,
    COLORS.text,
    { align: "right" }
  );
  return cursorY + px(32) - y;
};

const drawTextBlock = (ctx, title, paragraphs, x, y, width) => {
  drawText(ctx, title, x, y, FONTS.section, COLORS.text);
  let cursorY = y + px(16);
  const rows = paragraphs.length ? paragraphs : ["-"];
  rows.forEach((paragraph, index) => {
    cursorY += drawWrappedText(
      ctx,
      paragraph,
      x,
      cursorY,
      width,
      FONTS.body,
      COLORS.text,
      { lineHeight: Math.round(FONTS.body.size * 1.42), paragraphGap: px(2) }
    );
    if (index < rows.length - 1) {
      cursorY += px(5);
    }
  });
  return cursorY - y;
};

const drawAssignmentField = (ctx, value, x, y, width) => {
  const label = "Best Regards";
  const name = value || "-";
  const rightX = x + width;
  const labelY = y;
  const nameY = y + ASSIGNMENT_BLOCK_HEIGHT - FONTS.body.size;

  drawText(ctx, label, rightX, labelY, FONTS.bodyBold, COLORS.text, {
    align: "right",
    baseline: "top",
  });
  drawText(ctx, name, rightX, nameY, FONTS.body, COLORS.text, {
    align: "right",
    baseline: "top",
  });

  return ASSIGNMENT_BLOCK_HEIGHT;
};

const drawDisclaimer = (ctx, y, pageIndex, pageCount) => {
  const disclaimerText = "This document is issued by Labamu Manufacturing. Labamu is not responsible for its content.";
  const paginationText = `Page ${pageIndex + 1} of ${pageCount}`;
  
  const marginX = DIMENSIONS.marginX;
  const contentWidth = PAGE_WIDTH - marginX * 2;
  
  // Draw disclaimer centered
  drawText(ctx, disclaimerText, PAGE_WIDTH / 2, y, FONTS.disclaimer, COLORS.light, {
    align: "center",
    baseline: "top",
  });

  // Draw pagination on the right, same line
  drawText(ctx, paginationText, PAGE_WIDTH - marginX, y, FONTS.disclaimer, COLORS.light, {
    align: "right",
    baseline: "top",
  });
};

const drawWatermark = (ctx, status) => {
  if (!status) return;

  let watermarkText = "";
  const statusLower = String(status).toLowerCase();

  if (statusLower === "rejected" || statusLower === "canceled") {
    watermarkText = "Canceled";
  } else if (statusLower === "completed") {
    watermarkText = "Completed";
  } else if (statusLower === "ready_to_send" || statusLower === "waiting for approval") {
    watermarkText = "Waiting for Approval";
  }

  if (!watermarkText) return;

  ctx.save();
  ctx.translate(PAGE_WIDTH / 2, PAGE_HEIGHT / 2);
  ctx.rotate(-Math.PI / 4);
  
  // Responsive font size based on text length
  const fontSize = watermarkText.length > 15 ? px(70) : px(100);
  ctx.font = `bold ${fontSize}px Arial, Helvetica, sans-serif`;
  ctx.fillStyle = "rgba(180, 180, 180, 0.22)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(watermarkText, 0, 0);
  ctx.restore();
};

const drawFooter = (ctx, data, footerY, pageIndex, pageCount) => {
  // Empty since company info moved to header and pagination moved to disclaimer
};

const buildPdfBlobFromCanvases = async (pages) => {
  const pageWidthPt = 595.28;
  const pageHeightPt = 841.89;
  const pageCount = pages.length;
  const totalObjects = 2 + pageCount * 3;
  const bodies = new Array(totalObjects + 1);
  bodies[1] = encodeText(`<< /Type /Catalog /Pages 2 0 R >>`);

  const kids = [];
  for (let index = 0; index < pageCount; index += 1) {
    const pageObjNum = 3 + index * 3;
    const contentObjNum = pageObjNum + 1;
    const imageObjNum = pageObjNum + 2;
    const { canvas } = pages[index];
    kids.push(`${pageObjNum} 0 R`);

    const jpegData = canvas.toDataURL("image/jpeg", 0.95);
    const jpegBytes = bytesFromDataUrl(jpegData);
    const imageBody = concatBytes([
      encodeText(
        `<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
      ),
      jpegBytes,
      encodeText(`\nendstream`),
    ]);
    bodies[imageObjNum] = imageBody;

    const contentStream = encodeText(
      `q\n${pageWidthPt} 0 0 ${pageHeightPt} 0 0 cm\n/Im${index} Do\nQ\n`
    );
    bodies[contentObjNum] = concatBytes([
      encodeText(`<< /Length ${contentStream.length} >>\nstream\n`),
      contentStream,
      encodeText(`endstream`),
    ]);

    bodies[pageObjNum] = encodeText(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidthPt} ${pageHeightPt}] /Resources << /XObject << /Im${index} ${imageObjNum} 0 R >> >> /Contents ${contentObjNum} 0 R >>`
    );
  }

  bodies[2] = encodeText(
    `<< /Type /Pages /Count ${pageCount} /Kids [${kids.join(" ")}] >>`
  );

  const chunks = [];
  const header = encodeText("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");
  chunks.push(header);
  let byteOffset = header.length;
  const offsets = new Array(totalObjects + 1).fill(0);

  for (let objNum = 1; objNum <= totalObjects; objNum += 1) {
    offsets[objNum] = byteOffset;
    const objectBytes = bodies[objNum];
    const objectStart = encodeText(`${objNum} 0 obj\n`);
    const objectEnd = encodeText(`\nendobj\n`);
    chunks.push(objectStart, objectBytes, objectEnd);
    byteOffset += objectStart.length + objectBytes.length + objectEnd.length;
  }

  const xrefOffset = byteOffset;
  let xref = `xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`;
  for (let objNum = 1; objNum <= totalObjects; objNum += 1) {
    xref += `${String(offsets[objNum]).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(encodeText(xref));

  return new Blob(chunks, { type: "application/pdf" });
};

const renderPurchaseOrderPage = async ({
  data,
  assets,
  pageType,
  rows,
  isLastPage,
  pageIndex,
  pageCount,
}) => {
  const { canvas, ctx } = createCanvas();
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);

  const contentWidth = PAGE_WIDTH - DIMENSIONS.marginX * 2;
  const tableWidth =
    TABLE.colNo +
    TABLE.colImage +
    (contentWidth - TABLE.colNo - TABLE.colImage - TABLE.colPrice - TABLE.colQty - TABLE.colAmount) +
    TABLE.colPrice +
    TABLE.colQty +
    TABLE.colAmount;
  const widths = [
    TABLE.colNo,
    TABLE.colImage,
    tableWidth - TABLE.colNo - TABLE.colImage - TABLE.colPrice - TABLE.colQty - TABLE.colAmount,
    TABLE.colPrice,
    TABLE.colQty,
    TABLE.colAmount,
  ];

  let cursorY = await drawHeader(ctx, pageType, data, assets);

  if (pageType === "first") {
    cursorY += px(8);
    cursorY = drawInfoColumns(ctx, data, cursorY);
    cursorY += px(16);
  }

  const tableTop = cursorY;
  drawTableHeader(ctx, DIMENSIONS.marginX, tableTop, widths);
  cursorY = tableTop + DIMENSIONS.tableHeaderHeight;

  let currentY = cursorY;
  for (const row of rows) {
    const rowHeight = await drawTableRow(
      ctx,
      row,
      DIMENSIONS.marginX,
      currentY,
      widths,
      assets,
      data.currency
    );
    currentY += rowHeight;
  }

  const tableBottom = currentY;
  const fullTableHeight = tableBottom - tableTop;
  let verticalX = DIMENSIONS.marginX;
  widths.forEach((width, index) => {
    if (index > 0) {
      drawLine(ctx, verticalX, tableTop, verticalX, tableBottom, COLORS.line, px(0.8));
    }
    verticalX += width;
  });
  drawLine(ctx, DIMENSIONS.marginX, tableTop, DIMENSIONS.marginX + tableWidth, tableTop, COLORS.line, px(0.8));
  drawLine(
    ctx,
    DIMENSIONS.marginX,
    tableBottom,
    DIMENSIONS.marginX + tableWidth,
    tableBottom,
    COLORS.line,
    px(0.8)
  );
  drawLine(
    ctx,
    DIMENSIONS.marginX + tableWidth,
    tableTop,
    DIMENSIONS.marginX + tableWidth,
    tableBottom,
    COLORS.line,
    px(0.8)
  );

  if (isLastPage) {
    const summaryWidth = px(250);
    const summaryX = PAGE_WIDTH - DIMENSIONS.marginX - summaryWidth;
    let summaryY = tableBottom + px(16);
    summaryY += drawSummary(ctx, data.summary, data.currency, summaryX, summaryY, summaryWidth);
    summaryY += px(16);
    summaryY += drawTextBlock(ctx, "Notes", data.notesParagraphs, DIMENSIONS.marginX, summaryY, contentWidth);
    summaryY += px(10);
    summaryY += drawTextBlock(ctx, "Terms", data.termsParagraphs, DIMENSIONS.marginX, summaryY, contentWidth);
    const footerTop = PAGE_HEIGHT - DIMENSIONS.marginBottom - DIMENSIONS.footerHeight;
    const assignmentX = PAGE_WIDTH - DIMENSIONS.marginX - ASSIGNMENT_BLOCK_WIDTH;
    const assignmentY = Math.max(
      summaryY + px(14),
      footerTop - ASSIGNMENT_BLOCK_HEIGHT - ASSIGNMENT_BLOCK_GAP
    );
    drawAssignmentField(
      ctx,
      data.approvedBy,
      assignmentX,
      assignmentY,
      ASSIGNMENT_BLOCK_WIDTH
    );
  }

  drawFooter(
    ctx,
    data,
    PAGE_HEIGHT - DIMENSIONS.marginBottom - DIMENSIONS.footerHeight,
    pageIndex,
    pageCount
  );
  drawDisclaimer(ctx, PAGE_HEIGHT - px(18), pageIndex, pageCount);

  // Draw watermark last so it appears on top with transparency
  drawWatermark(ctx, data.currentStatus);

  return { canvas, ctx };
};

const planPages = (data) => {
  const measureCanvas = document.createElement("canvas");
  measureCanvas.width = PAGE_WIDTH;
  measureCanvas.height = PAGE_HEIGHT;
  const ctx = measureCanvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to measure PDF content.");
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const contentWidth = PAGE_WIDTH - DIMENSIONS.marginX * 2;
  const tableWidth =
    TABLE.colNo +
    TABLE.colImage +
    (contentWidth - TABLE.colNo - TABLE.colImage - TABLE.colPrice - TABLE.colQty - TABLE.colAmount) +
    TABLE.colPrice +
    TABLE.colQty +
    TABLE.colAmount;
  const widths = [
    TABLE.colNo,
    TABLE.colImage,
    tableWidth - TABLE.colNo - TABLE.colImage - TABLE.colPrice - TABLE.colQty - TABLE.colAmount,
    TABLE.colPrice,
    TABLE.colQty,
    TABLE.colAmount,
  ];

  const firstHeaderHeight = measureHeaderHeight(ctx, data, "first");
  const firstInfoHeight = px(106);
  const continuationHeaderHeight = measureHeaderHeight(ctx, data, "continuation");
  const continuationTableStart = continuationHeaderHeight;
  const contentBottom = PAGE_HEIGHT - DIMENSIONS.marginBottom - DIMENSIONS.footerHeight - px(4);
  const assignmentHeight = measureAssignmentFieldHeight(
    ctx,
    data.approvedBy || "-",
    contentWidth
  );
  const reservedTrailingHeight =
    px(18) +
    measureSummaryHeight(ctx, data.summary, data.currency, px(250)) +
    px(20) +
    measureTextBlockHeight(ctx, data.notesParagraphs, contentWidth) +
    px(20) +
    measureTextBlockHeight(ctx, data.termsParagraphs, contentWidth) +
    px(18) +
    assignmentHeight +
    px(16);

  const pages = [];
  let currentPage = {
    type: "first",
    rows: [],
  };
  let currentY =
    firstHeaderHeight +
    px(8) +
    firstInfoHeight +
    DIMENSIONS.sectionGap +
    DIMENSIONS.tableHeaderHeight;
  const rowMeasure = (row) => measureLineHeight(ctx, row, widths.reduce((sum, width) => sum + width, 0));

  data.lineItems.forEach((row, index) => {
    const rowHeight = rowMeasure(row);
    const isLastRow = index === data.lineItems.length - 1;
    const shouldBreak =
      currentY + rowHeight + (isLastRow ? reservedTrailingHeight : px(0)) > contentBottom &&
      currentPage.rows.length > 0;

    if (shouldBreak) {
      pages.push(currentPage);
      currentPage = { type: "continuation", rows: [] };
      currentY = continuationTableStart + DIMENSIONS.tableHeaderHeight;
    }

    currentPage.rows.push(row);
    currentY += rowHeight;
  });

  pages.push(currentPage);

  // ensure only the final page renders the trailing sections
  return pages.map((page, index) => ({
    ...page,
    isLastPage: index === pages.length - 1,
  }));
};

export const generatePurchaseOrderPdfBlob = async (data) => {
  if (typeof document === "undefined") {
    throw new Error("PDF export is unavailable in this environment.");
  }

  const assets = {
    logo: await loadImage(GENERIC_LOGO_SRC),
    images: {},
  };

  const pagesPlan = planPages(data);

  for (const page of pagesPlan) {
    for (const row of page.rows) {
      const src = row.image?.src;
      if (!src || assets.images[row.id]) continue;
      assets.images[row.id] = await loadImage(src);
    }
  }

  const renderedPages = [];
  for (const page of pagesPlan) {
    const rendered = await renderPurchaseOrderPage({
      data,
      assets,
      pageType: page.type,
      rows: page.rows,
      isLastPage: page.isLastPage,
      pageIndex: renderedPages.length,
      pageCount: pagesPlan.length,
    });
    renderedPages.push(rendered);
  }

  return buildPdfBlobFromCanvases(renderedPages);
};
