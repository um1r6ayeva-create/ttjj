import { 
  Document, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  BorderStyle, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  VerticalAlign,
  Packer 
} from 'docx';
import { saveAs } from 'file-saver';

interface DocumentData {
  faculty: string;
  group: string;
  name: string;
  nameInText: string;
  dorm: string;
  room: string;
  destination: string;
  customDestination: string;
  reason: string;
  customReason: string;
  dateFrom: string;
  dateTo: string;
  phone: string;
  signature: string;
  type: 'guarantee' | 'application';
  submissionDate: string;
}

export const generateGuaranteeLetterDoc = (data: DocumentData) => {
  const getReasonText = () => {
    const reasons: Record<string, string> = {
      "qishki_ta'til": "Зимние каникулы",
      "yozgi_ta'til": "Летние каникулы",
      "oilaviy_sabablar": "Семейные обстоятельства",
      "kasallik": "Болезнь",
      "boshqa": data.customReason || "Другая причина"
    };
    return reasons[data.reason] || data.reason;
  };

  const getDestinationText = () => {
    const destinations: Record<string, string> = {
      "родственникам": "к родственникам",
      "друзьям": "к друзьям",
      "другое": data.customDestination || "другое место"
    };
    return destinations[data.destination] || data.destination;
  };

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Заголовок документа
        new Paragraph({
          text: "ГАРАНТИЙНОЕ ПИСЬМО",
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          heading: "Heading1",
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" } }
        }),

        // Информация о ВУЗе
        new Paragraph({
          text: "Ташкентский университет информационных технологий",
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        new Paragraph({
          text: "имени Мухаммада ал-Хоразмий",
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        // Получатель
        new Paragraph({
          text: "Первому проректору по делам молодежи",
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: "и духовно-просветительской работе",
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: "Яхшибаеву Данияру Султанбаевичу",
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        // Таблица с данными студента
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("Факультет:")],
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.CENTER
                }),
                new TableCell({
                  children: [new Paragraph(data.faculty)],
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.CENTER
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("Группа:")],
                  verticalAlign: VerticalAlign.CENTER
                }),
                new TableCell({
                  children: [new Paragraph(data.group)],
                  verticalAlign: VerticalAlign.CENTER
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("ФИО:")],
                  verticalAlign: VerticalAlign.CENTER
                }),
                new TableCell({
                  children: [new Paragraph(data.name)],
                  verticalAlign: VerticalAlign.CENTER
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("Общежитие:")],
                  verticalAlign: VerticalAlign.CENTER
                }),
                new TableCell({
                  children: [new Paragraph(data.dorm ? `№${data.dorm}, комната ${data.room}` : "Не указано")],
                  verticalAlign: VerticalAlign.CENTER
                })
              ]
            })
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: { top: 200, bottom: 400 }
        }),

        // Основной текст гарантийного письма
        new Paragraph({
          children: [
            new TextRun({ text: "ГАРАНТИЙНОЕ ПИСЬМО", bold: true })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),

        new Paragraph({
          text: `Я, ${data.nameInText || data.name}, студент ${data.faculty} факультета, ${data.group} группы.`,
          spacing: { after: 100 }
        }),

        data.dorm && data.room ? 
          new Paragraph({
            text: `Проживаю в общежитии №${data.dorm}, комната №${data.room}.`,
            spacing: { after: 100 }
          }) : 
          new Paragraph({
            text: "",
            spacing: { after: 100 }
          }),

        new Paragraph({
          text: `Выезжаю ${getDestinationText()} в связи с ${getReasonText().toLowerCase()}.`,
          spacing: { after: 100 }
        }),

        new Paragraph({
          text: `В период с ${formatDate(data.dateFrom)} по ${formatDate(data.dateTo)} беру на себя полную ответственность за все возможные ситуации, которые могут возникнуть в процессе поездки и обратно.`,
          spacing: { after: 100 }
        }),

        new Paragraph({
          text: "Данное гарантийное письмо составлено по моему собственному желанию.",
          spacing: { after: 400 }
        }),

        // Подпись и дата
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph("Телефон:"),
                    new Paragraph(data.phone || "Не указан")
                  ],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.CENTER
                }),
                new TableCell({
                  children: [
                    new Paragraph("Дата:"),
                    new Paragraph(data.submissionDate)
                  ],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.CENTER
                })
              ]
            })
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: { top: 200, bottom: 400 }
        }),

        // Линия для подписи
        new Paragraph({
          text: "_____________________",
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        }),

        new Paragraph({
          text: data.signature,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),

        new Paragraph({
          text: "(подпись)",
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "(подпись)", italics: true })
          ]
        }),

        // Футер
        new Paragraph({
          text: `Документ сгенерирован: ${new Date().toLocaleDateString('ru-RU')}`,
          alignment: AlignmentType.CENTER,
          spacing: { before: 800 },
          children: [
            new TextRun({ text: `Документ сгенерирован: ${new Date().toLocaleDateString('ru-RU')}`, size: 20 })
          ]
        })
      ]
    }]
  });

  return doc;
};

