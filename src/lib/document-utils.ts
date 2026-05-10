// Document Generation Utilities for DOCX, PDF, and Excel
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { DocFile } from '@/types/assistant';

// Document types
export type ExportFormat = 'txt' | 'docx' | 'pdf' | 'xlsx';

// ============ DOCX Generation ============

export async function generateDocx(
  title: string,
  content: string,
  options?: {
    author?: string;
    tags?: string[];
    includeMetadata?: boolean;
  }
): Promise<void> {
  // Split content into paragraphs
  const paragraphs = content.split('\n').filter(p => p.trim());
  
  // Create document
  const doc = new Document({
    creator: 'Zara AI',
    title: title,
    description: options?.tags?.join(', '),
    sections: [{
      properties: {},
      children: [
        // Title
        new Paragraph({
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 48, // 24pt
              color: '000000',
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        // Divider line
        new Paragraph({
          border: {
            bottom: {
              color: 'CCCCCC',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
          spacing: { after: 400 },
        }),
        // Content paragraphs
        ...paragraphs.map(p => 
          new Paragraph({
            children: [
              new TextRun({
                text: p,
                size: 24, // 12pt
                color: '333333',
              }),
            ],
            spacing: { after: 200 },
          })
        ),
        // Metadata section
        ...(options?.includeMetadata ? [
          new Paragraph({
            children: [],
            spacing: { before: 400 },
          }),
          new Paragraph({
            border: {
              top: {
                color: 'CCCCCC',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Created by Zara AI | ${new Date().toLocaleString()}`,
                size: 18,
                color: '888888',
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          ...(options.tags && options.tags.length > 0 ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Tags: ${options.tags.join(', ')}`,
                  size: 18,
                  color: '888888',
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ] : []),
        ] : []),
      ],
    }],
  });

  // Generate and save
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${sanitizeFilename(title)}.docx`);
}

// ============ PDF Generation ============

export function generatePdf(
  title: string,
  content: string,
  options?: {
    author?: string;
    tags?: string[];
    fontSize?: number;
    includeMetadata?: boolean;
  }
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(title, maxWidth);
  doc.text(titleLines, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += titleLines.length * 10 + 5;

  // Divider line
  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Content
  doc.setFontSize(options?.fontSize || 12);
  doc.setFont('helvetica', 'normal');
  
  const paragraphs = content.split('\n').filter(p => p.trim());
  
  for (const paragraph of paragraphs) {
    const lines = doc.splitTextToSize(paragraph, maxWidth);
    
    // Check if we need a new page
    if (yPosition + lines.length * 6 > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.text(lines, margin, yPosition);
    yPosition += lines.length * 6 + 3;
  }

  // Metadata footer
  if (options?.includeMetadata) {
    const footerY = pageHeight - 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128);
    
    const footerText = `Created by Zara AI | ${new Date().toLocaleString()}`;
    doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });
    
    if (options.tags && options.tags.length > 0) {
      doc.text(`Tags: ${options.tags.join(', ')}`, pageWidth / 2, footerY + 5, { align: 'center' });
    }
    
    doc.setTextColor(0); // Reset color
  }

  // Save
  doc.save(`${sanitizeFilename(title)}.pdf`);
}

// ============ Excel Generation ============

export function generateExcel(
  title: string,
  content: string,
  options?: {
    tags?: string[];
    author?: string;
  }
): void {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Split content into rows (by newlines)
  const rows = content.split('\n').filter(r => r.trim());
  
  // Try to detect if content is tabular
  const isTabular = rows.some(row => row.includes('\t') || row.includes('|') || row.includes(','));
  
  let data: string[][] = [];
  
  if (isTabular) {
    // Parse as tabular data
    data = rows.map(row => {
      // Try different delimiters
      if (row.includes('\t')) {
        return row.split('\t');
      } else if (row.includes('|')) {
        return row.split('|').map(cell => cell.trim());
      } else if (row.includes(',')) {
        return row.split(',').map(cell => cell.trim());
      }
      return [row];
    });
  } else {
    // Plain text - one cell per row
    data = rows.map(row => [row]);
  }
  
  // Add title row
  data.unshift([title]);
  data.unshift([]); // Empty row for spacing
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Set column widths
  const colWidths = [{ wch: 50 }, { wch: 30 }, { wch: 30 }, { wch: 30 }];
  ws['!cols'] = colWidths;
  
  // Add metadata sheet
  const metadataWs = XLSX.utils.aoa_to_sheet([
    ['Document Information'],
    [],
    ['Title', title],
    ['Created by', 'Zara AI'],
    ['Created at', new Date().toLocaleString()],
    ['Word Count', content.split(/\s+/).filter(Boolean).length],
    ['Character Count', content.length],
    ...(options?.tags && options.tags.length > 0 ? [['Tags', options.tags.join(', ')]] : []),
  ]);
  
  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Content');
  XLSX.utils.book_append_sheet(wb, metadataWs, 'Info');
  
  // Generate and save
  XLSX.writeFile(wb, `${sanitizeFilename(title)}.xlsx`);
}

// ============ Export File to Format ============

export async function exportFile(
  file: DocFile,
  format: ExportFormat
): Promise<void> {
  const options = {
    tags: file.tags,
    includeMetadata: true,
  };

  switch (format) {
    case 'txt':
      exportAsTxt(file.title, file.content, file.tags);
      break;
    case 'docx':
      await generateDocx(file.title, file.content, options);
      break;
    case 'pdf':
      generatePdf(file.title, file.content, options);
      break;
    case 'xlsx':
      generateExcel(file.title, file.content, options);
      break;
  }
}

function exportAsTxt(title: string, content: string, tags?: string[]): void {
  let output = `${title}\n${'='.repeat(title.length)}\n\n${content}`;
  
  if (tags && tags.length > 0) {
    output += `\n\nTags: ${tags.join(', ')}`;
  }
  
  output += `\n\nCreated by Zara AI | ${new Date().toLocaleString()}`;
  
  const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${sanitizeFilename(title)}.txt`);
}

// ============ Export All Files ============

export async function exportAllFiles(
  files: DocFile[],
  format: ExportFormat
): Promise<void> {
  switch (format) {
    case 'txt':
      exportAllAsTxt(files);
      break;
    case 'docx':
      await exportAllAsDocx(files);
      break;
    case 'pdf':
      exportAllAsPdf(files);
      break;
    case 'xlsx':
      exportAllAsExcel(files);
      break;
  }
}

async function exportAllAsDocx(files: DocFile[]): Promise<void> {
  const sections = files.flatMap((file, index) => {
    const paragraphs = file.content.split('\n').filter(p => p.trim());
    
    return [
      // File title
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. ${file.title}`,
            bold: true,
            size: 36,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: index > 0 ? 400 : 0, after: 200 },
      }),
      // File content
      ...paragraphs.map(p => 
        new Paragraph({
          children: [new TextRun({ text: p, size: 24 })],
          spacing: { after: 100 },
        })
      ),
      // Tags and metadata
      new Paragraph({
        children: [
          new TextRun({
            text: `Tags: ${file.tags.join(', ') || 'None'} | Type: ${file.type} | Words: ${file.wordCount}`,
            size: 18,
            color: '888888',
            italics: true,
          }),
        ],
        spacing: { after: 300 },
      }),
    ];
  });

  const doc = new Document({
    creator: 'Zara AI',
    title: 'All Files Export',
    sections: [{
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: 'Zara AI - All Files Export',
              bold: true,
              size: 48,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Exported on ${new Date().toLocaleString()} | ${files.length} files`,
              size: 20,
              color: '888888',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        ...sections,
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'zara_all_files.docx');
}

function exportAllAsPdf(files: DocFile[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let yPosition = margin;
  let isFirstPage = true;

  for (const [index, file] of files.entries()) {
    // Add new page for each file (except first)
    if (index > 0) {
      doc.addPage();
      yPosition = margin;
      isFirstPage = false;
    }

    // File title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${file.title}`, margin, yPosition);
    yPosition += 10;

    // File content
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const paragraphs = file.content.split('\n').filter(p => p.trim());
    
    for (const paragraph of paragraphs) {
      const lines = doc.splitTextToSize(paragraph, maxWidth);
      
      if (yPosition + lines.length * 5 > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * 5 + 2;
    }

    // Metadata
    yPosition += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128);
    doc.text(`Tags: ${file.tags.join(', ') || 'None'} | Type: ${file.type} | Words: ${file.wordCount}`, margin, yPosition);
    doc.setTextColor(0);
    yPosition += 15;
  }

  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  doc.save('zara_all_files.pdf');
}

function exportAllAsExcel(files: DocFile[]): void {
  const wb = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    ['Zara AI - Files Export'],
    [`Exported: ${new Date().toLocaleString()}`],
    [`Total Files: ${files.length}`],
    [],
    ['Title', 'Type', 'Words', 'Tags', 'Created'],
    ...files.map(f => [
      f.title,
      f.type,
      f.wordCount,
      f.tags.join(', '),
      new Date(f.createdAt).toLocaleDateString(),
    ]),
  ];
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  
  // Individual file sheets
  files.forEach((file, index) => {
    const data = [
      [file.title],
      [],
      ...file.content.split('\n').filter(p => p.trim()).map(p => [p]),
      [],
      [`Tags: ${file.tags.join(', ') || 'None'}`],
      [`Type: ${file.type}`],
      [`Words: ${file.wordCount}`],
      [`Created: ${new Date(file.createdAt).toLocaleString()}`],
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const sheetName = `${(index + 1).toString().padStart(2, '0')}_${file.title.slice(0, 20)}`.replace(/[^a-zA-Z0-9_]/g, '');
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });
  
  XLSX.writeFile(wb, 'zara_all_files.xlsx');
}

function exportAllAsTxt(files: DocFile[]): void {
  let output = 'ZARA AI - ALL FILES EXPORT\n';
  output += '='.repeat(40) + '\n\n';
  
  files.forEach((file, index) => {
    output += `\n${index + 1}. ${file.title}\n`;
    output += '-'.repeat(40) + '\n';
    output += `${file.content}\n`;
    output += `Tags: ${file.tags.join(', ') || 'None'}\n`;
    output += `Type: ${file.type} | Words: ${file.wordCount}\n`;
    output += `Created: ${new Date(file.createdAt).toLocaleString()}\n`;
  });
  
  const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, 'zara_all_files.txt');
}

// ============ Helper Functions ============

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 100);
}

// ============ Export Memories ============

export async function exportMemoriesAsDocx(
  memories: Array<{ content: string; category: string; tags: string[]; importance: string; createdAt: number }>
): Promise<void> {
  const paragraphs = memories.flatMap((memory, index) => {
    const tags = memory.tags.join(', ') || 'None';
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. [${memory.category}] ${memory.content}`,
            bold: true,
            size: 24,
          }),
        ],
        spacing: { before: index > 0 ? 200 : 0, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Tags: ${tags} | Importance: ${memory.importance} | Created: ${new Date(memory.createdAt).toLocaleDateString()}`,
            size: 18,
            color: '888888',
            italics: true,
          }),
        ],
        spacing: { after: 200 },
      }),
    ];
  });

  const doc = new Document({
    creator: 'Zara AI',
    title: 'Memories Export',
    sections: [{
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: 'Zara AI - Memories Export',
              bold: true,
              size: 48,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Exported on ${new Date().toLocaleString()} | ${memories.length} memories`,
              size: 20,
              color: '888888',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        ...paragraphs,
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'zara_memories.docx');
}

export function exportMemoriesAsPdf(
  memories: Array<{ content: string; category: string; tags: string[]; importance: string; createdAt: number }>
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Zara AI - Memories Export', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128);
  doc.text(`Exported on ${new Date().toLocaleString()} | ${memories.length} memories`, pageWidth / 2, yPosition, { align: 'center' });
  doc.setTextColor(0);
  yPosition += 15;

  memories.forEach((memory, index) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. [${memory.category}]`, margin, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(memory.content, pageWidth - margin * 2);
    doc.text(lines, margin, yPosition);
    yPosition += lines.length * 5 + 3;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(128);
    doc.text(`Tags: ${memory.tags.join(', ') || 'None'} | Importance: ${memory.importance}`, margin, yPosition);
    doc.setTextColor(0);
    yPosition += 10;
  });

  doc.save('zara_memories.pdf');
}

export function exportMemoriesAsExcel(
  memories: Array<{ content: string; category: string; tags: string[]; importance: string; createdAt: number }>
): void {
  const data = [
    ['Zara AI - Memories Export'],
    [`Exported: ${new Date().toLocaleString()}`],
    [`Total: ${memories.length}`],
    [],
    ['Content', 'Category', 'Importance', 'Tags', 'Created'],
    ...memories.map(m => [
      m.content,
      m.category,
      m.importance,
      m.tags.join(', '),
      new Date(m.createdAt).toLocaleString(),
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Memories');
  XLSX.writeFile(wb, 'zara_memories.xlsx');
}
