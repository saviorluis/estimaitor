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
    case 'rough': return 'Rough Clean (First Stage)';
    case 'final': return 'Final Clean (Second Stage)';
    case 'powder_puff': return 'Powder Puff Clean (Third Stage)';
    case 'complete': return 'Complete Package (All Three Stages)';
    default: return type;
  }
};

// Get project type display name
const getProjectTypeDisplay = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
};

export const generateQuoteDocx = async (
  estimateData: EstimateData,
  formData: FormData,
  companyInfo: CompanyInfo,
  clientInfo: ClientInfo,
  quoteInfo: QuoteInfo
): Promise<Blob> => {
  // Create a new document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header with company and quote info
          new Paragraph({
            children: [
              new TextRun({
                text: "Professional Quote",
                size: 36,
                bold: true,
              }),
            ],
          }),
          
          // Company and Quote Info Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 50,
                      type: WidthType.PERCENTAGE,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: companyInfo.name,
                            bold: true,
                            size: 24,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [new TextRun(companyInfo.address)],
                      }),
                      new Paragraph({
                        children: [new TextRun(companyInfo.city)],
                      }),
                      new Paragraph({
                        children: [new TextRun(companyInfo.phone)],
                      }),
                      new Paragraph({
                        children: [new TextRun(companyInfo.email)],
                      }),
                      new Paragraph({
                        children: [new TextRun(companyInfo.website)],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 50,
                      type: WidthType.PERCENTAGE,
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: "QUOTE",
                            bold: true,
                            size: 32,
                            color: "0066CC",
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun(`Quote #: ${quoteInfo.quoteNumber}`)],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun(`Date: ${quoteInfo.date}`)],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [new TextRun(`Valid Until: ${quoteInfo.validUntil}`)],
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
            rows: [
              new TableRow({
                children: [
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
                            text: "Client Information",
                            bold: true,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [new TextRun(clientInfo.name || "[Client Name]")],
                      }),
                      new Paragraph({
                        children: [new TextRun(clientInfo.company || "[Company]")],
                      }),
                      new Paragraph({
                        children: [new TextRun(clientInfo.address || "[Address]")],
                      }),
                      new Paragraph({
                        children: [new TextRun(clientInfo.email || "[Email]")],
                      }),
                      new Paragraph({
                        children: [new TextRun(clientInfo.phone || "[Phone]")],
                      }),
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
                            text: "Project Information",
                            bold: true,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [new TextRun(quoteInfo.projectName || "[Project Name]")],
                      }),
                      new Paragraph({
                        children: [new TextRun(quoteInfo.projectAddress || "[Project Address]")],
                      }),
                      new Paragraph({
                        children: [new TextRun(`Project Type: ${getProjectTypeDisplay(formData.projectType)}`)],
                      }),
                      new Paragraph({
                        children: [new TextRun(`Square Footage: ${formData.squareFootage.toLocaleString()} sq ft`)],
                      }),
                      new Paragraph({
                        children: [new TextRun(`Cleaning Type: ${getCleaningTypeDisplay(formData.cleaningType)}`)],
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
          
          // Spacing
          new Paragraph({ text: "" }),
          
          // Project Timeline and Additional Info
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
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
                            text: "Project Timeline",
                            bold: true,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [new TextRun(`Estimated Hours: ${estimateData.estimatedHours} hours`)],
                      }),
                      new Paragraph({
                        children: [new TextRun(`Team Size: ${formData.numberOfCleaners} cleaners`)],
                      }),
                      new Paragraph({
                        children: [new TextRun(`Hours Per Cleaner: ${(estimateData.estimatedHours / formData.numberOfCleaners).toFixed(1)} hours`)],
                      }),
                      new Paragraph({
                        children: [new TextRun(`Estimated Completion: ${Math.ceil(estimateData.estimatedHours / (8 * formData.numberOfCleaners))} day(s)`)],
                      }),
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
            children: [
              new TextRun({
                text: "Terms & Conditions",
                bold: true,
              }),
            ],
          }),
          
          ...quoteInfo.terms.split('\n').map(line => 
            new Paragraph({
              children: [new TextRun(line)],
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
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: {
                      size: 45,
                      type: WidthType.PERCENTAGE,
                    },
                    children: [
                      new Paragraph({
                        heading: HeadingLevel.HEADING_2,
                        children: [
                          new TextRun({
                            text: "Acceptance",
                            bold: true,
                          }),
                        ],
                      }),
                      new Paragraph({ text: "" }),
                      new Paragraph({ text: "" }),
                      new Paragraph({
                        children: [new TextRun("_______________________________")],
                      }),
                      new Paragraph({
                        children: [new TextRun("Client Signature")],
                      }),
                      new Paragraph({ text: "" }),
                      new Paragraph({
                        children: [new TextRun("_______________________________")],
                      }),
                      new Paragraph({
                        children: [new TextRun("Date")],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: {
                      size: 10,
                      type: WidthType.PERCENTAGE,
                    },
                    children: [new Paragraph({ text: "" })],
                  }),
                  new TableCell({
                    width: {
                      size: 45,
                      type: WidthType.PERCENTAGE,
                    },
                    children: [
                      new Paragraph({
                        heading: HeadingLevel.HEADING_2,
                        children: [
                          new TextRun({
                            text: "Provider",
                            bold: true,
                          }),
                        ],
                      }),
                      new Paragraph({ text: "" }),
                      new Paragraph({ text: "" }),
                      new Paragraph({
                        children: [new TextRun("_______________________________")],
                      }),
                      new Paragraph({
                        children: [new TextRun("Authorized Signature")],
                      }),
                      new Paragraph({ text: "" }),
                      new Paragraph({
                        children: [new TextRun("_______________________________")],
                      }),
                      new Paragraph({
                        children: [new TextRun("Date")],
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
            children: [
              new TextRun({
                text: `Thank you for your business! | ${companyInfo.name} | ${companyInfo.phone} | ${companyInfo.email}`,
                size: 18,
                color: "666666",
              }),
            ],
          }),
        ],
      },
    ],
  });

  // Generate the document as a blob
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
            fill: "F0F0F0",
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Description",
                  bold: true,
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
            fill: "F0F0F0",
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: "Amount",
                  bold: true,
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
                  text: `${getCleaningTypeDisplay(formData.cleaningType)} - ${formData.squareFootage.toLocaleString()} sq ft`,
                  bold: true,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun(`Base Price: ${formatCurrency(estimateData.basePrice)}`),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun(`Project Type Multiplier: ${(estimateData.projectTypeMultiplier).toFixed(2)}x`),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun(`Cleaning Type Multiplier: ${(estimateData.cleaningTypeMultiplier).toFixed(2)}x`),
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
                  new TextRun(`${formData.pressureWashingArea.toLocaleString()} sq ft of exterior/concrete surfaces`),
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
                  new TextRun(`${formData.numberOfWindows} standard windows, ${formData.numberOfLargeWindows} large windows, ${formData.numberOfHighAccessWindows} high-access windows`),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun("Includes all necessary equipment and cleaning solutions"),
                ],
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun(formatCurrency(estimateData.windowCleaningCost))],
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
                new TextRun(`${formData.distanceFromOffice} miles at current gas price ($${(formData.gasPrice || 0).toFixed(2)}/gallon)`),
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
  
  // Markup if applicable
  if (formData.applyMarkup) {
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Service Fee (50%)",
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
  
  // Total
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          shading: {
            fill: "E6F0FF",
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "TOTAL",
                  bold: true,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          shading: {
            fill: "E6F0FF",
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: formatCurrency(estimateData.totalPrice),
                  bold: true,
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );
  
  return new Table({
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
} 