export const generateApplicationDoc = (data: DocumentData) => {
  const getReasonText = () => {
    const reasons: Record<string, string> = {
      "qishki_ta'til": "Зимние каникулы",
      "yozgi_ta'til": "Летние каникулы",
      "oilaviy_sabablar": "Семейные обстоятельства",
      "kasallik": "Болезнь",
      "boshqa": data.customReason || "Другая причина"
    };
    return reasons[data.reason] || data.reason;
  };

  const getDestinationText = () => {
    const destinations: Record<string, string> = {
      "родственникам": "к родственникам",
      "друзьям": "к друзьям",
      "другое": data.customDestination || "другое место"
    };
    return destinations[data.destination] || data.destination;
  };

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Заголовок документа
        new Paragraph({
          text: "ЗАЯВЛЕНИЕ",
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          heading: "Heading1",
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" } }
        }),

        // Информация о ВУЗе
        new Paragraph({
          text: "Ташкентский университет информационных технологий",
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        new Paragraph({
          text: "имени Мухаммада ал-Хоразмий",
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        // Получатель
        new Paragraph({
          text: "Первому проректору по делам молодежи",
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: "и духовно-просветительской работе",
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: "Яхшибаеву Данияру Султанбаевичу",
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        // Таблица с данными студента
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("Факультет:")],
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.CENTER
                }),
                new TableCell({
                  children: [new Paragraph(data.faculty)],
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.CENTER
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("Группа:")],
                  verticalAlign: VerticalAlign.CENTER
                }),
                new TableCell({
                  children: [new Paragraph(data.group)],
                  verticalAlign: VerticalAlign.CENTER
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("ФИО:")],
                  verticalAlign: VerticalAlign.CENTER
                }),
                new TableCell({
                  children: [new Paragraph(data.name)],
                  verticalAlign: VerticalAlign.CENTER
                })
              ]
            })
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: { top: 200, bottom: 400 }
        }),

        // Основной текст заявления
        new Paragraph({
          children: [
            new TextRun({ text: "ЗАЯВЛЕНИЕ", bold: true })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),

        new Paragraph({
          text: `Прошу разрешить мне выехать из общежития в связи с ${getReasonText().toLowerCase()}.`,
          spacing: { after: 100 }
        }),

        new Paragraph({
          text: `На период с ${formatDate(data.dateFrom)} по ${formatDate(data.dateTo)} выезжаю ${getDestinationText()}.`,
          spacing: { after: 100 }
        }),

        new Paragraph({
          text: "Беру на себя полную ответственность за все возможные ситуации, которые могут возникнуть в процессе поездки и обратно.",
          spacing: { after: 400 }
        }),

        // Подпись и дата
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph("Телефон:"),
                    new Paragraph(data.phone || "Не указан")
                  ],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.CENTER
                }),
                new TableCell({
                  children: [
                    new Paragraph("Дата:"),
                    new Paragraph(data.submissionDate)
                  ],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  verticalAlign: VerticalAlign.CENTER
                })
              ]
            })
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: { top: 200, bottom: 400 }
        }),

        // Линия для подписи
        new Paragraph({
          text: "_____________________",
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        }),

        new Paragraph({
          text: data.signature,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),

        new Paragraph({
          children: [
            new TextRun({ text: "(подпись)", italics: true })
          ],
          alignment: AlignmentType.CENTER,
        }),

        // Футер
        new Paragraph({
          children: [
            new TextRun({ text: `Документ сгенерирован: ${new Date().toLocaleDateString('ru-RU')}`, size: 20 })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 800 }
        })
      ]
    }]
  });

  return doc;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

export const saveDocument = async (doc: Document, fileName: string) => {
  try {
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${fileName}.docx`);
    return true;
  } catch (error) {
    console.error('Ошибка при сохранении документа:', error);
    return false;
  }
};