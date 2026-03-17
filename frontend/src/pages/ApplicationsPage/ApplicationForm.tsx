import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } from 'docx';
import './ApplicationForm.css';
import { useTranslation } from 'react-i18next';

interface ApplicationFormData {
  faculty: string;
  group: string;
  name: string;
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
}

interface UserFormData {
  name: string;
  surname: string;
  phone: string;
  room: string;
  group?: string;
  faculty?: string;
  user_id?: number;
}

interface ApplicationFormProps {
  type: 'guarantee' | 'application';
  userData?: UserFormData | null;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ type, userData, onSuccess, onError }) => {
  const { t } = useTranslation();
  const [faculty, setFaculty] = useState(userData?.faculty || '');
  const [group, setGroup] = useState(userData?.group || '');
  const [name, setName] = useState(userData?.name ? `${userData.name} ${userData.surname || ''}`.trim() : '');
  const [dorm, setDorm] = useState('');
  const [room, setRoom] = useState(userData?.room || '');
  const [destination, setDestination] = useState('родственникам');
  const [customDestination, setCustomDestination] = useState('');
  const [reason, setReason] = useState('qishki_ta\'til');
  const [customReason, setCustomReason] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const reasons = [
    { value: 'qishki_ta\'til', label: t('application.form.reasons.winter_vacation') },
    { value: 'yozgi_ta\'til', label: t('application.form.reasons.summer_vacation') },
    { value: 'oilaviy_sabablar', label: t('application.form.reasons.family_reasons') },
    { value: 'kasallik', label: t('application.form.reasons.illness') },
    { value: 'boshqa', label: t('application.form.reasons.other') }
  ];

  const destinations = [
    { value: 'родственникам', label: t('application.form.destinations.relatives') },
    { value: 'друзьям', label: t('application.form.destinations.friends') },
    { value: 'другое', label: t('application.form.destinations.other_place') }
  ];

  const dorms = ['1', '2', '3', '4'];

  const generateSignature = (fullName: string) => {
    if (!fullName.trim()) return '';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 3) {
      return `${parts[1].charAt(0)}.${parts[2].charAt(0)}.${parts[0]}`;
    } else if (parts.length === 2) {
      return `${parts[1].charAt(0)}.${parts[0]}`;
    }
    return fullName;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (value.trim()) {
      setSignature(generateSignature(value));
    }
  };

  const formatCurrentDate = () => {
    const now = new Date();
    const day = now.getDate();
    const monthNames = [
      t('application.months.january'), t('application.months.february'), t('application.months.march'),
      t('application.months.april'), t('application.months.may'), t('application.months.june'),
      t('application.months.july'), t('application.months.august'), t('application.months.september'),
      t('application.months.october'), t('application.months.november'), t('application.months.december')
    ];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    return `${day} ${month} ${year} ${t('application.form.date_suffix')}`;
  };

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setDateFrom(tomorrow.toISOString().split('T')[0]);
    setDateTo(nextWeek.toISOString().split('T')[0]);
  }, []);

  const generateDocx = async (formData: ApplicationFormData) => {
    const currentDate = formatCurrentDate();
    const reasonText = reasons.find(r => r.value === formData.reason)?.label || '';
    const fullReason = formData.reason === 'boshqa' && formData.customReason 
      ? `${reasonText}: ${formData.customReason}` 
      : reasonText;
    const destinationText = destinations.find(d => d.value === formData.destination)?.label || formData.destination;
    const fullDestination = formData.destination === 'другое' && formData.customDestination 
      ? `${destinationText}: ${formData.customDestination}` 
      : destinationText;

    const safeFonts = { main: "Times New Roman", fallback: "Arial" };
    const fontSize = { small: 24, normal: 28, large: 32, xlarge: 36 };

    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "Normal", name: "Normal", basedOn: "Normal",
            run: { font: safeFonts.main, size: fontSize.normal },
            paragraph: { spacing: { line: 276 } },
          },
          {
            id: "Heading1", name: "Heading 1", basedOn: "Normal",
            run: { font: safeFonts.main, size: fontSize.xlarge, bold: true, allCaps: true },
            paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 240 } },
          },
        ],
      },
      sections: [{
        properties: {
          page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } },
        },
        children: [
          new Paragraph({
            children: [new TextRun({ text: t('application.university'), font: safeFonts.main, size: fontSize.xlarge, bold: true })],
            style: "Heading1",
          }),
          new Paragraph({
            children: [new TextRun({ text: t('application.university_subtitle'), font: safeFonts.main, size: fontSize.normal, italics: true })],
            alignment: AlignmentType.CENTER, spacing: { after: 320 },
          }),
          new Paragraph({
            children: [new TextRun({ text: t('application.position'), font: safeFonts.main, size: fontSize.normal })],
            alignment: AlignmentType.CENTER, spacing: { after: 80 },
          }),
          new Paragraph({
            children: [new TextRun({ text: t('application.position_subtitle'), font: safeFonts.main, size: fontSize.normal })],
            alignment: AlignmentType.CENTER, spacing: { after: 240 },
          }),
          new Paragraph({
            children: [new TextRun({ text: t('application.recipient'), font: safeFonts.main, size: fontSize.normal, bold: true })],
            alignment: AlignmentType.CENTER, spacing: { after: 480 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `${t('application.form.faculty')} `, font: safeFonts.main, size: fontSize.normal, bold: true }),
              new TextRun({ text: formData.faculty, font: safeFonts.main, size: fontSize.normal }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `${t('application.form.group')} `, font: safeFonts.main, size: fontSize.normal, bold: true }),
              new TextRun({ text: formData.group, font: safeFonts.main, size: fontSize.normal }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `${t('application.form.full_name')} `, font: safeFonts.main, size: fontSize.normal, bold: true }),
              new TextRun({ text: formData.name, font: safeFonts.main, size: fontSize.normal, underline: {} }),
            ],
            spacing: { after: 320 },
          }),
          new Paragraph({
            children: [new TextRun({
              text: type === 'guarantee' ? t('application.form.guarantee_title') : t('application.form.application_title'),
              font: safeFonts.main, size: fontSize.large, bold: true, allCaps: true
            })],
            alignment: AlignmentType.CENTER, spacing: { before: 160, after: 320 },
            border: { bottom: { color: "000000", space: 4, style: BorderStyle.SINGLE, size: 8 } },
          }),
          ...(type === 'guarantee' 
            ? [
                new Paragraph({
                  children: [new TextRun({
                    text: `${t('application.documents.guarantee_text1')} ${formData.name} ${t('application.documents.guarantee_text2')} ${formData.faculty} ${t('application.documents.guarantee_text3')} ${formData.group} ${t('application.documents.guarantee_text4')}`,
                    font: safeFonts.main, size: fontSize.normal
                  })],
                  spacing: { after: 160 }, indent: { firstLine: 720 },
                }),
                ...(formData.dorm && formData.room ? [
                  new Paragraph({
                    children: [new TextRun({
                      text: `${t('application.documents.guarantee_text5')} ${formData.dorm} ${t('application.documents.guarantee_text6')} ${formData.room} ${t('application.documents.guarantee_text7')}`,
                      font: safeFonts.main, size: fontSize.normal
                    })],
                    spacing: { after: 160 }, indent: { firstLine: 720 },
                  })
                ] : []),
                new Paragraph({
                  children: [new TextRun({
                    text: `${t('application.documents.guarantee_text8')} ${fullDestination} ${t('application.documents.guarantee_text9')} ${fullReason} ${t('application.documents.guarantee_text10')}`,
                    font: safeFonts.main, size: fontSize.normal
                  })],
                  spacing: { after: 160 }, indent: { firstLine: 720 },
                }),
                new Paragraph({
                  children: [new TextRun({
                    text: `${t('application.documents.guarantee_text11')} ${formatDateForDocument(formData.dateFrom)} ${t('application.documents.guarantee_text12')} ${formatDateForDocument(formData.dateTo)} ${t('application.documents.guarantee_text13')}`,
                    font: safeFonts.main, size: fontSize.normal
                  })],
                  spacing: { after: 160 }, indent: { firstLine: 720 },
                }),
                new Paragraph({
                  children: [new TextRun({ text: t('application.documents.guarantee_text14'), font: safeFonts.main, size: fontSize.normal })],
                  spacing: { after: 320 }, indent: { firstLine: 720 },
                }),
              ]
            : [
                new Paragraph({
                  children: [new TextRun({ text: t('application.documents.application_text1'), font: safeFonts.main, size: fontSize.normal })],
                  spacing: { after: 80 }, indent: { firstLine: 720 },
                }),
                new Paragraph({
                  children: [new TextRun({ text: `${fullReason}.`, font: safeFonts.main, size: fontSize.normal })],
                  spacing: { after: 160 }, alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  children: [new TextRun({
                    text: `${t('application.documents.application_text2')} ${formatDateForDocument(formData.dateFrom)} ${t('application.documents.application_text3')} ${formatDateForDocument(formData.dateTo)} ${t('application.documents.application_text4')} ${fullDestination}.`,
                    font: safeFonts.main, size: fontSize.normal
                  })],
                  spacing: { after: 160 }, indent: { firstLine: 720 },
                }),
                new Paragraph({
                  children: [new TextRun({ text: t('application.documents.application_text5'), font: safeFonts.main, size: fontSize.normal })],
                  spacing: { after: 320 }, indent: { firstLine: 720 },
                }),
              ]
          ),
          new Paragraph({
            children: [
              new TextRun({ text: `${t('application.form.phone')} `, font: safeFonts.main, size: fontSize.normal, bold: true }),
              new TextRun({ text: formatPhoneNumber(formData.phone), font: safeFonts.main, size: fontSize.normal }),
            ],
            spacing: { after: 160 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `${t('application.form.date')} `, font: safeFonts.main, size: fontSize.normal, bold: true }),
              new TextRun({ text: currentDate, font: safeFonts.main, size: fontSize.normal }),
            ],
            spacing: { after: 160 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `${t('application.form.signature')} `, font: safeFonts.main, size: fontSize.normal, bold: true }),
              new TextRun({ text: formData.signature, font: safeFonts.main, size: fontSize.normal, underline: {} }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [new TextRun({ text: '___________________________', font: safeFonts.main, size: fontSize.normal })],
            spacing: { before: 80 }, alignment: AlignmentType.RIGHT, indent: { right: 1440 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `(${t('application.form.signature')})`, font: safeFonts.main, size: fontSize.small, italics: true })],
            spacing: { after: 200 }, alignment: AlignmentType.RIGHT, indent: { right: 1440 },
          }),
        ],
      }],
    });

    return await Packer.toBlob(doc);
  };

  const formatDateForDocument = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('998')) {
      return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 8)}-${cleaned.substring(8, 10)}-${cleaned.substring(10)}`;
    }
    return phone;
  };

  const sendToServer = async (docxBlob: Blob, formData: ApplicationFormData) => {
    try {
      const formDataToSend = new FormData();
      const fileName = `${type === 'guarantee' ? 'garantiya' : 'zayavlenie'}_${Date.now()}.docx`;
      formDataToSend.append('file', docxBlob, fileName);
      const nameParts = formData.name.trim().split(' ');
      formDataToSend.append('name', nameParts[0] || '');
      formDataToSend.append('surname', nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
      formDataToSend.append('n_room', formData.room);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('user_id', userData?.user_id?.toString() || '1');
      
      setLoading(true);
      setMessage('');
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ttjj.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/v1/applications/`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${t('application.form.validation.server_error')}: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      setMessage(t('application.form.success'));
      onSuccess();
      return result;
      
    } catch (error) {
      console.error('Ошибка отправки:', error);
      onError(t('application.form.error'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!faculty || !name || !dateFrom || !dateTo || !signature || !dorm || !room || !phone) {
      alert(t('application.form.validation.required_fields'));
      return;
    }
    if (new Date(dateFrom) > new Date(dateTo)) {
      alert(t('application.form.validation.date_error'));
      return;
    }
    if (destination === 'другое' && !customDestination) {
      alert(t('application.form.validation.destination_required'));
      return;
    }
    if (reason === 'boshqa' && !customReason) {
      alert(t('application.form.validation.reason_required'));
      return;
    }

    const formData: ApplicationFormData = {
      faculty, group, name, dorm, room, destination,
      customDestination: destination === 'другое' ? customDestination : '',
      reason, customReason: reason === 'boshqa' ? customReason : '',
      dateFrom, dateTo, phone, signature, type
    };

    try {
      const docxBlob = await generateDocx(formData);
      saveAs(docxBlob, 
        `${type === 'guarantee' ? t('application.files.guarantee') : t('application.files.application')}_${formData.name.replace(/\s+/g, '_')}_${Date.now()}.docx`
      );
      await sendToServer(docxBlob, formData);
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  useEffect(() => {
    if (userData) {
      setName(userData.name ? `${userData.name} ${userData.surname || ''}`.trim() : '');
      setPhone(userData.phone || '');
      setGroup(userData.group || '');
      setRoom(userData.room || '');
    }
  }, [userData]);

  return (
    <form onSubmit={handleSubmit} className="application-form">
      {message && (
        <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}
      
      <div className="application-document">
        <div className="document-header">
          <div className="university-name">
            {t('application.university')}<br />
            {t('application.university_subtitle')}
          </div>
          <div className="position-title">
            {t('application.position')}<br />
            {t('application.position_subtitle')}
          </div>
          <div className="recipient-title">
            {t('application.recipient')}
          </div>
        </div>

        <div className="document-content">
          <div className="content-row">
            <span className="content-label">{t('application.form.faculty')}</span>
            <input
              type="text"
              className="content-input"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              required
              placeholder={t('application.form.faculty_placeholder')}
            />
          </div>

          <div className="content-row">
            <span className="content-label">{t('application.form.group')}</span>
            <input
              type="text"
              className="content-input"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              required
              placeholder={t('application.form.group_placeholder')}
            />
          </div>

          <div className="content-row">
            <span className="content-label">{t('application.form.full_name')}</span>
            <input
              type="text"
              className="content-input"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder={t('application.form.name_placeholder')}
            />
          </div>

          <div className="content-row">
            <span className="content-label">{t('application.form.dorm')}</span>
            <select
              className="content-input"
              value={dorm}
              onChange={(e) => setDorm(e.target.value)}
              required
            >
              <option value="">{t('application.form.dorm_placeholder')}</option>
              {dorms.map((d) => (
                <option key={d} value={d}>{t(`application.form.dorm_options.dorm_${d}`)}</option>
              ))}
            </select>
          </div>

          <div className="content-row">
            <span className="content-label">{t('application.form.room')}</span>
            <input
              type="text"
              className="content-input"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              required
              placeholder={t('application.form.room_placeholder')}
            />
          </div>

          <div className="content-row">
            <span className="content-label">
              {type === 'guarantee' 
                ? t('application.form.guarantee_title') 
                : t('application.form.application_title')}
            </span>
          </div>

          {type === 'guarantee' ? (
            <>
              <div className="content-row">
                <span>{t('application.documents.guarantee_text1')} </span>
                <input
                  type="text"
                  className="content-input inline-input"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  placeholder={t('application.form.name_placeholder')}
                  style={{ width: '300px', margin: '0 10px' }}
                />
                <span>{t('application.documents.guarantee_text2')} </span>
              </div>

              <div className="content-row">
                <input
                  type="text"
                  className="content-input inline-input"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  required
                  placeholder={t('application.form.faculty_placeholder')}
                  style={{ width: '400px', marginRight: '10px' }}
                />
                <span>{t('application.documents.guarantee_text3')} </span>
              </div>

              <div className="content-row">
                <input
                  type="text"
                  className="content-input inline-input"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  required
                  placeholder={t('application.form.group_placeholder')}
                  style={{ width: '150px', marginRight: '10px' }}
                />
                <span>{t('application.documents.guarantee_text4')}</span>
              </div>

              <div className="content-row">
                <span>{t('application.documents.guarantee_text5')}</span>
                <input
                  type="text"
                  className="content-input inline-input"
                  value={dorm}
                  onChange={(e) => setDorm(e.target.value)}
                  placeholder={t('application.form.dorm_placeholder')}
                  required
                  style={{ width: '80px', margin: '0 10px' }}
                />
                <span>{t('application.documents.guarantee_text6')}</span>
                <input
                  type="text"
                  className="content-input inline-input"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder={t('application.form.room_placeholder')}
                  required
                  style={{ width: '80px', marginLeft: '10px' }}
                />
                <span>{t('application.documents.guarantee_text7')}</span>
              </div>

              <div className="content-row">
                <span>{t('application.documents.guarantee_text8')}</span>
                <select
                  className="content-input inline-input"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  style={{ width: '200px', margin: '0 10px' }}
                >
                  {destinations.map((dest) => (
                    <option key={dest.value} value={dest.value}>
                      {dest.label}
                    </option>
                  ))}
                </select>
                {destination === 'другое' && (
                  <>
                    <span> </span>
                    <input
                      type="text"
                      className="content-input inline-input"
                      value={customDestination}
                      onChange={(e) => setCustomDestination(e.target.value)}
                      required={destination === 'другое'}
                      placeholder={t('application.form.custom_destination_placeholder')}
                      style={{ width: '250px', marginLeft: '10px' }}
                    />
                  </>
                )}
                <span>{t('application.documents.guarantee_text9')}</span>
              </div>

              <div className="content-row">
                <select
                  className="content-input inline-input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  style={{ width: '300px', marginRight: '10px' }}
                >
                  {reasons.map((reasonOption) => (
                    <option key={reasonOption.value} value={reasonOption.value}>
                      {reasonOption.label}
                    </option>
                  ))}
                </select>
                {reason === 'boshqa' && (
                  <>
                    <span>{t('application.form.other_separator')}</span>
                    <input
                      type="text"
                      className="content-input inline-input"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      required={reason === 'boshqa'}
                      placeholder={t('application.form.custom_reason_placeholder')}
                      style={{ width: '300px', marginLeft: '10px' }}
                    />
                  </>
                )}
                <span>{t('application.documents.guarantee_text10')}</span>
              </div>

              <div className="content-row">
                <span>{t('application.documents.guarantee_text11')}</span>
                <input
                  type="date"
                  className="content-input inline-input"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  required
                  style={{ width: '150px', margin: '0 10px' }}
                />
                <span>{t('application.documents.guarantee_text12')}</span>
                <input
                  type="date"
                  className="content-input inline-input"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  required
                  min={dateFrom}
                  style={{ width: '150px', margin: '0 10px' }}
                />
                <span>{t('application.documents.guarantee_text13')}</span>
              </div>

              <div className="content-row">
                <span>{t('application.documents.guarantee_text14')}</span>
              </div>
            </>
          ) : (
            <>
              <div className="content-row">
                <span>{t('application.documents.application_text1')}</span>
              </div>

              <div className="content-row">
                <select
                  className="content-input inline-input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  style={{ width: '300px' }}
                >
                  {reasons.map((reasonOption) => (
                    <option key={reasonOption.value} value={reasonOption.value}>
                      {reasonOption.label}
                    </option>
                  ))}
                </select>
                {reason === 'boshqa' && (
                  <>
                    <span>{t('application.form.other_separator')}</span>
                    <input
                      type="text"
                      className="content-input inline-input"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      required={reason === 'boshqa'}
                      placeholder={t('application.form.custom_reason_placeholder')}
                      style={{ width: '300px', marginLeft: '10px' }}
                    />
                  </>
                )}
                <span>.</span>
              </div>

              <div className="content-row">
                <span>{t('application.documents.application_text2')}</span>
                <input
                  type="date"
                  className="content-input inline-input"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  required
                  style={{ width: '150px', margin: '0 10px' }}
                />
                <span>{t('application.documents.application_text3')}</span>
                <input
                  type="date"
                  className="content-input inline-input"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  required
                  min={dateFrom}
                  style={{ width: '150px', margin: '0 10px' }}
                />
                <span>{t('application.documents.application_text4')}</span>
              </div>

              <div className="content-row">
                <select
                  className="content-input inline-input"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  style={{ width: '200px', marginRight: '10px' }}
                >
                  {destinations.map((dest) => (
                    <option key={dest.value} value={dest.value}>
                      {dest.label}
                    </option>
                  ))}
                </select>
                {destination === 'другое' && (
                  <>
                    <span> </span>
                    <input
                      type="text"
                      className="content-input inline-input"
                      value={customDestination}
                      onChange={(e) => setCustomDestination(e.target.value)}
                      required={destination === 'другое'}
                      placeholder={t('application.form.custom_destination_placeholder')}
                      style={{ width: '250px', marginLeft: '10px' }}
                    />
                  </>
                )}
                <span>.</span>
              </div>

              <div className="content-row">
                <span>{t('application.documents.application_text5')}</span>
              </div>
            </>
          )}

          <div className="signature-section">
            <div className="signature-row">
              <div className="signature-item">
                <div className="content-row">
                  <span className="content-label">{t('application.form.phone')}</span>
                  <input
                    type="tel"
                    className="content-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder={t('application.form.phone_placeholder')}
                    style={{ width: '200px' }}
                  />
                </div>
              </div>
              <div className="signature-item">
                <div className="content-row">
                  <span className="content-label">{t('application.form.date')}</span>
                  <input
                    type="text"
                    className="content-input"
                    value={formatCurrentDate()}
                    readOnly
                    style={{ width: '250px', fontWeight: 'bold' }}
                  />
                </div>
              </div>
            </div>

            <div className="signature-row">
              <div className="signature-item">
                <div className="signature-line">
                  <input
                    type="text"
                    className="manual-signature"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    required
                    placeholder={t('application.form.signature_placeholder')}
                  />
                </div>
                <div className="signature-label">{t('application.form.signature')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-submit">
        <button type="submit" className="submit-btn" disabled={loading}>
          <i className="fas fa-paper-plane"></i> 
          {loading 
            ? t('application.form.sending') 
            : type === 'guarantee' 
              ? t('application.form.submit_guarantee') 
              : t('application.form.submit_application')}
        </button>
        <p className="form-note">
          {t('application.form.note')}
        </p>
      </div>
    </form>
  );
};

export default ApplicationForm;