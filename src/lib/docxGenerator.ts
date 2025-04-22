import { Document, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, HeadingLevel, ImageRun, Packer } from 'docx';
import { EstimateData, FormData } from './types';
import { formatCurrency } from './utils';

interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
}

interface ClientInfo {
  name: string;
  company: string;
  address: string;
  email: string;
  phone: string;
}

interface QuoteInfo {
  quoteNumber: string;
  date: string;
  validUntil: string;
  projectName: string;
  projectAddress: string;
  notes: string;
  terms: string;
}

// Get cleaning type display name
const getCleaningTypeDisplay = (type: string): string => {
  switch (type) {
    case 'rough': return 'Rough Clean';
    case 'final': return 'Final Clean';
    case 'rough_final': return 'Rough & Final Clean';
    case 'rough_final_touchup': return 'Rough, Final & Touch-up Clean';
    default: return type;
  }
};

// Get project type display name
const getProjectTypeDisplay = (type: string): string => {
  switch (type) {
    case 'jewelry_store': return 'Jewelry Store';
    case 'grocery_store': return 'Grocery Store';
    case 'fast_food': return 'Fast Food Restaurant';
    case 'yoga_studio': return 'Yoga Studio';
    case 'kids_fitness': return 'Children\'s Fitness Center';
    case 'bakery': return 'Bakery';
    case 'interactive_toy_store': return 'Interactive Toy Store';
    default: return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  }
};

export const generateQuoteDocx = async (
  estimateData: EstimateData,
  formData: FormData,
  companyInfo: CompanyInfo,
  clientInfo: ClientInfo,
  quoteInfo: QuoteInfo
): Promise<Blob> => {
  // Validate data before proceeding
  if (!formData || !estimateData) {
    throw new Error("Form data or estimate data is missing");
  }

  // Create a new document
  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 24,
            font: "Calibri",
          },
          paragraph: {
            spacing: {
              line: 276,
            },
          },
        },
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 32,
            bold: true,
            color: "2E74B5",
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 120,
            },
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 28,
            bold: true,
            color: "2E74B5",
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 120,
            },
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: [
          // Header with company and quote info

          // Company and Quote Info Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 50,
                      type: WidthType.PERCENTAGE,
                    },
                    verticalAlign: AlignmentType.CENTER,
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        spacing: {
                          before: 120,
                          after: 120,
                        },
                        children: [
                          new TextRun({
                            text: companyInfo.name,
                            bold: true,
                            size: 32,
                            color: "2E74B5",
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [new TextRun({ text: companyInfo.address, size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [new TextRun({ text: companyInfo.city, size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [new TextRun({ text: companyInfo.phone, size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [new TextRun({ text: companyInfo.email, size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [new TextRun({ text: companyInfo.website, size: 24 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 50,
                      type: WidthType.PERCENTAGE,
                    },
                    verticalAlign: AlignmentType.CENTER,
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: {
                          before: 120,
                          after: 120,
                        },
                        children: [
                          new TextRun({
                            text: "QUOTE",
                            bold: true,
                            size: 40,
                            color: "2E74B5",
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: `Quote #: ${quoteInfo.quoteNumber}`, size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: `Date: ${quoteInfo.date}`, size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun({ text: `Valid Until: ${quoteInfo.validUntil}`, size: 24 })],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Spacing
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),

          // Client and Project Info Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 50,
                      type: WidthType.PERCENTAGE,
                    },
                    shading: {
                      fill: "F9F9F9",
                    },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 100,
                      right: 100,
                    },
                    children: [
                      new Paragraph({
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        thematicBreak: true,
                        spacing: {
                          before: 120,
                          after: 120,
                        },
                        children: [
                          new TextRun({
                            text: "Client Information",
                            bold: true,
                            size: 28,
                            color: "2E74B5",
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: clientInfo.name || "[Client Name]", size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: clientInfo.company || "[Company]", size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: clientInfo.address || "[Address]", size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: clientInfo.email || "[Email]", size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: clientInfo.phone || "[Phone]", size: 24 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 50,
                      type: WidthType.PERCENTAGE,
                    },
                    shading: {
                      fill: "F9F9F9",
                    },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 100,
                      right: 100,
                    },
                    children: [
                      new Paragraph({
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        thematicBreak: true,
                        spacing: {
                          before: 120,
                          after: 120,
                        },
                        children: [
                          new TextRun({
                            text: "Project Information",
                            bold: true,
                            size: 28,
                            color: "2E74B5",
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: quoteInfo.projectName || "[Project Name]", size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: quoteInfo.projectAddress || "[Project Address]", size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: `Project Type: ${getProjectTypeDisplay(formData.projectType)}`, size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: `Square Footage: ${(formData.squareFootage || 0).toLocaleString()} sq ft`, size: 24 })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: `Cleaning Type: ${getCleaningTypeDisplay(formData.cleaningType)}`, size: 24 })],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Spacing
          new Paragraph({ text: "" }),

          // Service Details Heading
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: "Service Details",
                bold: true,
              }),
            ],
          }),

          // Service Details Table
          createServiceDetailsTable(estimateData, formData),

          // General note about prices
          new Paragraph({
            children: [
              new TextRun({
                text: "Note: All prices include professional-grade cleaning supplies, equipment, and labor costs.",
                italics: true,
                size: 18,
                color: "666666",
              }),
            ],
            spacing: {
              before: 120,
              after: 120,
            },
          }),

          // Spacing
          new Paragraph({ text: "" }),

          // Project Timeline and Additional Info
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 50,
                      type: WidthType.PERCENTAGE,
                    },
                    shading: {
                      fill: "F9F9F9",
                    },
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 100,
                      right: 100,
                    },
                    children: [
                      new Paragraph({
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: {
                          before: 120,
                          after: 120,
                        },
                        children: [
                          new TextRun({
                            text: "Project Timeline",
                            bold: true,
                            size: 28,
                            color: "2E74B5",
                          }),
                        ],
                      }),

                      // For three-stage cleaning type, show the three-stage schedule without hours
                      ...(formData.cleaningType === 'rough_final_touchup'
                        ? [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: {
                              before: 100,
                              after: 100,
                            },
                            children: [
                              new TextRun({
                                text: "Three-Stage Cleaning Schedule:",
                                bold: true,
                                size: 24,
                              }),
                            ],
                          }),
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            bullet: {
                              level: 0,
                            },
                            children: [
                              new TextRun({
                                text: "Rough Clean: During construction",
                                size: 24,
                              }),
                            ],
                          }),
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            bullet: {
                              level: 0,
                            },
                            children: [
                              new TextRun({
                                text: "Final Clean: After construction completion",
                                size: 24,
                              }),
                            ],
                          }),
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            bullet: {
                              level: 0,
                            },
                            children: [
                              new TextRun({
                                text: "Touch-up Clean: Before client move-in/opening",
                                size: 24,
                              }),
                            ],
                          }),
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: {
                              before: 100,
                            },
                            children: [
                              new TextRun({
                                text: "Note: These cleaning phases are performed at different stages during the construction timeline.",
                                italics: true,
                                size: 24,
                                color: "666666",
                              }),
                            ],
                          }),
                        ]
                        : [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [new TextRun({
                              text: `Team Size: ${formData.numberOfCleaners} cleaners`,
                              size: 24,
                            })],
                          }),
                        ]
                      ),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 50,
                      type: WidthType.PERCENTAGE,
                    },
                    children: [
                      new Paragraph({
                        heading: HeadingLevel.HEADING_2,
                        children: [
                          new TextRun({
                            text: "Additional Information",
                            bold: true,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [new TextRun(quoteInfo.notes)],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Spacing
          new Paragraph({ text: "" }),

          // Terms & Conditions
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 240,
              after: 120,
            },
            children: [
              new TextRun({
                text: "Terms & Conditions",
                bold: true,
                size: 28,
                color: "2E74B5",
              }),
            ],
          }),

          ...quoteInfo.terms.split('\n').map(line =>
            new Paragraph({
              alignment: AlignmentType.LEFT,
              spacing: {
                before: 60,
                after: 60,
              },
              indent: {
                left: 360,
              },
              children: [
                new TextRun({
                  text: line,
                  size: 24,
                }),
              ],
            })
          ),

          // Spacing
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),

          // Signature Section
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 45,
                      type: WidthType.PERCENTAGE,
                    },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: {
                          before: 240,
                          after: 120,
                        },
                        children: [
                          new TextRun({
                            text: "Acceptance",
                            bold: true,
                            size: 28,
                            color: "2E74B5",
                          }),
                        ],
                      }),
                      new Paragraph({ text: "" }),
                      new Paragraph({ text: "" }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "____________________________________",
                            size: 24,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "Client Signature",
                            size: 24,
                          }),
                        ],
                      }),
                      new Paragraph({ text: "" }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "____________________________________",
                            size: 24,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "Date",
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 10,
                      type: WidthType.PERCENTAGE,
                    },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [new Paragraph({ text: "" })],
                  }),
                  new TableCell({
                    width: {
                      size: 45,
                      type: WidthType.PERCENTAGE,
                    },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        heading: HeadingLevel.HEADING_2,
                        alignment: AlignmentType.CENTER,
                        spacing: {
                          before: 240,
                          after: 120,
                        },
                        children: [
                          new TextRun({
                            text: "Provider",
                            bold: true,
                            size: 28,
                            color: "2E74B5",
                          }),
                        ],
                      }),
                      new Paragraph({ text: "" }),
                      new Paragraph({ text: "" }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "____________________________________",
                            size: 24,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "Authorized Signature",
                            size: 24,
                          }),
                        ],
                      }),
                      new Paragraph({ text: "" }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "____________________________________",
                            size: 24,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: "Date",
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Footer
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            thematicBreak: true,
            spacing: {
              before: 240,
              after: 120,
            },
            children: [
              new TextRun({
                text: `Thank you for your business!`,
                size: 28,
                bold: true,
                color: "2E74B5",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${companyInfo.name} | ${companyInfo.phone} | ${companyInfo.email}`,
                size: 24,
                color: "666666",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 120,
              after: 240,
            },
            children: [
              new TextRun({
                text: "All prices include our standard supplies, equipment, labor, and service fees for professional-grade cleaning.",
                size: 22,
                color: "666666",
                italics: true,
              }),
            ],
          }),
        ],
      },
    ],
  });

  // Create the document as a blob
  return await Packer.toBlob(doc);
};

// Helper function to create the service details table
function createServiceDetailsTable(estimateData: EstimateData, formData: FormData): Table {
  const rows: TableRow[] = [];

  // Header row
  rows.push(
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: {
            size: 70,
            type: WidthType.PERCENTAGE,
          },
          shading: {
            fill: "E6E6E6",
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 2, color: "AAAAAA" },
            bottom: { style: BorderStyle.SINGLE, size: 2, color: "AAAAAA" },
            left: { style: BorderStyle.SINGLE, size: 2, color: "AAAAAA" },
            right: { style: BorderStyle.SINGLE, size: 2, color: "AAAAAA" },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Description",
                  bold: true,
                  size: 24,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: {
            size: 30,
            type: WidthType.PERCENTAGE,
          },
          shading: {
            fill: "E6E6E6",
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 2, color: "AAAAAA" },
            bottom: { style: BorderStyle.SINGLE, size: 2, color: "AAAAAA" },
            left: { style: BorderStyle.SINGLE, size: 2, color: "AAAAAA" },
            right: { style: BorderStyle.SINGLE, size: 2, color: "AAAAAA" },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Amount",
                  bold: true,
                  size: 24,
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  // Base Cleaning Service
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${getCleaningTypeDisplay(formData.cleaningType)} - ${(formData.squareFootage || 0).toLocaleString()} sq ft`,
                  bold: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun(
                  formatCurrency(
                    estimateData.basePrice *
                    estimateData.projectTypeMultiplier *
                    estimateData.cleaningTypeMultiplier
                  )
                ),
              ],
            }),
          ],
        }),
      ],
    })
  );

  // VCT Flooring if applicable
  if (formData.hasVCT) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "VCT Flooring Treatment",
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun("Stripping, waxing, and buffing of vinyl composition tile"),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun(formatCurrency(estimateData.vctCost))],
              }),
            ],
          }),
        ],
      })
    );
  }

  // Pressure Washing if applicable
  if (formData.needsPressureWashing) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Pressure Washing Services",
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun(`${(formData.pressureWashingArea || 0).toLocaleString()} sq ft of exterior/concrete surfaces`),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun("Includes equipment rental and materials"),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun(formatCurrency(estimateData.pressureWashingCost))],
              }),
            ],
          }),
        ],
      })
    );
  }

  // Window Cleaning if applicable
  if (formData.needsWindowCleaning) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Window Cleaning Services",
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun(`${(formData.numberOfWindows || 0)} standard windows, ${(formData.numberOfLargeWindows || 0)} large windows, ${(formData.numberOfHighAccessWindows || 0)} high-access windows`),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun("Includes all necessary equipment and cleaning solutions"),
                ],
              }),
              ...(formData.chargeForWindowCleaning ? [] : [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Window cleaning will be quoted separately",
                      italics: true,
                      color: "888888",
                    }),
                  ],
                }),
              ]),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun(formData.chargeForWindowCleaning ?
                    formatCurrency(estimateData.windowCleaningCost) :
                    "Separate Quote"),
                ],
              }),
            ],
          }),
        ],
      })
    );
  }

  // Travel Expenses
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Travel Expenses",
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun(`${(formData.distanceFromOffice || 0)} miles at current gas price ($${((formData.gasPrice || 0)).toFixed(2)}/gallon)`),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun(formatCurrency(estimateData.travelCost))],
            }),
          ],
        }),
      ],
    })
  );

  // Overnight Accommodations if applicable
  if (formData.stayingOvernight) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Overnight Accommodations",
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun(`${formData.numberOfNights} night(s) for ${formData.numberOfCleaners} staff members`),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun("Includes hotel and per diem expenses"),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun(formatCurrency(estimateData.overnightCost))],
              }),
            ],
          }),
        ],
      })
    );
  }

  // Urgency Adjustment if applicable
  if (estimateData.urgencyMultiplier > 1) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Urgency Adjustment",
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun(`Priority scheduling (Level ${formData.urgencyLevel}/10)`),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun(
                    formatCurrency(
                      ((estimateData.basePrice * estimateData.projectTypeMultiplier * estimateData.cleaningTypeMultiplier) +
                        estimateData.vctCost + estimateData.travelCost + estimateData.overnightCost + estimateData.pressureWashingCost) *
                      (estimateData.urgencyMultiplier - 1)
                    )
                  ),
                ],
              }),
            ],
          }),
        ],
      })
    );
  }

  // Subtotal
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          shading: {
            fill: "F0F0F0",
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Subtotal",
                  bold: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          shading: {
            fill: "F0F0F0",
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: formatCurrency(estimateData.totalBeforeMarkup),
                  bold: true,
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  // Add markup if applicable
  if (formData.applyMarkup) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: formData.cleaningType === 'rough_final_touchup' ? 'Complete Package (All Three Stages)' : 'Additional Supplies & Equipment',
                    bold: true,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun(formatCurrency(estimateData.markup))],
              }),
            ],
          }),
        ],
      })
    );
  }

  // Sales Tax
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Sales Tax (7%)",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun(formatCurrency(estimateData.salesTax))],
            }),
          ],
        }),
      ],
    })
  );

  // Total
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          shading: {
            fill: "2E74B5",
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 2, color: "2E74B5" },
            bottom: { style: BorderStyle.SINGLE, size: 2, color: "2E74B5" },
            left: { style: BorderStyle.SINGLE, size: 2, color: "2E74B5" },
            right: { style: BorderStyle.SINGLE, size: 2, color: "2E74B5" },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: "TOTAL",
                  bold: true,
                  size: 28,
                  color: "FFFFFF",
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          shading: {
            fill: "2E74B5",
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 2, color: "2E74B5" },
            bottom: { style: BorderStyle.SINGLE, size: 2, color: "2E74B5" },
            left: { style: BorderStyle.SINGLE, size: 2, color: "2E74B5" },
            right: { style: BorderStyle.SINGLE, size: 2, color: "2E74B5" },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: formatCurrency(estimateData.totalPrice),
                  bold: true,
                  size: 28,
                  color: "FFFFFF",
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  const table = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "CCCCCC",
      },
      bottom: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "CCCCCC",
      },
      left: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "CCCCCC",
      },
      right: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "CCCCCC",
      },
      insideHorizontal: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "CCCCCC",
      },
      insideVertical: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "CCCCCC",
      },
    },
    rows,
  });

  // Add markup note if applicable
  if (formData.applyMarkup) {
    return table;
  }

  return table;
} 